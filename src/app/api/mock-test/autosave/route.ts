import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { attemptId, studentId, currentSection, currentQuestion, remainingSeconds, answers } = body;

    if (!attemptId || !studentId) {
      return NextResponse.json({ error: "attemptId and studentId are required" }, { status: 400 });
    }

    // Use service role to bypass RLS and perform update.
    // Validate that studentId matches the attempt to prevent spoofing
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('mock_test_attempts')
      .select('student_id, status')
      .eq('id', attemptId)
      .single();

    if (fetchError || !existing || existing.student_id !== studentId) {
      return NextResponse.json({ error: "Unauthorized or invalid attempt" }, { status: 401 });
    }

    if (existing.status !== 'in_progress') {
       return NextResponse.json({ error: "Test is already submitted" }, { status: 400 });
    }

    // Update only safe fields
    const { error: updateError } = await supabaseAdmin
      .from('mock_test_attempts')
      .update({
        current_section: currentSection,
        current_question: currentQuestion,
        remaining_seconds: remainingSeconds,
        answers: answers,
        updated_at: new Date().toISOString()
      })
      .eq('id', attemptId);

    if (updateError) {
      console.error("Autosave update error:", updateError);
      return NextResponse.json({ error: "Failed to autosave" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Autosave error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
