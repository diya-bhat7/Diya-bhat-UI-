-- ============================================
-- AIRTABLE SYNC MIGRATION
-- Adds sync tracking columns and configuration tables
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ADD AIRTABLE ID COLUMNS TO EXISTING TABLES
-- ============================================

-- Companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS airtable_id TEXT UNIQUE;

-- Positions table  
ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS airtable_id TEXT UNIQUE;

-- Candidates table
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS airtable_id TEXT UNIQUE;

-- ============================================
-- 2. SYNC CONFIGURATION TABLE (Per-company settings)
-- ============================================
CREATE TABLE IF NOT EXISTS public.airtable_sync_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN DEFAULT false,
  base_id TEXT,
  companies_table_id TEXT,
  positions_table_id TEXT,
  candidates_table_id TEXT,
  sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('to_airtable', 'from_airtable', 'bidirectional')),
  last_full_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.airtable_sync_config ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own sync config" ON public.airtable_sync_config
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own sync config" ON public.airtable_sync_config
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own sync config" ON public.airtable_sync_config
  FOR UPDATE USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- ============================================
-- 3. SYNC LOG TABLE (For debugging and audit)
-- ============================================
CREATE TABLE IF NOT EXISTS public.airtable_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL CHECK (table_name IN ('companies', 'positions', 'candidates')),
  record_id UUID NOT NULL,
  airtable_record_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('to_airtable', 'from_airtable')),
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'error', 'conflict')),
  error_message TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.airtable_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS policies (read-only for users)
CREATE POLICY "Users can view own sync logs" ON public.airtable_sync_log
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_companies_airtable_id ON public.companies(airtable_id) WHERE airtable_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_positions_airtable_id ON public.positions(airtable_id) WHERE airtable_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_airtable_id ON public.candidates(airtable_id) WHERE airtable_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sync_config_company ON public.airtable_sync_config(company_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_company ON public.airtable_sync_log(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON public.airtable_sync_log(status) WHERE status = 'pending';

-- ============================================
-- 5. TRIGGER FOR SYNC QUEUE (Optional - for future use)
-- ============================================
-- This function will be called when records change to queue sync operations
CREATE OR REPLACE FUNCTION queue_airtable_sync()
RETURNS TRIGGER AS $$
DECLARE
  sync_enabled BOOLEAN;
  company_uuid UUID;
BEGIN
  -- Determine company_id based on table
  IF TG_TABLE_NAME = 'companies' THEN
    company_uuid := COALESCE(NEW.id, OLD.id);
  ELSIF TG_TABLE_NAME = 'positions' THEN
    company_uuid := COALESCE(NEW.company_id, OLD.company_id);
  ELSIF TG_TABLE_NAME = 'candidates' THEN
    SELECT p.company_id INTO company_uuid
    FROM public.positions p
    WHERE p.id = COALESCE(NEW.position_id, OLD.position_id);
  END IF;

  -- Check if sync is enabled for this company
  SELECT enabled INTO sync_enabled
  FROM public.airtable_sync_config
  WHERE company_id = company_uuid;

  -- If sync not enabled, do nothing
  IF NOT COALESCE(sync_enabled, false) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Log the change for sync processing
  INSERT INTO public.airtable_sync_log (
    company_id,
    table_name,
    record_id,
    airtable_record_id,
    direction,
    action,
    status,
    payload
  ) VALUES (
    company_uuid,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.airtable_id, OLD.airtable_id),
    'to_airtable',
    CASE TG_OP
      WHEN 'INSERT' THEN 'create'
      WHEN 'UPDATE' THEN 'update'
      WHEN 'DELETE' THEN 'delete'
    END,
    'pending',
    CASE TG_OP
      WHEN 'DELETE' THEN to_jsonb(OLD)
      ELSE to_jsonb(NEW)
    END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Triggers are created but NOT enabled by default
-- Uncomment these when ready to activate sync:

-- CREATE TRIGGER airtable_sync_companies
--   AFTER INSERT OR UPDATE OR DELETE ON public.companies
--   FOR EACH ROW EXECUTE FUNCTION queue_airtable_sync();

-- CREATE TRIGGER airtable_sync_positions
--   AFTER INSERT OR UPDATE OR DELETE ON public.positions
--   FOR EACH ROW EXECUTE FUNCTION queue_airtable_sync();

-- CREATE TRIGGER airtable_sync_candidates
--   AFTER INSERT OR UPDATE OR DELETE ON public.candidates
--   FOR EACH ROW EXECUTE FUNCTION queue_airtable_sync();

-- ============================================
-- DONE! Airtable sync infrastructure is ready.
-- Tables and triggers are present but inactive.
-- ============================================
