import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
    trigger: boolean;
    onComplete?: () => void;
}

export function useConfetti() {
    const celebrate = () => {
        // Left side burst
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: ['#0d2744', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6'],
        });

        // Right side burst
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: ['#0d2744', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6'],
        });
    };

    return { celebrate };
}

export function ConfettiCelebration({ trigger, onComplete }: ConfettiCelebrationProps) {
    const [hasTriggered, setHasTriggered] = useState(false);
    const { celebrate } = useConfetti();

    useEffect(() => {
        if (trigger && !hasTriggered) {
            celebrate();
            setHasTriggered(true);

            // Reset after animation
            const timer = setTimeout(() => {
                setHasTriggered(false);
                onComplete?.();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [trigger, hasTriggered, celebrate, onComplete]);

    return null; // This component doesn't render anything
}

// Pulse animation for status changes
export function usePulseAnimation() {
    const [isPulsing, setIsPulsing] = useState(false);

    const triggerPulse = () => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 600);
    };

    const pulseClass = isPulsing
        ? 'animate-pulse ring-2 ring-primary ring-offset-2'
        : '';

    return { pulseClass, triggerPulse, isPulsing };
}
