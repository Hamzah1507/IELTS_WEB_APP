import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getPrivateAnswerKeys } from '@/lib/google-drive';

// Simple scoring logic for objective sections
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateScore(studentAnswers: any, answerKey: any) {
  let rawScore = 0;
  if (!answerKey || !studentAnswers) return rawScore;

  for (const [qId, ansData] of Object.entries(answerKey)) {
    const studentAns = studentAnswers[qId];
    if (!studentAns) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = ansData;
    const correct = String(data.correct).toLowerCase().trim();
    const provided = String(studentAns).toLowerCase().trim();
    
    // Check if correct or in acceptable list
    let isCorrect = provided === correct;
    if (!isCorrect && data.acceptable && Array.isArray(data.acceptable)) {
        isCorrect = data.acceptable.some((acc: string) => String(acc).toLowerCase().trim() === provided);
    }
    
    if (isCorrect) rawScore++;
  }
  return rawScore;
}

// Simple estimated band calculator (for Reading/Listening academic)
function calculateBand(rawScore: number) {
  // Simplified IELTS academic mapping
  if (rawScore >= 39) return 9.0;
  if (rawScore >= 37) return 8.5;
  if (rawScore >= 35) return 8.0;
  if (rawScore >= 33) return 7.5;
  if (rawScore >= 30) return 7.0;
  if (rawScore >= 27) return 6.5;
  if (rawScore >= 23) return 6.0;
  if (rawScore >= 19) return 5.5;
  if (rawScore >= 15) return 5.0;
  if (rawScore >= 13) return 4.5;
  if (rawScore >= 10) return 4.0;
  return 0.0;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { attemptId, studentId, testId, finalAnswers } = body;

    if (!attemptId || !studentId || !testId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('mock_test_attempts')
      .select('student_id, status, answers')
      .eq('id', attemptId)
      .single();

    if (fetchError || !existing || existing.student_id !== studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (existing.status === 'completed') {
       return NextResponse.json({ error: "Test already submitted" }, { status: 400 });
    }

    // Use finalAnswers if provided, otherwise fallback to DB answers
    const answersToScore = finalAnswers || existing.answers;

    // Fetch Private Answer Keys from Google Drive
    const { listening_answers, reading_answers } = await getPrivateAnswerKeys(testId);

    // Calculate Scores
    const listeningRaw = calculateScore(answersToScore, listening_answers);
    const readingRaw = calculateScore(answersToScore, reading_answers);
    
    const scaledListeningRaw = (listeningRaw / 20) * 40;
    const scaledReadingRaw = (readingRaw / 20) * 40;

    const scores = {
      listening: { raw: listeningRaw, max: 20, band: calculateBand(scaledListeningRaw) },
      reading: { raw: readingRaw, max: 20, band: calculateBand(scaledReadingRaw) },
      writing: { status: "pending", band: null },
      speaking: { status: "pending", band: null },
      overall: null // Pending manual/AI evaluation for W & S
    };

    // Save final state to Supabase
    const { error: updateError } = await supabaseAdmin
      .from('mock_test_attempts')
      .update({
        answers: answersToScore,
        scores: scores,
        status: 'completed',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', attemptId);

    if (updateError) {
      console.error("Submission update error:", updateError);
      return NextResponse.json({ error: "Failed to submit test" }, { status: 500 });
    }

    return NextResponse.json({ success: true, scores });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
