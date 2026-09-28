import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const payload = await request.json();
    
    const { data, error } = await supabase.from('test_submissions').insert({
      student_id: user.email || payload.email || 'unknown',
      student_name: user.user_metadata?.full_name || payload.fullName || 'Anonymous Candidate',
      test_name: 'IELTS Full Mock Test 1',
      score: 'Pending Grading',
      answers: payload,
    });

    if (error) {
      console.error('Failed to insert test submission:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Test Submission Error:', error);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}
