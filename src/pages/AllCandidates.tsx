import { useState, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAllCandidates, Candidate } from '@/hooks/useCandidates';
import { usePositions } from '@/hooks/usePositions';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CandidateStatusBadge, CANDIDATE_STATUS_OPTIONS, CandidateStatus } from '@/components/candidates/CandidateStatusBadge';
import {
    Users,
    Search,
    Filter,
    Star,
    Mail,
    Phone,
    Linkedin,
    FileText,
    ArrowLeft,
    X,
    Briefcase,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function AllCandidates() {
    const navigate = useNavigate();
    const { user, company, loading: authLoading } = useAuth();

    // Fetch all candidates and positions
    const { data: candidates = [], isLoading: candidatesLoading } = useAllCandidates();
    const { data: positions = [] } = usePositions();

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [positionFilter, setPositionFilter] = useState<string>('all');
    const [ratingFilter, setRatingFilter] = useState<string>('all');

    // Redirect to login if not authenticated
    if (!authLoading && !user) {
        return <Navigate to="/login" replace />;
    }

    // Create position lookup map
    const positionMap = useMemo(() => {
        const map: Record<string, { name: string; id: string }> = {};
        positions.forEach(p => {
            map[p.id] = { name: p.position_name, id: p.id };
        });
        return map;
    }, [positions]);

    // Filter candidates
    const filteredCandidates = useMemo(() => {
        return candidates.filter(candidate => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    candidate.name.toLowerCase().includes(query) ||
                    candidate.email.toLowerCase().includes(query) ||
                    (candidate.phone && candidate.phone.toLowerCase().includes(query));
                if (!matchesSearch) return false;
            }

            // Status filter
            if (statusFilter !== 'all' && candidate.status !== statusFilter) {
                return false;
            }

            // Position filter
            if (positionFilter !== 'all' && candidate.position_id !== positionFilter) {
                return false;
            }

            // Rating filter
            if (ratingFilter !== 'all') {
                const minRating = parseInt(ratingFilter);
                if (!candidate.rating || candidate.rating < minRating) {
                    return false;
                }
            }

            return true;
        });
    }, [candidates, searchQuery, statusFilter, positionFilter, ratingFilter]);

    const getInitials = (name: string) => {
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const statusAvatarColors: Record<CandidateStatus, string> = {
        new: 'bg-blue-100 text-blue-700',
        screening: 'bg-orange-100 text-orange-700',
        interview: 'bg-amber-100 text-amber-700',
        offer: 'bg-purple-100 text-purple-700',
        hired: 'bg-emerald-100 text-emerald-700',
        rejected: 'bg-red-100 text-red-700',
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setPositionFilter('all');
        setRatingFilter('all');
    };

    const hasActiveFilters = searchQuery || statusFilter !== 'all' || positionFilter !== 'all' || ratingFilter !== 'all';

    const isLoading = authLoading || candidatesLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Skeleton className="h-8 w-64 mb-4" />
                    <Skeleton className="h-12 w-full mb-4" />
                    <Skeleton className="h-64 w-full" />
                </main>
            </div>
        );
    }

    if (!user || !company) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
                {/* Back button and header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Users className="h-6 w-6 text-primary" />
                                All Candidates
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {filteredCandidates.length} of {candidates.length} candidates
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, or phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full lg:w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {CANDIDATE_STATUS_OPTIONS.map(status => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Position Filter */}
                            <Select value={positionFilter} onValueChange={setPositionFilter}>
                                <SelectTrigger className="w-full lg:w-[200px]">
                                    <SelectValue placeholder="Position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Positions</SelectItem>
                                    {positions.map(position => (
                                        <SelectItem key={position.id} value={position.id}>
                                            {position.position_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Rating Filter */}
                            <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                <SelectTrigger className="w-full lg:w-[140px]">
                                    <SelectValue placeholder="Rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Ratings</SelectItem>
                                    <SelectItem value="5">5 Stars</SelectItem>
                                    <SelectItem value="4">4+ Stars</SelectItem>
                                    <SelectItem value="3">3+ Stars</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                                    <X className="h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Candidates Grid */}
                {filteredCandidates.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
                        <p className="text-muted-foreground mb-4">
                            {hasActiveFilters
                                ? 'Try adjusting your filters to find more candidates.'
                                : 'Add candidates to positions to see them here.'}
                        </p>
                        {hasActiveFilters && (
                            <Button onClick={clearFilters} variant="outline">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredCandidates.map((candidate) => (
                            <Card
                                key={candidate.id}
                                className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                                onClick={() => navigate(`/positions/${candidate.position_id}/candidates`)}
                            >
                                <CardContent className="p-4">
                                    {/* Header */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <Avatar className={`h-10 w-10 shrink-0 ${statusAvatarColors[candidate.status]}`}>
                                            <AvatarFallback className={`text-sm font-semibold ${statusAvatarColors[candidate.status]}`}>
                                                {getInitials(candidate.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                {candidate.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {candidate.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Position Badge */}
                                    {positionMap[candidate.position_id] && (
                                        <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
                                            <Briefcase className="h-3 w-3" />
                                            <span className="truncate">
                                                {positionMap[candidate.position_id].name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Status and Rating */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <CandidateStatusBadge status={candidate.status} />
                                        {candidate.rating && candidate.rating > 0 && (
                                            <div className="flex items-center gap-0.5 text-amber-400">
                                                {[...Array(candidate.rating)].map((_, i) => (
                                                    <Star key={i} className="h-3 w-3 fill-current" />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick info icons */}
                                    <div className="flex items-center gap-2 text-gray-400">
                                        {candidate.phone && (
                                            <span title={candidate.phone}>
                                                <Phone className="h-3.5 w-3.5" />
                                            </span>
                                        )}
                                        {candidate.linkedin_url && (
                                            <span title="LinkedIn profile">
                                                <Linkedin className="h-3.5 w-3.5" />
                                            </span>
                                        )}
                                        {candidate.resume_url && (
                                            <span title="Resume available">
                                                <FileText className="h-3.5 w-3.5" />
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
