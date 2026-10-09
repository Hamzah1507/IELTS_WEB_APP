import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { drive, getFileIdByName } from '@/lib/google-drive';

// How many bytes of the MP3 head and tail to cache in memory.
// 256 KB is enough for Chrome to parse MPEG frame headers (head)
// and ID3v1 tags / VBR headers (tail) to instantly display duration.
const CACHE_SIZE = 256 * 1024;

interface AudioCacheEntry {
  fileId: string;
  size: number;
  mimeType: string;
  headBytes: Buffer;
  tailBytes: Buffer;
  timestamp: number;
}

const audioCache = new Map<string, AudioCacheEntry>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const pendingPopulations = new Map<string, Promise<AudioCacheEntry>>();

async function getCachedAudioData(cacheKey: string, folderId: string, asset: string): Promise<AudioCacheEntry> {
  const existing = audioCache.get(cacheKey);
  if (existing && Date.now() - existing.timestamp < CACHE_TTL) {
    return existing;
  }

  const pending = pendingPopulations.get(cacheKey);
  if (pending) return pending;

  const promise = (async (): Promise<AudioCacheEntry> => {
    try {
      const fileId = await getFileIdByName(asset, folderId);
      if (!fileId) throw new Error('Asset not found in Drive');

      const metaRes = await drive.files.get({ fileId, fields: 'size, mimeType' });
      const size = parseInt(metaRes.data.size || '0', 10);
      const mimeType = metaRes.data.mimeType || 'audio/mpeg';

      // We need head and tail. If the file is smaller than 2 * CACHE_SIZE, cache the whole thing in head.
      let headRange = '';
      let tailRange = '';
      
      if (size <= CACHE_SIZE * 2) {
        headRange = `bytes=0-${size - 1}`;
        // tail isn't needed
      } else {
        headRange = `bytes=0-${CACHE_SIZE - 1}`;
        tailRange = `bytes=${size - CACHE_SIZE}-${size - 1}`;
      }

      const fetchDriveRange = async (rangeHeader: string): Promise<Buffer> => {
        if (!rangeHeader) return Buffer.alloc(0);
        const res = await drive.files.get(
          { fileId, alt: 'media' },
          { responseType: 'stream', headers: { Range: rangeHeader } }
        );
        const chunks: Buffer[] = [];
        const stream = res.data as unknown as Readable;
        return new Promise((resolve, reject) => {
          stream.on('data', (c: Buffer) => chunks.push(Buffer.from(c)));
          stream.on('end', () => resolve(Buffer.concat(chunks)));
          stream.on('error', reject);
        });
      };

      const [headBytes, tailBytes] = await Promise.all([
        fetchDriveRange(headRange),
        fetchDriveRange(tailRange)
      ]);

      const entry: AudioCacheEntry = { 
        fileId, size, mimeType, headBytes, tailBytes, timestamp: Date.now() 
      };
      audioCache.set(cacheKey, entry);
      return entry;
    } finally {
      pendingPopulations.delete(cacheKey);
    }
  })();

  pendingPopulations.set(cacheKey, promise);
  return promise;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testId = searchParams.get('testId');
  const asset = searchParams.get('asset');

  if (!testId || !asset) {
    return new NextResponse('Missing testId or asset', { status: 400 });
  }

  try {
    if (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_DRIVE_TEST001_FOLDER_ID) {
      // Fallback for purely local dev without Drive configured
      const folderName = testId === 'TEST001' ? 'IELTS Mock Test 001 - 90 Minutes' : testId;
      const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), folderName, asset);

      if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
        return new NextResponse('Asset not found', { status: 404 });
      }

      const stat = fs.statSync(/*turbopackIgnore: true*/ filePath);
      const stream = fs.createReadStream(/*turbopackIgnore: true*/ filePath);
      const webStream = Readable.toWeb(stream);

      return new NextResponse(webStream as any, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': stat.size.toString(),
          'Accept-Ranges': 'bytes',
        },
      });
    }

    // Production Google Drive streaming
    let folderId = '';
    if (testId === 'TEST001') {
      folderId = process.env.GOOGLE_DRIVE_TEST001_FOLDER_ID || '';
    }

    if (!folderId) {
      return new NextResponse('Drive folder not configured', { status: 500 });
    }

    const cacheKey = `${folderId}-${asset}`;
    const cached = await getCachedAudioData(cacheKey, folderId, asset);
    const { fileId, size: fileSize, mimeType, headBytes, tailBytes } = cached;

    const range = request.headers.get('range');
    let start = 0;
    let end = fileSize - 1;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    }

    const chunkSize = (end - start) + 1;

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Length', chunkSize.toString());
    if (range) {
      headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    }

    // 1. Fully within HEAD cache
    if (start < headBytes.length && end < headBytes.length) {
      const slice = headBytes.subarray(start, end + 1);
      return new NextResponse(slice as any, { status: range ? 206 : 200, headers });
    }

    // 2. Fully within TAIL cache
    if (tailBytes.length > 0 && start >= fileSize - tailBytes.length) {
      const tailOffset = fileSize - tailBytes.length;
      const sliceStart = start - tailOffset;
      const sliceEnd = end - tailOffset;
      const slice = tailBytes.subarray(sliceStart, sliceEnd + 1);
      return new NextResponse(slice as any, { status: range ? 206 : 200, headers });
    }

    // 3. Spans HEAD cache and beyond -> serve HEAD instantly, stream rest
    if (start < headBytes.length) {
      const cachedPortion = headBytes.subarray(start);
      const driveStart = headBytes.length;

      let driveStream: Readable | null = null;
      const abortController = new AbortController();

      const combinedStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(cachedPortion));
          
          // Cast signal to any because googleapis types for AxiosRequestConfig might differ slightly
          drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream', headers: { Range: `bytes=${driveStart}-${end}` }, signal: abortController.signal as any }
          ).then(driveRes => {
            driveStream = driveRes.data as unknown as Readable;
            driveStream.on('data', (chunk: Buffer) => {
              try { controller.enqueue(new Uint8Array(chunk)); } catch { /* ignore */ }
            });
            driveStream.on('end', () => {
              try { controller.close(); } catch { /* ignore */ }
            });
            driveStream.on('error', (err) => {
              try { controller.error(err); } catch { /* ignore */ }
            });
          }).catch(err => {
            if (err.name !== 'AbortError' && err.message !== 'canceled' && !err.message.includes('abort')) {
              try { controller.error(err); } catch { /* ignore */ }
            }
          });
        },
        cancel() {
          abortController.abort();
          if (driveStream) {
            driveStream.destroy();
          }
        }
      });
      return new NextResponse(combinedStream as any, { status: range ? 206 : 200, headers });
    }

    // 4. In the middle -> stream entirely from Drive
    const driveRes = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream', headers: { Range: `bytes=${start}-${end}` } }
    );
    const webStream = Readable.toWeb(driveRes.data as unknown as Readable);
    return new NextResponse(webStream as any, { status: range ? 206 : 200, headers });

  } catch (error) {
    console.error('Error streaming audio:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
