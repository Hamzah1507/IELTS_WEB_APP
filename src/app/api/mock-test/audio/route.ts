import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { drive, getFileIdByName } from '@/lib/google-drive';

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

      return new NextResponse(stream as any, {
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

    const fileId = await getFileIdByName(asset, folderId);
    if (!fileId) {
      return new NextResponse('Asset not found in Drive', { status: 404 });
    }

    const range = request.headers.get('range');
    const reqHeaders: any = {};
    if (range) {
      reqHeaders['Range'] = range;
    }

    const driveRes = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream', headers: reqHeaders }
    );

    const headers = new Headers();
    headers.set('Content-Type', (driveRes.headers as any)['content-type'] || 'audio/mpeg');
    headers.set('Accept-Ranges', 'bytes');
    if ((driveRes.headers as any)['content-length']) {
      headers.set('Content-Length', (driveRes.headers as any)['content-length']);
    }
    if ((driveRes.headers as any)['content-range']) {
      headers.set('Content-Range', (driveRes.headers as any)['content-range']);
    }

    return new NextResponse(driveRes.data as any, {
      status: driveRes.status,
      headers
    });
  } catch (error) {
    console.error('Error streaming audio:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
