/**
 * useAirtableSync Hook
 * 
 * React hook for Airtable sync functionality.
 * Returns no-op functions if sync is disabled, so it's safe to use everywhere.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAirtableEnabled, airtableSyncService } from '@/integrations/airtable';
import type { AirtableSyncConfig, AirtableSyncLogEntry } from '@/integrations/airtable';

// Query keys
export const airtableSyncKeys = {
    all: ['airtable-sync'] as const,
    config: (companyId: string) => [...airtableSyncKeys.all, 'config', companyId] as const,
    logs: (companyId: string) => [...airtableSyncKeys.all, 'logs', companyId] as const,
};

// Hook for checking if Airtable is enabled
export function useAirtableEnabled() {
    return isAirtableEnabled();
}

// Hook for sync configuration
export function useAirtableSyncConfig(companyId: string | undefined) {
    const enabled = isAirtableEnabled() && !!companyId;

    return useQuery({
        queryKey: companyId ? airtableSyncKeys.config(companyId) : ['disabled'],
        queryFn: async () => {
            if (!companyId) return null;
            return airtableSyncService.loadConfig(companyId);
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Hook for sync logs
export function useAirtableSyncLogs(companyId: string | undefined, limit = 50) {
    const enabled = isAirtableEnabled() && !!companyId;

    return useQuery({
        queryKey: companyId ? airtableSyncKeys.logs(companyId) : ['disabled'],
        queryFn: async () => {
            if (!companyId) return [];
            return airtableSyncService.getSyncLogs(companyId, limit);
        },
        enabled,
        staleTime: 1000 * 30, // 30 seconds
    });
}

// Main sync hook - safe to use even when disabled
export function useAirtableSync(companyId: string | undefined) {
    const queryClient = useQueryClient();
    const isEnabled = isAirtableEnabled();
    const { data: config, isLoading: configLoading } = useAirtableSyncConfig(companyId);
    const { data: logs = [], refetch: refetchLogs } = useAirtableSyncLogs(companyId);

    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

    // Check if sync is actually active (enabled globally + enabled for company)
    const isSyncActive = isEnabled && config?.enabled === true;

    // Manual sync trigger (placeholder - actual sync happens via edge functions)
    const triggerSync = useCallback(async () => {
        if (!isSyncActive || !companyId) {
            return { success: false, message: 'Sync not enabled' };
        }

        setSyncStatus('syncing');

        try {
            // In a real implementation, this would call an edge function
            // For now, just simulate and refresh logs
            await new Promise(resolve => setTimeout(resolve, 1000));
            await refetchLogs();
            setSyncStatus('success');
            return { success: true, message: 'Sync completed' };
        } catch (error) {
            setSyncStatus('error');
            return { success: false, message: String(error) };
        }
    }, [isSyncActive, companyId, refetchLogs]);

    // Reset status after a delay
    useEffect(() => {
        if (syncStatus === 'success' || syncStatus === 'error') {
            const timer = setTimeout(() => setSyncStatus('idle'), 3000);
            return () => clearTimeout(timer);
        }
    }, [syncStatus]);

    // If not enabled, return safe no-op values
    if (!isEnabled) {
        return {
            isEnabled: false,
            isActive: false,
            config: null,
            logs: [],
            syncStatus: 'idle' as const,
            triggerSync: async () => ({ success: false, message: 'Airtable integration is disabled' }),
            isLoading: false,
        };
    }

    return {
        isEnabled: true,
        isActive: isSyncActive,
        config,
        logs,
        syncStatus,
        triggerSync,
        isLoading: configLoading,
    };
}

// Simplified hook just for status indicator
export function useAirtableSyncStatus(companyId: string | undefined) {
    const { isActive, syncStatus, logs } = useAirtableSync(companyId);

    const lastSync = logs[0]?.created_at;
    const hasErrors = logs.some(log => log.status === 'error');
    const pendingCount = logs.filter(log => log.status === 'pending').length;

    return {
        isActive,
        syncStatus,
        lastSync,
        hasErrors,
        pendingCount,
    };
}
