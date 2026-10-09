import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { drive, getFileIdByName } from '@/lib/google-drive';

interface AudioMetadataCacheEntry {
  fileId: string;
  size: number;
  mimeType: string;
  timestamp: number;
}

const metadataCache = new Map<string, AudioMetadataCacheEntry>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const pendingPopulations = new Map<string, Promise<AudioMetadataCacheEntry>>();

async function getCachedAudioMetadata(cacheKey: string, folderId: string, asset: string): Promise<AudioMetadataCacheEntry> {
  const existing = metadataCache.get(cacheKey);
  if (existing && Date.now() - existing.timestamp < CACHE_TTL) {
    return existing;
  }

  const pending = pendingPopulations.get(cacheKey);
  if (pending) return pending;

  const promise = (async (): Promise<AudioMetadataCacheEntry> => {
    try {
      const fileId = await getFileIdByName(asset, folderId);
      if (!fileId) throw new Error('Asset not found in Drive');

      const metaRes = await drive.files.get({ fileId, fields: 'size, mimeType' });
      const size = parseInt(metaRes.data.size || '0', 10);
      const mimeType = metaRes.data.mimeType || 'audio/mpeg';

      const entry: AudioMetadataCacheEntry = { 
        fileId, size, mimeType, timestamp: Date.now() 
      };
      metadataCache.set(cacheKey, entry);
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
    if (process.env.NODE_ENV === 'development') {
      // Local dev always uses the local filesystem directly (0ms latency)
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
    const cached = await getCachedAudioMetadata(cacheKey, folderId, asset);
    const { fileId, size: fileSize, mimeType } = cached;

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

    // Stream directly from Drive without blocking buffering
    const driveRes = await drive.files.get(
      { fileId, alt: 'media' },
      { 
        responseType: 'stream', 
        headers: { Range: `bytes=${start}-${end}` },
        signal: request.signal as any 
      }
    );

    const webStream = Readable.toWeb(driveRes.data as unknown as Readable);
    return new NextResponse(webStream as any, { status: range ? 206 : 200, headers });

  } catch (error) {
    console.error('Error streaming audio:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
