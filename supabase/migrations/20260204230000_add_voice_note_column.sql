-- Add voice_note_url column to candidates table
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS voice_note_url TEXT;

-- Create storage bucket for voice notes if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-notes', 'voice-notes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Allow anyone to read (public bucket)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'voice-notes');

-- Allow authenticated users to upload
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'voice-notes' AND auth.role() = 'authenticated'
);
