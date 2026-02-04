import { useState, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePosition } from '@/hooks/usePositions';
import {
    useCandidates,
    useCreateCandidate,
    useUpdateCandidate,
    useDeleteCandidate,
    useUpdateCandidateStatus,
    Candidate,
} from '@/hooks/useCandidates';
import { useCandidatesRealtime } from '@/hooks/useCandidatesRealtime';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { CandidateCard } from '@/components/candidates/CandidateCard';
import { CandidateForm } from '@/components/candidates/CandidateForm';
import { CandidateGrid } from '@/components/candidates/CandidateGrid';
import { CandidateTable } from '@/components/candidates/CandidateTable';
import { CandidateDetailModal } from '@/components/candidates/CandidateDetailModal';
import { CandidateStatus } from '@/components/candidates/CandidateStatusBadge';
import {
    ArrowLeft,
    Plus,
    LayoutGrid,
    List,
    Users,
    Briefcase,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ExportButton } from '@/components/ui/ExportButton';

export default function Candidates() {
    const { positionId } = useParams<{ positionId: string }>();
    const navigate = useNavigate();
    const { user, company, loading: authLoading } = useAuth();
    const { toast } = useToast();

    // React Query hooks for data fetching with caching
    const { data: position } = usePosition(positionId);
    const { data: candidates = [], isLoading: candidatesLoading } = useCandidates(positionId);

    // Real-time subscription for live updates (e.g., when multiple users are collaborating)
    useCandidatesRealtime(positionId);

    // Mutation hooks with optimistic updates
    const createCandidate = useCreateCandidate(positionId);
    const updateCandidate = useUpdateCandidate(positionId);
    const deleteCandidate = useDeleteCandidate(positionId);
    const updateStatus = useUpdateCandidateStatus(positionId);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [formOpen, setFormOpen] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);

    const handleCandidateClick = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setDetailModalOpen(true);
    };

    // Redirect to login if not authenticated
    if (!authLoading && !user) {
        return <Navigate to="/login" replace />;
    }

    const handleAddCandidate = async (data: Partial<Candidate>) => {
        try {
            await createCandidate.mutateAsync({
                name: data.name!,
                email: data.email!,
                phone: data.phone,
                resume_url: data.resume_url,
                linkedin_url: data.linkedin_url,
                status: data.status || 'new',
                notes: data.notes,
                rating: data.rating,
            });
            toast({
                title: 'Candidate added',
                description: `${data.name} has been added to the pipeline.`,
            });
        } catch (error: any) {
            toast({
                title: 'Error adding candidate',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleEditCandidate = (candidate: Candidate) => {
        setEditingCandidate(candidate);
        setFormOpen(true);
    };

    const handleUpdateCandidate = async (data: Partial<Candidate>) => {
        if (!data.id) return;

        try {
            await updateCandidate.mutateAsync({
                id: data.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                resume_url: data.resume_url,
                linkedin_url: data.linkedin_url,
                status: data.status,
                notes: data.notes,
                rating: data.rating,
            });
            setEditingCandidate(null);
            toast({
                title: 'Candidate updated',
                description: 'Candidate information has been updated.',
            });
        } catch (error: any) {
            toast({
                title: 'Error updating candidate',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    // Show confirmation dialog before deleting
    const promptDeleteCandidate = useCallback((candidate: Candidate) => {
        setCandidateToDelete(candidate);
        setDeleteDialogOpen(true);
    }, []);

    const handleConfirmDelete = async () => {
        if (!candidateToDelete) return;
        try {
            await deleteCandidate.mutateAsync(candidateToDelete.id);
            toast({
                title: 'Candidate removed',
                description: `${candidateToDelete.name} has been removed.`,
            });
            setDetailModalOpen(false);
        } catch (error: any) {
            toast({
                title: 'Error removing candidate',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setCandidateToDelete(null);
        }
    };

    const handleStatusChange = async (candidate: Candidate, newStatus: CandidateStatus) => {
        try {
            await updateStatus.mutateAsync({ id: candidate.id, status: newStatus });
            toast({
                title: 'Status updated',
                description: `${candidate.name} moved to ${newStatus}.`,
            });
        } catch (error: any) {
            toast({
                title: 'Error updating status',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    // Show loading only when fetching auth or candidates
    const isLoading = authLoading || candidatesLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Skeleton className="h-8 w-64 mb-4" />
                    <Skeleton className="h-64 w-full" />
                </main>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in conditional above
    }

    if (!company) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="text-center space-y-4">
                        <h2 className="text-xl font-semibold">Company Profile Missing</h2>
                        <p className="text-muted-foreground">Please complete your company profile to continue.</p>
                        <Button onClick={() => navigate('/profile')}>Create Profile</Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">

            <Header />
            <main className="relative container mx-auto px-4 py-8 pb-20 md:pb-8">
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
                                Candidates
                            </h1>
                            {position && (
                                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                    <Briefcase className="h-4 w-4" />
                                    {position.position_name}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-lg p-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>

                            <Button onClick={() => setFormOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Candidate
                            </Button>

                            <ExportButton
                                data={candidates}
                                filename={`candidates-${position?.position_name || 'export'}`}
                                columns={[
                                    { key: 'name', header: 'Name' },
                                    { key: 'email', header: 'Email' },
                                    { key: 'phone', header: 'Phone' },
                                    { key: 'status', header: 'Status' },
                                    { key: 'rating', header: 'Rating' },
                                    { key: 'linkedin_url', header: 'LinkedIn' },
                                    { key: 'resume_url', header: 'Resume' },
                                    { key: 'notes', header: 'Notes' },
                                    { key: (c) => new Date(c.created_at).toLocaleDateString(), header: 'Added Date' },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                {candidates.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No candidates yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Start adding candidates to track your hiring pipeline.
                        </p>
                        <Button onClick={() => setFormOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Candidate
                        </Button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <CandidateGrid
                        candidates={candidates}
                        onClick={handleCandidateClick}
                        onEdit={handleEditCandidate}
                        onDelete={promptDeleteCandidate}
                        onStatusChange={handleStatusChange}
                    />
                ) : (
                    <CandidateTable
                        candidates={candidates}
                        onClick={handleCandidateClick}
                        onEdit={handleEditCandidate}
                        onDelete={promptDeleteCandidate}
                        onStatusChange={handleStatusChange}
                    />
                )}

                {/* Form dialog */}
                <CandidateForm
                    open={formOpen}
                    onOpenChange={(open) => {
                        setFormOpen(open);
                        if (!open) setEditingCandidate(null);
                    }}
                    onSubmit={editingCandidate ? handleUpdateCandidate : handleAddCandidate}
                    candidate={editingCandidate}
                    positionId={positionId!}
                />

                {/* Detail modal */}
                <CandidateDetailModal
                    candidate={selectedCandidate}
                    open={detailModalOpen}
                    onClose={() => {
                        setDetailModalOpen(false);
                        setSelectedCandidate(null);
                    }}
                    onEdit={handleEditCandidate}
                    onDelete={promptDeleteCandidate}
                    onStatusChange={handleStatusChange}
                />
            </main>

            {/* Delete confirmation dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Candidate"
                description={`Are you sure you want to remove ${candidateToDelete?.name}? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="destructive"
                onConfirm={handleConfirmDelete}
                loading={deleteCandidate.isPending}
            />
        </div>
    );
}
