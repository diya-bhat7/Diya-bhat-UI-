// Airtable record types matching the schema

export interface AirtableCompanyRecord {
    id: string; // Airtable record ID
    fields: {
        supabase_id?: string;
        company_name: string;
        company_website?: string;
        company_linkedin?: string;
        office_locations?: string[];
        contact_email: string;
        contact_name: string;
        contact_title?: string;
        last_synced_at?: string;
    };
}

export interface AirtablePositionRecord {
    id: string;
    fields: {
        supabase_id?: string;
        Company?: string[]; // Linked record IDs
        position_name: string;
        category?: string;
        status?: 'draft' | 'active' | 'paused' | 'closed';
        priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
        work_type?: 'Remote' | 'Hybrid' | 'In-Office';
        num_roles?: number;
        min_experience?: number;
        max_experience?: number;
        preferred_locations?: string[];
        hiring_start_date?: string;
        key_requirements?: string;
        last_synced_at?: string;
    };
}

export interface AirtableCandidateRecord {
    id: string;
    fields: {
        supabase_id?: string;
        Position?: string[]; // Linked record IDs
        name: string;
        email: string;
        phone?: string;
        status?: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
        rating?: number;
        linkedin_url?: string;
        resume_url?: string;
        notes?: string;
        last_synced_at?: string;
    };
}

// API response types
export interface AirtableListResponse<T> {
    records: T[];
    offset?: string;
}

export interface AirtableCreateResponse<T> {
    records: T[];
}

export interface AirtableUpdateResponse<T> {
    records: T[];
}

// Sync configuration type
export interface AirtableSyncConfig {
    id: string;
    company_id: string;
    enabled: boolean;
    base_id: string | null;
    companies_table_id: string | null;
    positions_table_id: string | null;
    candidates_table_id: string | null;
    sync_direction: 'to_airtable' | 'from_airtable' | 'bidirectional';
    last_full_sync_at: string | null;
    created_at: string;
    updated_at: string;
}

// Sync log entry type
export interface AirtableSyncLogEntry {
    id: string;
    company_id: string;
    table_name: 'companies' | 'positions' | 'candidates';
    record_id: string;
    airtable_record_id: string | null;
    direction: 'to_airtable' | 'from_airtable';
    action: 'create' | 'update' | 'delete';
    status: 'pending' | 'success' | 'error' | 'conflict';
    error_message: string | null;
    payload: Record<string, unknown> | null;
    created_at: string;
}

// Mapping utilities
export type SyncDirection = 'to_airtable' | 'from_airtable' | 'bidirectional';
export type SyncStatus = 'pending' | 'success' | 'error' | 'conflict';
export type SyncAction = 'create' | 'update' | 'delete';
