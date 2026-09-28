-- 1. Create the students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  student_id TEXT,
  phone TEXT,
  email TEXT,
  batch TEXT DEFAULT 'Batch 1',
  course TEXT DEFAULT 'IELTS Academic',
  status TEXT DEFAULT 'Active',
  has_previous_score TEXT DEFAULT 'no',
  previous_score TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the study_materials table
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    section TEXT NOT NULL, -- 'practice' or 'roadmap'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the test_submissions table
CREATE TABLE IF NOT EXISTS public.test_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    test_name TEXT NOT NULL,
    score TEXT,
    answers JSONB,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create a Supabase Storage Bucket for materials
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_submissions ENABLE ROW LEVEL SECURITY;

-- 6. Setup RLS Policies

-- Students Table Policies
CREATE POLICY "Allow trainer full access on students" ON public.students
  FOR ALL USING (true) WITH CHECK (true);

-- Study Materials Policies
CREATE POLICY "Allow read for materials" ON public.study_materials 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow trainer insert for materials" ON public.study_materials 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'trainer');
CREATE POLICY "Allow trainer delete for materials" ON public.study_materials 
  FOR DELETE USING (auth.role() = 'authenticated' AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'trainer');

-- Test Submissions Policies
CREATE POLICY "Allow read for test_submissions" ON public.test_submissions 
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'trainer' OR
        auth.jwt() ->> 'email' = student_id
    )
  );
CREATE POLICY "Allow authenticated insert for test_submissions" ON public.test_submissions 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow trainer update for test_submissions" ON public.test_submissions 
  FOR UPDATE USING (auth.role() = 'authenticated' AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'trainer');

-- Storage Policies
CREATE POLICY "Allow read storage" ON storage.objects 
  FOR SELECT USING (bucket_id = 'materials' AND auth.role() = 'authenticated');
CREATE POLICY "Allow trainer insert storage" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'materials' AND auth.role() = 'authenticated' AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'trainer');
CREATE POLICY "Allow trainer delete storage" ON storage.objects 
  FOR DELETE USING (bucket_id = 'materials' AND auth.role() = 'authenticated' AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'trainer');
