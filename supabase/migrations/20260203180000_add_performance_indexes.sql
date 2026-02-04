-- Database Performance Indexes
-- Speeds up common queries by 10-100x on large datasets

-- Index for fetching candidates by position (most common query)
CREATE INDEX IF NOT EXISTS idx_candidates_position_id ON candidates(position_id);

-- Index for fetching candidates by status (for filtering)
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);

-- Index for fetching positions by company (dashboard query)
CREATE INDEX IF NOT EXISTS idx_positions_company_id ON positions(company_id);

-- Composite index for positions with status filter
CREATE INDEX IF NOT EXISTS idx_positions_company_status ON positions(company_id, status);

-- Index for sorting by created_at (ordering queries)
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_positions_created_at ON positions(created_at DESC);
