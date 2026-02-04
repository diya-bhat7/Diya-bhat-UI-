# Airtable Integration - Setup Guide

## Prerequisites

- Airtable account (Free tier works, Pro recommended for automations)
- Airtable Personal Access Token
- Supabase project with Edge Functions enabled

---

## Step 1: Create Airtable Base

1. Go to [airtable.com](https://airtable.com) and log in
2. Click **"Create a base"** → Name it `Straatix Hiring`
3. Create 3 tables as defined in [airtable-schema.md](./airtable-schema.md)

### Quick Table Creation

For each table, click **"+"** to add fields with the correct types:

**Companies Table:**
```
supabase_id (Single line text)
company_name (Single line text)
company_website (URL)
company_linkedin (URL)
office_locations (Multiple select)
contact_email (Email)
contact_name (Single line text)
contact_title (Single line text)
last_synced_at (Date, include time)
```

**Positions Table:**
```
supabase_id (Single line text)
Company (Link to Companies)
position_name (Single line text)
category (Single select: Engineering, Sales, Marketing, Operations, Design, Other)
status (Single select: draft, active, paused, closed)
priority (Single select: Low, Medium, High, Urgent)
work_type (Single select: Remote, Hybrid, In-Office)
num_roles (Number)
min_experience (Number)
max_experience (Number)
preferred_locations (Multiple select)
hiring_start_date (Date)
key_requirements (Long text)
last_synced_at (Date, include time)
```

**Candidates Table:**
```
supabase_id (Single line text)
Position (Link to Positions)
name (Single line text)
email (Email)
phone (Phone number)
status (Single select: new, screening, interview, offer, hired, rejected)
rating (Rating, 5 star)
linkedin_url (URL)
resume_url (URL)
notes (Long text)
last_synced_at (Date, include time)
```

---

## Step 2: Get Airtable Credentials

### Get Personal Access Token

1. Go to [airtable.com/account](https://airtable.com/account)
2. Click **"Developer hub"** in the sidebar
3. Click **"Create new token"**
4. Name it `Straatix Sync Token`
5. Add scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
6. Select your `Straatix Hiring` base
7. Click **Create token** and copy it

### Get Base ID

1. Open your Airtable base
2. Look at the URL: `https://airtable.com/appXXXXXXXXXXXX/...`
3. Copy the part starting with `app` (e.g., `appABC123xyz`)

### Get Table IDs

1. Click **"Help"** → **"API documentation"**
2. Select your base
3. Each table shows its ID starting with `tbl`

---

## Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
# Airtable Configuration
VITE_AIRTABLE_ENABLED=false                    # Set to 'true' when ready to enable
AIRTABLE_PERSONAL_ACCESS_TOKEN=pat.xxxxx       # Your token
AIRTABLE_BASE_ID=appXXXXXXXXXX                 # Your base ID
AIRTABLE_COMPANIES_TABLE_ID=tblXXXXXX          # Companies table ID
AIRTABLE_POSITIONS_TABLE_ID=tblXXXXXX          # Positions table ID
AIRTABLE_CANDIDATES_TABLE_ID=tblXXXXXX         # Candidates table ID
```

Add to Supabase Edge Functions secrets:
```bash
supabase secrets set AIRTABLE_PERSONAL_ACCESS_TOKEN=pat.xxxxx
supabase secrets set AIRTABLE_BASE_ID=appXXXXXXXXXX
```

---

## Step 4: Run Database Migration

Execute this SQL in Supabase SQL Editor:

```sql
-- Add Airtable sync tracking to existing tables
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS airtable_id TEXT;
ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS airtable_id TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS airtable_id TEXT;

-- Sync configuration table
CREATE TABLE IF NOT EXISTS public.airtable_sync_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  base_id TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_direction TEXT DEFAULT 'bidirectional', -- supabase_to_airtable, airtable_to_supabase, bidirectional
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync log for debugging
CREATE TABLE IF NOT EXISTS public.airtable_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  direction TEXT NOT NULL, -- 'to_airtable' or 'from_airtable'
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  status TEXT NOT NULL, -- 'success', 'error', 'conflict'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_companies_airtable_id ON public.companies(airtable_id);
CREATE INDEX IF NOT EXISTS idx_positions_airtable_id ON public.positions(airtable_id);
CREATE INDEX IF NOT EXISTS idx_candidates_airtable_id ON public.candidates(airtable_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_company ON public.airtable_sync_log(company_id, created_at DESC);
```

---

## Step 5: Verify Setup

### Checklist

- [ ] Airtable base created with 3 tables
- [ ] All field types match schema
- [ ] Personal Access Token generated
- [ ] Base ID and Table IDs collected
- [ ] Environment variables added
- [ ] Database migration executed
- [ ] `VITE_AIRTABLE_ENABLED` is `false` (stays inactive until you enable it)

---

## Next Steps

Once setup is complete, the integration will:
1. Show **"Airtable Sync"** option in Settings (disabled by default)
2. Allow you to enable/disable sync per company
3. Sync changes in real-time when enabled
4. Show sync status indicators in the UI

**To activate:** Set `VITE_AIRTABLE_ENABLED=true` in `.env` after implementation is complete.
