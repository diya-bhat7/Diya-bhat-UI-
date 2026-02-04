-- Create a public bucket for resumes if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to the resumes bucket
CREATE POLICY "Allow public uploads to resumes"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'resumes');

-- Allow public read access to resumes (for recruiters)
CREATE POLICY "Allow public read access to resumes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- Allow anon users to read positions (for the public job board)
CREATE POLICY "Allow anon read open positions"
ON public.positions FOR SELECT
TO anon
USING (status = 'active' OR status IS NULL);

-- Allow anon users to insert candidates (the application form)
CREATE POLICY "Allow anon apply for jobs"
ON public.candidates FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anon users to read company info (to show on careers page)
CREATE POLICY "Allow anon read company info"
ON public.companies FOR SELECT
TO anon
USING (true);
