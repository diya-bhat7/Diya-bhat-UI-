// Airtable Integration - Barrel export
// All exports are present but functionality is INACTIVE unless VITE_AIRTABLE_ENABLED=true

export { isAirtableEnabled, airtableClient, airtableTables } from './client';
export { airtableSyncService, transformToAirtable, transformFromAirtable } from './sync';
export type {
    AirtableCompanyRecord,
    AirtablePositionRecord,
    AirtableCandidateRecord,
    AirtableSyncConfig,
    AirtableSyncLogEntry,
    SyncDirection,
    SyncStatus,
    SyncAction,
} from './types';
