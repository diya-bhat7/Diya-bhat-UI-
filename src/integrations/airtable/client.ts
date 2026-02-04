/**
 * Airtable Client
 * 
 * This client is present but INACTIVE by default.
 * Set VITE_AIRTABLE_ENABLED=true to activate sync features.
 */

import type {
    AirtableCompanyRecord,
    AirtablePositionRecord,
    AirtableCandidateRecord,
    AirtableListResponse,
} from './types';

// Check if Airtable integration is enabled
export function isAirtableEnabled(): boolean {
    return import.meta.env.VITE_AIRTABLE_ENABLED === 'true';
}

// Airtable API configuration
interface AirtableConfig {
    baseId: string;
    accessToken: string;
    companiesTableId: string;
    positionsTableId: string;
    candidatesTableId: string;
}

// Rate limiting: Airtable allows 5 requests/second
const RATE_LIMIT_DELAY = 210; // ms between requests

let lastRequestTime = 0;

async function rateLimitedFetch(
    url: string,
    options: RequestInit
): Promise<Response> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
        await new Promise(resolve =>
            setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
        );
    }

    lastRequestTime = Date.now();
    return fetch(url, options);
}

// Base Airtable client class
class AirtableClient {
    private baseUrl = 'https://api.airtable.com/v0';
    private config: AirtableConfig | null = null;

    setConfig(config: AirtableConfig) {
        this.config = config;
    }

    private getHeaders(): HeadersInit {
        if (!this.config) {
            throw new Error('Airtable client not configured');
        }
        return {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
        };
    }

    private getTableUrl(tableId: string): string {
        if (!this.config) {
            throw new Error('Airtable client not configured');
        }
        return `${this.baseUrl}/${this.config.baseId}/${tableId}`;
    }

    // Generic list records
    async listRecords<T>(
        tableId: string,
        options?: {
            filterByFormula?: string;
            maxRecords?: number;
            offset?: string;
        }
    ): Promise<AirtableListResponse<T>> {
        if (!isAirtableEnabled()) {
            return { records: [] };
        }

        const params = new URLSearchParams();
        if (options?.filterByFormula) {
            params.set('filterByFormula', options.filterByFormula);
        }
        if (options?.maxRecords) {
            params.set('maxRecords', String(options.maxRecords));
        }
        if (options?.offset) {
            params.set('offset', options.offset);
        }

        const url = `${this.getTableUrl(tableId)}?${params}`;
        const response = await rateLimitedFetch(url, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Airtable API error: ${response.statusText}`);
        }

        return response.json();
    }

    // Generic create records
    async createRecords<T>(
        tableId: string,
        records: Array<{ fields: Record<string, unknown> }>
    ): Promise<T[]> {
        if (!isAirtableEnabled()) {
            return [];
        }

        const url = this.getTableUrl(tableId);
        const response = await rateLimitedFetch(url, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ records }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Airtable create error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        return data.records;
    }

    // Generic update records
    async updateRecords<T>(
        tableId: string,
        records: Array<{ id: string; fields: Record<string, unknown> }>
    ): Promise<T[]> {
        if (!isAirtableEnabled()) {
            return [];
        }

        const url = this.getTableUrl(tableId);
        const response = await rateLimitedFetch(url, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify({ records }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Airtable update error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        return data.records;
    }

    // Generic delete records
    async deleteRecords(tableId: string, recordIds: string[]): Promise<void> {
        if (!isAirtableEnabled()) {
            return;
        }

        // Airtable allows max 10 records per delete request
        const chunks = [];
        for (let i = 0; i < recordIds.length; i += 10) {
            chunks.push(recordIds.slice(i, i + 10));
        }

        for (const chunk of chunks) {
            const params = chunk.map(id => `records[]=${id}`).join('&');
            const url = `${this.getTableUrl(tableId)}?${params}`;

            const response = await rateLimitedFetch(url, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Airtable delete error: ${JSON.stringify(error)}`);
            }
        }
    }

    // Find record by Supabase ID
    async findBySupabaseId<T>(
        tableId: string,
        supabaseId: string
    ): Promise<T | null> {
        if (!isAirtableEnabled()) {
            return null;
        }

        const result = await this.listRecords<T>(tableId, {
            filterByFormula: `{supabase_id} = "${supabaseId}"`,
            maxRecords: 1,
        });

        return result.records[0] || null;
    }
}

// Singleton instance
export const airtableClient = new AirtableClient();

// Typed table clients
export const airtableTables = {
    companies: {
        list: (options?: Parameters<typeof airtableClient.listRecords>[1]) =>
            airtableClient.listRecords<AirtableCompanyRecord>(
                'COMPANIES_TABLE_ID', // Will be replaced with actual config
                options
            ),
        findBySupabaseId: (id: string) =>
            airtableClient.findBySupabaseId<AirtableCompanyRecord>(
                'COMPANIES_TABLE_ID',
                id
            ),
    },
    positions: {
        list: (options?: Parameters<typeof airtableClient.listRecords>[1]) =>
            airtableClient.listRecords<AirtablePositionRecord>(
                'POSITIONS_TABLE_ID',
                options
            ),
        findBySupabaseId: (id: string) =>
            airtableClient.findBySupabaseId<AirtablePositionRecord>(
                'POSITIONS_TABLE_ID',
                id
            ),
    },
    candidates: {
        list: (options?: Parameters<typeof airtableClient.listRecords>[1]) =>
            airtableClient.listRecords<AirtableCandidateRecord>(
                'CANDIDATES_TABLE_ID',
                options
            ),
        findBySupabaseId: (id: string) =>
            airtableClient.findBySupabaseId<AirtableCandidateRecord>(
                'CANDIDATES_TABLE_ID',
                id
            ),
    },
};
