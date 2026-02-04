-- Relax RLS for the submissions table so the frontend (using the anon key)
-- can insert and read back rows needed for the Airtable sync flow.
-- NOTE: This makes all submissions publicly readable and insertable; that's
-- acceptable for simple demos but you may want to tighten this for production.

CREATE POLICY "Anyone can submit (public)"
  ON public.submissions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view submissions (public)"
  ON public.submissions
  FOR SELECT
  USING (true);

