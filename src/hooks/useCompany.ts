import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';

type Company = Tables<'companies'>;
type CompanyUpdate = Partial<Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// Query keys for cache management
export const companyKeys = {
    all: ['companies'] as const,
    detail: (userId: string) => [...companyKeys.all, 'detail', userId] as const,
};

/**
 * Hook to fetch the current user's company
 * Note: This supplements useAuth's company - use for fresh data or mutations
 */
export function useCompany() {
    const { user } = useAuth();

    return useQuery({
        queryKey: companyKeys.detail(user?.id ?? ''),
        queryFn: async () => {
            if (!user) return null;

            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            return data as Company;
        },
        enabled: !!user,
    });
}

/**
 * Hook to update company profile with optimistic updates
 */
export function useUpdateCompany() {
    const queryClient = useQueryClient();
    const { user, refreshCompany } = useAuth();

    return useMutation({
        mutationFn: async ({ id, ...updates }: CompanyUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from('companies')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Company;
        },
        onMutate: async ({ id, ...updates }) => {
            await queryClient.cancelQueries({ queryKey: companyKeys.detail(user?.id ?? '') });

            const previousCompany = queryClient.getQueryData<Company>(
                companyKeys.detail(user?.id ?? '')
            );

            queryClient.setQueryData<Company>(
                companyKeys.detail(user?.id ?? ''),
                (old) => old ? { ...old, ...updates } : old
            );

            return { previousCompany };
        },
        onError: (err, variables, context) => {
            if (context?.previousCompany) {
                queryClient.setQueryData(
                    companyKeys.detail(user?.id ?? ''),
                    context.previousCompany
                );
            }
        },
        onSuccess: async () => {
            // Also refresh the auth context's company
            await refreshCompany();
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: companyKeys.detail(user?.id ?? '') });
        },
    });
}
/**
 * Hook to create company profile
 */
export function useCreateCompany() {
    const queryClient = useQueryClient();
    const { user, refreshCompany } = useAuth();

    return useMutation({
        mutationFn: async (newCompany: Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
            if (!user) throw new Error('No user found');

            const { data, error } = await supabase
                .from('companies')
                .insert({
                    ...newCompany,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data as Company;
        },
        onSuccess: async () => {
            await refreshCompany();
            queryClient.invalidateQueries({ queryKey: companyKeys.all });
        },
    });
}
