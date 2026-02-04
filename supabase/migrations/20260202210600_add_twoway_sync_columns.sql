-- Add columns for 2-way sync tracking
-- Prevents sync loops and enables conflict resolution

-- Add updated_at with auto-update trigger
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add source column to track where changes originated
-- Values: 'form', 'airtable', 'manual'
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'form';

-- Add last_synced_at to track when last synced to Airtable
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- Add sync_status for error tracking
-- Values: 'pending', 'synced', 'error'
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending';

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_submissions_updated_at ON public.submissions;
CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for finding records that need sync
CREATE INDEX IF NOT EXISTS idx_submissions_sync_status 
ON public.submissions(sync_status) 
WHERE sync_status = 'pending';

-- Comment for documentation
COMMENT ON COLUMN public.submissions.source IS 'Origin of last change: form, airtable, or manual';
COMMENT ON COLUMN public.submissions.sync_status IS 'Sync state: pending, synced, or error';
