-- Create candidates table for tracking job applicants
CREATE TABLE public.candidates (
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

-- Enable RLS on candidates table
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Candidates policies - users can only see/modify candidates for their company's positions
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

-- Create indexes for better query performance
CREATE INDEX idx_candidates_position_id ON public.candidates(position_id);
CREATE INDEX idx_candidates_status ON public.candidates(status);
CREATE INDEX idx_candidates_email ON public.candidates(email);
