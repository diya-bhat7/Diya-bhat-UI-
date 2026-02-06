-- Create companies table for company registration
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT,
  company_linkedin TEXT,
  company_logo TEXT,
  office_locations TEXT[] DEFAULT '{}',
  contact_email TEXT NOT NULL,
  contact_title TEXT,
  contact_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create positions table for job positions
CREATE TABLE public.positions (
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

-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Companies policies - users can only see/modify their own company
CREATE POLICY "Users can view own company" ON public.companies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company" ON public.companies
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on positions table
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Positions policies - users can only see/modify positions for their company
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

-- Create indexes for better query performance
CREATE INDEX idx_companies_user_id ON public.companies(user_id);
CREATE INDEX idx_positions_company_id ON public.positions(company_id);
CREATE INDEX idx_positions_category ON public.positions(category);
CREATE INDEX idx_positions_status ON public.positions(status);
CREATE INDEX idx_positions_priority ON public.positions(priority);
