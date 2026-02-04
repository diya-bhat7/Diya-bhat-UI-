/**
 * Airtable Sync Service
 * 
 * Handles bidirectional sync between Supabase and Airtable.
 * Changes from Airtable flow THROUGH Supabase to update the UI via realtime subscriptions.
 * 
 * INACTIVE BY DEFAULT - Set VITE_AIRTABLE_ENABLED=true to activate.
 * 
 * NOTE: TypeScript errors about 'airtable_sync_config' and 'airtable_sync_log' tables
 * will resolve after running the database migration: 00000000000001_airtable_sync.sql
 */

import { supabase } from '@/integrations/supabase/client';
import { isAirtableEnabled, airtableClient } from './client';
import type {
    AirtableCompanyRecord,
    AirtablePositionRecord,
    AirtableCandidateRecord,
    AirtableSyncConfig,
    AirtableSyncLogEntry,
} from './types';

// Transform Supabase record to Airtable format
export const transformToAirtable = {
    company: (record: Record<string, unknown>): AirtableCompanyRecord['fields'] => ({
        supabase_id: record.id as string,
        company_name: record.company_name as string,
        company_website: record.company_website as string | undefined,
        company_linkedin: record.company_linkedin as string | undefined,
        office_locations: record.office_locations as string[] | undefined,
        contact_email: record.contact_email as string,
        contact_name: record.contact_name as string,
        contact_title: record.contact_title as string | undefined,
        last_synced_at: new Date().toISOString(),
    }),

    position: (record: Record<string, unknown>): AirtablePositionRecord['fields'] => ({
        supabase_id: record.id as string,
        position_name: record.position_name as string,
        category: record.category as string | undefined,
        status: record.status as AirtablePositionRecord['fields']['status'],
        priority: record.priority as AirtablePositionRecord['fields']['priority'],
        work_type: record.work_type as AirtablePositionRecord['fields']['work_type'],
        num_roles: record.num_roles as number | undefined,
        min_experience: record.min_experience as number | undefined,
        max_experience: record.max_experience as number | undefined,
        preferred_locations: record.preferred_locations as string[] | undefined,
        hiring_start_date: record.hiring_start_date as string | undefined,
        key_requirements: record.key_requirements as string | undefined,
        last_synced_at: new Date().toISOString(),
    }),

    candidate: (record: Record<string, unknown>): AirtableCandidateRecord['fields'] => ({
        supabase_id: record.id as string,
        name: record.name as string,
        email: record.email as string,
        phone: record.phone as string | undefined,
        status: record.status as AirtableCandidateRecord['fields']['status'],
        rating: record.rating as number | undefined,
        linkedin_url: record.linkedin_url as string | undefined,
        resume_url: record.resume_url as string | undefined,
        notes: record.notes as string | undefined,
        last_synced_at: new Date().toISOString(),
    }),
};

// Transform Airtable record to Supabase format
export const transformFromAirtable = {
    company: (record: AirtableCompanyRecord): Record<string, unknown> => ({
        airtable_id: record.id,
        company_name: record.fields.company_name,
        company_website: record.fields.company_website || null,
        company_linkedin: record.fields.company_linkedin || null,
        office_locations: record.fields.office_locations || [],
        contact_email: record.fields.contact_email,
        contact_name: record.fields.contact_name,
        contact_title: record.fields.contact_title || null,
        updated_at: new Date().toISOString(),
    }),

    position: (record: AirtablePositionRecord): Record<string, unknown> => ({
        airtable_id: record.id,
        position_name: record.fields.position_name,
        category: record.fields.category || 'Other',
        status: record.fields.status || 'draft',
        priority: record.fields.priority || 'Medium',
        work_type: record.fields.work_type || 'In-Office',
        num_roles: record.fields.num_roles || 1,
        min_experience: record.fields.min_experience || 0,
        max_experience: record.fields.max_experience || 0,
        preferred_locations: record.fields.preferred_locations || [],
        hiring_start_date: record.fields.hiring_start_date || null,
        key_requirements: record.fields.key_requirements || null,
        updated_at: new Date().toISOString(),
    }),

    candidate: (record: AirtableCandidateRecord): Record<string, unknown> => ({
        airtable_id: record.id,
        name: record.fields.name,
        email: record.fields.email,
        phone: record.fields.phone || null,
        status: record.fields.status || 'new',
        rating: record.fields.rating || null,
        linkedin_url: record.fields.linkedin_url || null,
        resume_url: record.fields.resume_url || null,
        notes: record.fields.notes || null,
        updated_at: new Date().toISOString(),
    }),
};

// Supabase client cast for tables not in generated types yet
// Tables exist after running migration 00000000000001_airtable_sync.sql
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseAny = supabase as any;

// Sync service class
class AirtableSyncService {
    private config: AirtableSyncConfig | null = null;

    isEnabled(): boolean {
        return isAirtableEnabled() && this.config?.enabled === true;
    }

    async loadConfig(companyId: string): Promise<AirtableSyncConfig | null> {
        if (!isAirtableEnabled()) {
            return null;
        }

        try {
            const { data, error } = await supabaseAny
                .from('airtable_sync_config')
                .select('*')
                .eq('company_id', companyId)
                .single();

            if (error || !data) {
                return null;
            }

            this.config = data as unknown as AirtableSyncConfig;

            // Configure the Airtable client
            if (this.config.base_id) {
                airtableClient.setConfig({
                    baseId: this.config.base_id,
                    accessToken: '', // Will be set via edge function
                    companiesTableId: this.config.companies_table_id || '',
                    positionsTableId: this.config.positions_table_id || '',
                    candidatesTableId: this.config.candidates_table_id || '',
                });
            }

            return this.config;
        } catch {
            return null;
        }
    }

    // Log sync operation
    async logSync(params: {
        companyId: string;
        tableName: 'companies' | 'positions' | 'candidates';
        recordId: string;
        airtableRecordId?: string;
        direction: 'to_airtable' | 'from_airtable';
        action: 'create' | 'update' | 'delete';
        status: 'success' | 'error' | 'conflict';
        errorMessage?: string;
    }): Promise<void> {
        if (!isAirtableEnabled()) return;

        try {
            await supabaseAny.from('airtable_sync_log').insert({
                company_id: params.companyId,
                table_name: params.tableName,
                record_id: params.recordId,
                airtable_record_id: params.airtableRecordId,
                direction: params.direction,
                action: params.action,
                status: params.status,
                error_message: params.errorMessage,
            });
        } catch {
            // Silently fail if table doesn't exist yet
        }
    }

    // Get recent sync logs
    async getSyncLogs(companyId: string, limit = 50): Promise<AirtableSyncLogEntry[]> {
        if (!isAirtableEnabled()) {
            return [];
        }

        try {
            const { data } = await supabaseAny
                .from('airtable_sync_log')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false })
                .limit(limit);

            return (data as unknown as AirtableSyncLogEntry[]) || [];
        } catch {
            return [];
        }
    }
}

// Singleton export
export const airtableSyncService = new AirtableSyncService();
