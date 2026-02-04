/**
 * Airtable Sync Settings Component
 * 
 * UI for configuring Airtable integration.
 * Only renders when VITE_AIRTABLE_ENABLED=true.
 */

import { useState } from 'react';
import { useAirtableSync, useAirtableEnabled } from '@/hooks/useAirtableSync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table2,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    ExternalLink,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AirtableSyncSettingsProps {
    companyId: string | undefined;
}

export function AirtableSyncSettings({ companyId }: AirtableSyncSettingsProps) {
    const isAirtableEnabled = useAirtableEnabled();
    const { isActive, config, logs, syncStatus, triggerSync, isLoading } = useAirtableSync(companyId);

    // Don't render if Airtable is globally disabled
    if (!isAirtableEnabled) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Table2 className="h-5 w-5 text-primary" />
                        <div>
                            <CardTitle className="text-lg">Airtable Sync</CardTitle>
                            <CardDescription>
                                Sync your hiring data with Airtable
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                        {isActive ? 'Connected' : 'Not Configured'}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Connection Status */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            isActive ? "bg-emerald-500" : "bg-gray-300"
                        )} />
                        <span className="text-sm font-medium">
                            {isActive ? 'Sync is active' : 'Sync is disabled'}
                        </span>
                    </div>
                    <Switch checked={isActive} disabled />
                </div>

                {/* Configuration Form (placeholder - needs API keys) */}
                {!isActive && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                            To enable sync, configure your Airtable credentials in the settings.
                        </p>
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="base-id">Airtable Base ID</Label>
                                <Input
                                    id="base-id"
                                    placeholder="appXXXXXXXXXX"
                                    disabled
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="api-key">API Key</Label>
                                <Input
                                    id="api-key"
                                    type="password"
                                    placeholder="pat.XXXX..."
                                    disabled
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Configure in Supabase
                        </Button>
                    </div>
                )}

                {/* Sync Actions */}
                {isActive && (
                    <>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={triggerSync}
                                disabled={syncStatus === 'syncing'}
                                variant="outline"
                            >
                                {syncStatus === 'syncing' ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                )}
                                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                            </Button>
                            {syncStatus === 'success' && (
                                <span className="text-sm text-emerald-600 flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    Sync complete
                                </span>
                            )}
                            {syncStatus === 'error' && (
                                <span className="text-sm text-red-600 flex items-center gap-1">
                                    <XCircle className="h-4 w-4" />
                                    Sync failed
                                </span>
                            )}
                        </div>

                        <Separator />

                        {/* Recent Sync Logs */}
                        <div>
                            <h4 className="text-sm font-medium mb-3">Recent Sync Activity</h4>
                            {logs.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No sync activity yet
                                </p>
                            ) : (
                                <ScrollArea className="h-[200px]">
                                    <div className="space-y-2">
                                        {logs.slice(0, 10).map((log) => (
                                            <div
                                                key={log.id}
                                                className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {log.status === 'success' && (
                                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                                    )}
                                                    {log.status === 'error' && (
                                                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                                                    )}
                                                    {log.status === 'pending' && (
                                                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                                                    )}
                                                    {log.status === 'conflict' && (
                                                        <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
                                                    )}
                                                    <span className="capitalize">{log.action}</span>
                                                    <span className="text-muted-foreground">
                                                        {log.table_name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(log.created_at), {
                                                        addSuffix: true,
                                                    })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// Status indicator badge for header/sidebar
export function AirtableSyncStatusBadge({ companyId }: { companyId: string | undefined }) {
    const isAirtableEnabled = useAirtableEnabled();
    const { isActive, syncStatus } = useAirtableSync(companyId);

    if (!isAirtableEnabled || !isActive) {
        return null;
    }

    return (
        <div className="flex items-center gap-1.5">
            <div
                className={cn(
                    "w-2 h-2 rounded-full",
                    syncStatus === 'syncing' && "bg-amber-500 animate-pulse",
                    syncStatus === 'success' && "bg-emerald-500",
                    syncStatus === 'error' && "bg-red-500",
                    syncStatus === 'idle' && "bg-emerald-500"
                )}
            />
            <span className="text-xs text-muted-foreground">
                {syncStatus === 'syncing' ? 'Syncing' : 'Airtable'}
            </span>
        </div>
    );
}
