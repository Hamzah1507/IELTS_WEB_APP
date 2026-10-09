export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getMockTestContent } from '@/lib/google-drive';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testId = searchParams.get('testId');

  if (!testId) {
    return NextResponse.json({ error: "testId is required" }, { status: 400 });
  }

  try {
    // Fetch public questions (no answer keys!)
    const content = await getMockTestContent(testId);
    
    if (!content.test) {
        return NextResponse.json({ 
            error: "Failed to load questions from Google Drive",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            diagnostic_code: (content as any)._diagnostic_code || 'UNKNOWN_ERROR'
        }, { status: 404 });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching questions from Drive:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
