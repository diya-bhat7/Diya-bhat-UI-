import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CandidateStatus } from '@/components/candidates/CandidateStatusBadge';

// Candidate type matching the component interface
export interface Candidate {
    id: string;
    position_id: string;
    name: string;
    email: string;
    phone?: string;
    resume_url?: string;
    linkedin_url?: string;
    status: CandidateStatus;
    notes?: string;
    rating?: number;
    created_at: string;
    updated_at: string;
}

type CandidateInsert = Omit<Candidate, 'id' | 'created_at' | 'updated_at'>;
type CandidateUpdate = Partial<CandidateInsert> & { id: string };

// Query keys for cache management
export const candidateKeys = {
    all: ['candidates'] as const,
    lists: () => [...candidateKeys.all, 'list'] as const,
    list: (positionId: string) => [...candidateKeys.lists(), positionId] as const,
    details: () => [...candidateKeys.all, 'detail'] as const,
    detail: (id: string) => [...candidateKeys.details(), id] as const,
    counts: () => [...candidateKeys.all, 'counts'] as const,
};

/**
 * Hook to fetch candidate counts for all positions
 * Returns a map of positionId -> count
 */
export function useCandidateCounts() {
    return useQuery({
        queryKey: candidateKeys.counts(),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('candidates')
                .select('position_id');

            if (error) throw error;

            // Count candidates per position
            const counts: Record<string, number> = {};
            (data || []).forEach(item => {
                counts[item.position_id] = (counts[item.position_id] || 0) + 1;
            });
            return counts;
        },
        staleTime: 1000 * 20, // 20 seconds for fresher counts on dashboard
    });
}

/**
 * Hook to fetch all candidates across all positions
 */
export function useAllCandidates() {
    return useQuery({
        queryKey: [...candidateKeys.all, 'all-list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('candidates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []).map(mapToCandidate);
        },
    });
}

// Map database record to Candidate type
function mapToCandidate(record: any): Candidate {
    return {
        id: record.id,
        position_id: record.position_id,
        name: record.name,
        email: record.email,
        phone: record.phone || undefined,
        resume_url: record.resume_url || undefined,
        linkedin_url: record.linkedin_url || undefined,
        status: record.status as CandidateStatus,
        notes: record.notes || undefined,
        rating: record.rating || undefined,
        created_at: record.created_at,
        updated_at: record.updated_at,
    };
}

/**
 * Hook to fetch all candidates for a position
 */
export function useCandidates(positionId: string | undefined) {
    return useQuery({
        queryKey: candidateKeys.list(positionId ?? ''),
        queryFn: async () => {
            if (!positionId) return [];

            const { data, error } = await supabase
                .from('candidates')
                .select('*')
                .eq('position_id', positionId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []).map(mapToCandidate);
        },
        enabled: !!positionId,
    });
}

/**
 * Hook to create a new candidate with optimistic updates
 */
export function useCreateCandidate(positionId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newCandidate: Omit<CandidateInsert, 'position_id'>) => {
            if (!positionId) throw new Error('No position ID');

            const { data, error } = await supabase
                .from('candidates')
                .insert({
                    position_id: positionId,
                    name: newCandidate.name,
                    email: newCandidate.email,
                    phone: newCandidate.phone || null,
                    resume_url: newCandidate.resume_url || null,
                    linkedin_url: newCandidate.linkedin_url || null,
                    status: newCandidate.status || 'new',
                    notes: newCandidate.notes || null,
                    rating: newCandidate.rating || null,
                })
                .select()
                .single();

            if (error) throw error;
            return mapToCandidate(data);
        },
        onSuccess: (newCandidate) => {
            queryClient.setQueryData<Candidate[]>(
                candidateKeys.list(positionId ?? ''),
                (old) => old ? [newCandidate, ...old] : [newCandidate]
            );
        },
    });
}

/**
 * Hook to update a candidate with optimistic updates
 */
export function useUpdateCandidate(positionId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: CandidateUpdate) => {
            const { data, error } = await supabase
                .from('candidates')
                .update({
                    name: updates.name,
                    email: updates.email,
                    phone: updates.phone || null,
                    resume_url: updates.resume_url || null,
                    linkedin_url: updates.linkedin_url || null,
                    status: updates.status,
                    notes: updates.notes || null,
                    rating: updates.rating || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapToCandidate(data);
        },
        onMutate: async ({ id, ...updates }) => {
            await queryClient.cancelQueries({ queryKey: candidateKeys.list(positionId ?? '') });

            const previousCandidates = queryClient.getQueryData<Candidate[]>(
                candidateKeys.list(positionId ?? '')
            );

            queryClient.setQueryData<Candidate[]>(
                candidateKeys.list(positionId ?? ''),
                (old) => old?.map(c => c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c)
            );

            return { previousCandidates };
        },
        onError: (err, variables, context) => {
            if (context?.previousCandidates) {
                queryClient.setQueryData(
                    candidateKeys.list(positionId ?? ''),
                    context.previousCandidates
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: candidateKeys.list(positionId ?? '') });
        },
    });
}

/**
 * Hook to update candidate status (optimized for drag-and-drop)
 */
export function useUpdateCandidateStatus(positionId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: CandidateStatus }) => {
            const { error } = await supabase
                .from('candidates')
                .update({
                    status,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (error) throw error;
            return { id, status };
        },
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: candidateKeys.list(positionId ?? '') });

            const previousCandidates = queryClient.getQueryData<Candidate[]>(
                candidateKeys.list(positionId ?? '')
            );

            queryClient.setQueryData<Candidate[]>(
                candidateKeys.list(positionId ?? ''),
                (old) => old?.map(c => c.id === id ? { ...c, status } : c)
            );

            return { previousCandidates };
        },
        onError: (err, variables, context) => {
            if (context?.previousCandidates) {
                queryClient.setQueryData(
                    candidateKeys.list(positionId ?? ''),
                    context.previousCandidates
                );
            }
        },
    });
}

/**
 * Hook to delete a candidate with optimistic updates
 */
export function useDeleteCandidate(positionId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('candidates')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: candidateKeys.list(positionId ?? '') });

            const previousCandidates = queryClient.getQueryData<Candidate[]>(
                candidateKeys.list(positionId ?? '')
            );

            queryClient.setQueryData<Candidate[]>(
                candidateKeys.list(positionId ?? ''),
                (old) => old?.filter(c => c.id !== id)
            );

            return { previousCandidates };
        },
        onError: (err, id, context) => {
            if (context?.previousCandidates) {
                queryClient.setQueryData(
                    candidateKeys.list(positionId ?? ''),
                    context.previousCandidates
                );
            }
        },
    });
}
