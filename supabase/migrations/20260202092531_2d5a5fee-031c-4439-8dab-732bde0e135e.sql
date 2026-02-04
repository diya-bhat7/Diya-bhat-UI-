-- Add Airtable sync columns to submissions table
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS airtable_id TEXT,
ADD COLUMN IF NOT EXISTS sync_to_airtable BOOLEAN DEFAULT false;

-- Create index for faster sync queries
CREATE INDEX IF NOT EXISTS idx_submissions_sync ON public.submissions(sync_to_airtable) WHERE sync_to_airtable = true;