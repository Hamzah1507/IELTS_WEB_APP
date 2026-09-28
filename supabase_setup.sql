-- 1. Create the study_materials table
CREATE TABLE IF NOT EXISTS study_materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    section TEXT NOT NULL, -- 'practice' or 'roadmap'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the test_submissions table
CREATE TABLE IF NOT EXISTS test_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    test_name TEXT NOT NULL,
    score TEXT,
    answers JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create a Supabase Storage Bucket for materials
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS and setup permissive policies for development
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for materials" ON study_materials FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow trainer insert for materials" ON study_materials FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'trainer');
CREATE POLICY "Allow trainer delete for materials" ON study_materials FOR DELETE USING (auth.role() = 'authenticated' AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'trainer');

CREATE POLICY "Allow read for test_submissions" ON test_submissions FOR SELECT USING (
    auth.role() = 'authenticated' AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'trainer' OR
        auth.jwt() ->> 'email' = student_id
    )
);
CREATE POLICY "Allow authenticated insert for test_submissions" ON test_submissions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow trainer update for test_submissions" ON test_submissions FOR UPDATE USING (auth.role() = 'authenticated' AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'trainer');

CREATE POLICY "Allow read storage" ON storage.objects FOR SELECT USING (bucket_id = 'materials' AND auth.role() = 'authenticated');
CREATE POLICY "Allow trainer insert storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'materials' AND auth.role() = 'authenticated' AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'trainer');
CREATE POLICY "Allow trainer delete storage" ON storage.objects FOR DELETE USING (bucket_id = 'materials' AND auth.role() = 'authenticated' AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'trainer');
