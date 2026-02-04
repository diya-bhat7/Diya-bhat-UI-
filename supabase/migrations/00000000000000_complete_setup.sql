-- ============================================
-- COMPLETE SUPABASE SETUP SCRIPT
-- Run this in Supabase SQL Editor to set up everything from scratch
-- ============================================

-- ============================================
-- 1. COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT,
  company_linkedin TEXT,
  office_locations TEXT[] DEFAULT '{}',
  contact_email TEXT NOT NULL,
  contact_title TEXT,
  contact_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view own company" ON public.companies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company" ON public.companies
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 2. POSITIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  position_name TEXT NOT NULL,
  category TEXT NOT NULL,
  min_experience INTEGER NOT NULL DEFAULT 0,
  max_experience INTEGER NOT NULL DEFAULT 0,
  work_type TEXT NOT NULL DEFAULT 'In-Office',
  preferred_locations TEXT[] DEFAULT '{}',
  in_office_days INTEGER,
  num_roles INTEGER NOT NULL DEFAULT 1,
  priority TEXT NOT NULL DEFAULT 'Medium',
  hiring_start_date DATE,
  client_jd_text TEXT,
  client_jd_file_url TEXT,
  key_requirements TEXT,
  generated_jd TEXT,
  interview_prep_doc TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Positions policies
CREATE POLICY "Users can view own company positions" ON public.positions
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert positions for own company" ON public.positions
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own company positions" ON public.positions
  FOR UPDATE USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own company positions" ON public.positions
  FOR DELETE USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- ============================================
-- 3. CANDIDATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID REFERENCES public.positions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  linkedin_url TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- new, screening, interview, offer, hired, rejected
  notes TEXT,
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Candidates policies
CREATE POLICY "Users can view candidates for own positions" ON public.candidates
  FOR SELECT USING (
    position_id IN (
      SELECT p.id FROM public.positions p
      JOIN public.companies c ON p.company_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert candidates for own positions" ON public.candidates
  FOR INSERT WITH CHECK (
    position_id IN (
      SELECT p.id FROM public.positions p
      JOIN public.companies c ON p.company_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update candidates for own positions" ON public.candidates
  FOR UPDATE USING (
    position_id IN (
      SELECT p.id FROM public.positions p
      JOIN public.companies c ON p.company_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete candidates for own positions" ON public.candidates
  FOR DELETE USING (
    position_id IN (
      SELECT p.id FROM public.positions p
      JOIN public.companies c ON p.company_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. PERFORMANCE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_company_id ON public.positions(company_id);
CREATE INDEX IF NOT EXISTS idx_positions_category ON public.positions(category);
CREATE INDEX IF NOT EXISTS idx_positions_status ON public.positions(status);
CREATE INDEX IF NOT EXISTS idx_positions_priority ON public.positions(priority);
CREATE INDEX IF NOT EXISTS idx_positions_company_status ON public.positions(company_id, status);
CREATE INDEX IF NOT EXISTS idx_positions_created_at ON public.positions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_position_id ON public.candidates(position_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON public.candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON public.candidates(created_at DESC);

-- ============================================
-- 5. ENABLE REALTIME (for live updates)
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidates;

-- ============================================
-- DONE! Your database is ready.
-- ============================================
