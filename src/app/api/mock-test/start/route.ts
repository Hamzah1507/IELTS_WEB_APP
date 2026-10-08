import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { testId, studentId } = await request.json();

    if (!testId || !studentId) {
      return NextResponse.json({ error: "testId and studentId are required" }, { status: 400 });
    }

    // Check if an in_progress attempt already exists
    const { data: existingAttempt } = await supabaseAdmin
      .from('mock_test_attempts')
      .select('*')
      .eq('student_id', studentId)
      .eq('test_id', testId)
      .eq('status', 'in_progress')
      .single();

    if (existingAttempt) {
      return NextResponse.json({ attempt: existingAttempt });
    }

    // Initialize the test in Supabase
    // Because we use the service role, it bypasses RLS and writes directly.
    const { data: attempt, error } = await supabaseAdmin
      .from('mock_test_attempts')
      .insert({
        student_id: studentId,
        test_id: testId,
        status: 'in_progress',
        current_section: 'listening',
        remaining_seconds: 90 * 60, // 90 minutes
        answers: {},
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to initialize test attempt" }, { status: 500 });
    }

    return NextResponse.json({ attempt });
  } catch (error) {
    console.error("Error starting mock test:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
