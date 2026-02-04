import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Trash2, Play, Pause, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStorage } from '@/hooks/useStorage';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
    candidateId: string;
    onSave: (url: string) => void;
    onCancel?: () => void;
}

export function VoiceRecorder({ candidateId, onSave, onCancel }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { uploadVoiceNote, uploading } = useStorage();
    const { toast } = useToast();

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
            }
        };
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                console.log("Audio data available chunk size:", e.data.size);
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                console.log("Recording stopped. Total chunks:", audioChunksRef.current.length);
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setRecordedUrl(url);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start(1000); // Capture data every second
            setIsRecording(true);
            setDuration(0);
            console.log("Recording started...");
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            toast({
                title: "Microphone Access Denied",
                description: "Please enable microphone access to record voice notes.",
                variant: "destructive"
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const discardRecording = () => {
        setRecordedUrl(null);
        setAudioBlob(null);
        setDuration(0);
        setIsPlaying(false);
    };

    const togglePlayback = () => {
        if (!audioRef.current && recordedUrl) {
            audioRef.current = new Audio(recordedUrl);
            audioRef.current.onended = () => setIsPlaying(false);
        }

        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSave = async () => {
        if (!audioBlob) return;

        try {
            const url = await uploadVoiceNote(audioBlob, candidateId);
            onSave(url);
            toast({
                title: "Voice Note Saved",
                description: "The evaluation has been attached to the candidate profile."
            });
        } catch (err: any) {
            toast({
                title: "Upload Failed",
                description: err.message,
                variant: "destructive"
            });
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-muted/30 p-4 rounded-2xl border border-dashed border-primary/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center gap-4">
                {!recordedUrl ? (
                    <>
                        <div className="flex items-center gap-3">
                            {isRecording && (
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <div
                                            key={i}
                                            className="w-1 bg-primary rounded-full animate-bounce"
                                            style={{ height: '12px', animationDelay: `${i * 0.1}s` }}
                                        />
                                    ))}
                                </div>
                            )}
                            <span className={cn("text-lg font-mono font-bold", isRecording ? "text-red-500" : "text-muted-foreground")}>
                                {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            {!isRecording ? (
                                <Button
                                    onClick={startRecording}
                                    className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
                                >
                                    <Mic className="h-6 w-6" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={stopRecording}
                                    variant="outline"
                                    className="rounded-full h-12 w-12 border-red-500 text-red-500 hover:bg-red-50"
                                >
                                    <Square className="h-6 w-6 fill-current" />
                                </Button>
                            )}
                            {onCancel && (
                                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="w-full space-y-4">
                        <div className="flex items-center justify-between bg-card p-3 rounded-xl border">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full h-8 w-8"
                                    onClick={togglePlayback}
                                >
                                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold">Voice Note</span>
                                    <span className="text-[10px] text-muted-foreground">{formatTime(duration)}</span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                onClick={discardRecording}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                className="flex-1 gap-2"
                                onClick={handleSave}
                                disabled={uploading}
                            >
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Evaluation
                            </Button>
                            {onCancel && (
                                <Button variant="ghost" onClick={onCancel} disabled={uploading}>Close</Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
