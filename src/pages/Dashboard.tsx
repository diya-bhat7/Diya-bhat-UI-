import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePositions } from '@/hooks/usePositions';
import { useCandidateCounts } from '@/hooks/useCandidates';
import { useDebounce } from '@/hooks/useDebounce';
import { Tables } from '@/integrations/supabase/types';
import { Header } from '@/components/layout/Header';
import { PositionCard } from '@/components/dashboard/PositionCard';
import { PositionCardSkeletonGrid } from '@/components/dashboard/PositionCardSkeleton';
import { PositionFilters, PositionFiltersState } from '@/components/dashboard/PositionFilters';
import { AnalyticsCards } from '@/components/dashboard/AnalyticsCards';
import { HiringPipeline } from '@/components/dashboard/HiringPipeline';
import { PositionsByCategory } from '@/components/dashboard/PositionsByCategory';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Briefcase, Search, BarChart2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/EmptyState';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

type Position = Tables<'positions'>;

export default function Dashboard() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user, company, loading: authLoading } = useAuth();

    // Use React Query for positions data with caching
    const { data: positions = [], isLoading: positionsLoading } = usePositions();

    // Fetch candidate counts for all positions
    const { data: candidateCounts = {} } = useCandidateCounts();

    // Initialize state from URL params
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
    const debouncedSearch = useDebounce(searchQuery, 300);

    const [showAnalytics, setShowAnalytics] = useState(false);
    const [filters, setFilters] = useState<PositionFiltersState>(() => ({
        category: searchParams.get('category') || '',
        workType: searchParams.get('workType') || '',
        priority: searchParams.get('priority') || '',
        location: searchParams.get('location') || '',
        status: searchParams.get('status') || '',
    }));

    // Sync filters to URL params
    const updateURLParams = useCallback(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('q', debouncedSearch);
        if (filters.category) params.set('category', filters.category);
        if (filters.workType) params.set('workType', filters.workType);
        if (filters.priority) params.set('priority', filters.priority);
        if (filters.location) params.set('location', filters.location);
        if (filters.status) params.set('status', filters.status);
        setSearchParams(params, { replace: true });
    }, [debouncedSearch, filters, setSearchParams]);

    useEffect(() => {
        updateURLParams();
    }, [updateURLParams]);


    // Redirect to login if not authenticated
    if (!authLoading && !user) {
        return <Navigate to="/login" replace />;
    }

    const filteredPositions = useMemo(() => {
        return positions.filter(position => {
            // Search filter (using debounced value)
            if (debouncedSearch) {
                const query = debouncedSearch.toLowerCase();
                const matchesSearch =
                    position.position_name.toLowerCase().includes(query) ||
                    position.category.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Category filter
            if (filters.category && position.category !== filters.category) {
                return false;
            }

            // Work type filter
            if (filters.workType && position.work_type !== filters.workType) {
                return false;
            }

            // Priority filter
            if (filters.priority && position.priority !== filters.priority) {
                return false;
            }

            // Location filter
            if (filters.location && position.preferred_locations) {
                if (!position.preferred_locations.includes(filters.location)) {
                    return false;
                }
            }

            // Status filter
            if (filters.status && (position.status || 'draft') !== filters.status) {
                return false;
            }

            return true;
        });
    }, [positions, filters, debouncedSearch]);

    const handleEditPosition = (position: Position) => {
        navigate(`/positions/${position.id}/edit`);
    };

    const handleAddPosition = () => {
        navigate('/positions/new');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!company) {
        // If user is logged in but has no company profile, redirect to profile creation
        // or show a specific onboarding state. For now, let's redirect to profile.
        // Or if you want to force registration flow:
        // return <Navigate to="/register" replace />; 
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <h2 className="text-xl font-semibold">Company Profile Missing</h2>
                    <p className="text-muted-foreground">Please complete your company profile to continue.</p>
                    <Button onClick={() => navigate('/profile')}>Create Profile</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="relative container mx-auto px-4 py-8 pb-20 md:pb-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Positions Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your open positions and track hiring progress
                        </p>
                    </div>
                    <Button onClick={handleAddPosition}>
                        <Plus className="h-5 w-5 mr-2" />
                        Add Position
                    </Button>
                </div>

                <div className="flex justify-end mb-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className="gap-2"
                    >
                        <BarChart2 className="h-4 w-4" />
                        {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                    </Button>
                </div>

                {showAnalytics && !positionsLoading && positions.length > 0 && (
                    <div className="space-y-6 mb-8 animate-fade-in">
                        <AnalyticsCards positions={positions} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <HiringPipeline positions={positions} />
                            <PositionsByCategory positions={positions} />
                        </div>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search positions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <PositionFilters filters={filters} onFiltersChange={setFilters} />
                </div>

                {/* Content */}
                {positionsLoading ? (
                    <PositionCardSkeletonGrid count={6} />
                ) : positions.length === 0 ? (
                    <EmptyState
                        icon="briefcase"
                        title="No positions yet"
                        description="Get started by creating your first position. We'll help you generate job descriptions and interview preparation documents."
                        actionLabel="Add Your First Position"
                        onAction={handleAddPosition}
                    />
                ) : filteredPositions.length === 0 ? (
                    <EmptyState
                        icon="search"
                        title="No matching positions"
                        description="No positions match your current filters. Try adjusting your search criteria."
                        actionLabel="Clear all filters"
                        onAction={() => {
                            setSearchQuery('');
                            setFilters({ category: '', workType: '', priority: '', location: '', status: '' });
                        }}
                    />
                ) : (
                    /* Positions Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPositions.map((position, index) => (
                            <div
                                key={position.id}
                                className="animate-slide-up opacity-0"
                                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                            >
                                <PositionCard
                                    position={position}
                                    onEdit={handleEditPosition}
                                    candidateCount={candidateCounts[position.id]}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Stats Summary */}
                {!positionsLoading && positions.length > 0 && (
                    <QuickStats
                        totalPositions={positions.length}
                        activePositions={positions.filter(p => p.status === 'active').length}
                        totalRoles={positions.reduce((sum, p) => sum + p.num_roles, 0)}
                        className="mt-8"
                    />
                )}
            </main>

            {/* Quick Add FAB + Keyboard Shortcut */}
            <FloatingActionButton
                onClick={handleAddPosition}
                label="Add position"
                keyboardShortcut="n"
            />
        </div>
    );
}
