import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name, phone, has_previous_score, previous_score, student_id, batch, course, status } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone,
        has_previous_score,
        previous_score,
        role: 'learner',
        personal_email: email,
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create record in public.students linked to the auth user ID
    const { data: studentData, error: studentError } = await supabaseAdmin.from('students').insert({
      id: authData.user.id,
      name: full_name,
      student_id: student_id,
      email,
      phone,
      batch: batch || 'Batch 1',
      course: course || 'IELTS Academic',
      status: status || 'Active',
      has_previous_score,
      previous_score
    });

    if (studentError) {
      // Best effort cleanup if student creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: 'Failed to create student profile: ' + studentError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
