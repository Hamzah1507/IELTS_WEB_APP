import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dirPath = path.join(process.cwd(), 'public', 'Study Material');
    
    // Ensure directory exists (just in case)
    try {
      await mkdir(dirPath, { recursive: true });
    } catch (e) {
      // Ignore if it already exists
    }

    const filePath = path.join(dirPath, file.name);
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, url: `/Study Material/${file.name}` });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
