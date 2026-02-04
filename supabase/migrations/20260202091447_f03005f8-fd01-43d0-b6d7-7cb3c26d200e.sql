-- Create submissions table for storing form data
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert submissions (public form)
CREATE POLICY "Anyone can submit"
  ON public.submissions
  FOR INSERT
  WITH CHECK (true);

-- Only allow viewing submissions if authenticated (for admin access later)
CREATE POLICY "Authenticated users can view submissions"
  ON public.submissions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);