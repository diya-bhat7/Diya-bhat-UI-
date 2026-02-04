import { useMemo } from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from '@hello-pangea/dnd';
import { Candidate } from './CandidateCard';
import { CandidateStatus, CANDIDATE_STATUS_OPTIONS } from './CandidateStatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MoreHorizontal, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
    candidates: Candidate[];
    onStatusChange: (candidate: Candidate, newStatus: CandidateStatus) => void;
    onCandidateClick: (candidate: Candidate) => void;
}

export function KanbanBoard({
    candidates,
    onStatusChange,
    onCandidateClick,
}: KanbanBoardProps) {
    // Group candidates by status
    const columns = useMemo(() => {
        const grouped: Record<CandidateStatus, Candidate[]> = {
            new: [],
            screening: [],
            interview: [],
            offer: [],
            hired: [],
            rejected: [],
        };

        candidates.forEach((candidate) => {
            grouped[candidate.status].push(candidate);
        });

        return grouped;
    }, [candidates]);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const candidate = candidates.find((c) => c.id === draggableId);
        if (candidate) {
            onStatusChange(candidate, destination.droppableId as CandidateStatus);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide min-h-[600px]">
                {CANDIDATE_STATUS_OPTIONS.map((status) => (
                    <div
                        key={status.value}
                        className="flex-shrink-0 w-80 flex flex-col gap-3"
                    >
                        <div className="flex items-center justify-between px-2 py-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm capitalize">
                                    {status.label}
                                </h3>
                                <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 min-w-[20px] justify-center">
                                    {columns[status.value].length}
                                </Badge>
                            </div>
                            <button className="text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </div>

                        <Droppable droppableId={status.value}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={cn(
                                        "flex-1 p-2 rounded-xl border-2 border-dashed transition-colors min-h-[150px]",
                                        snapshot.isDraggingOver
                                            ? "bg-accent/50 border-primary/30"
                                            : "bg-muted/30 border-transparent hover:border-muted-foreground/10"
                                    )}
                                >
                                    <div className="flex flex-col gap-3">
                                        {columns[status.value].map((candidate, index) => (
                                            <Draggable
                                                key={candidate.id}
                                                draggableId={candidate.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <Card
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={cn(
                                                            "group bg-card hover:shadow-md transition-all duration-200 cursor-default border-border/60",
                                                            snapshot.isDragging ? "shadow-lg rotate-2 scale-105 border-primary/50" : ""
                                                        )}
                                                        onClick={() => onCandidateClick(candidate)}
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start gap-3">
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    className="pt-1 cursor-grab active:cursor-grabbing text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
                                                                >
                                                                    <GripVertical className="h-4 w-4" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                                        <h4 className="font-semibold text-sm truncate">
                                                                            {candidate.name}
                                                                        </h4>
                                                                        {candidate.rating && candidate.rating > 0 && (
                                                                            <div className="flex items-center gap-0.5 text-amber-500">
                                                                                <Star className="h-3 w-3 fill-current" />
                                                                                <span className="text-[10px] font-bold">{candidate.rating}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground truncate mb-3">
                                                                        {candidate.email}
                                                                    </p>
                                                                    <div className="flex items-center justify-between">
                                                                        <Avatar className="h-6 w-6 border-2 border-background shadow-sm">
                                                                            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                                                                {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="text-[10px] text-muted-foreground font-medium">
                                                                            {new Date(candidate.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}
