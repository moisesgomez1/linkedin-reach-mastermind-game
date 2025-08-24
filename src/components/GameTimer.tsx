import { useEffect, useMemo, useRef, useState } from 'react';

type GameTimerProps = {
    startTime: string; // ISO string from backend
    timeLimit: number; // seconds from backend
    isOver: boolean; // stop ticking if game is over
    onExpire?: () => void; // optional callback when time hits 0
};

export default function GameTimer({ startTime, timeLimit, isOver, onExpire }: GameTimerProps) {
    const startMs = useMemo(() => new Date(startTime).getTime(), [startTime]);
    const [timeLeft, setTimeLeft] = useState<number>(() => {
        const elapsed = (Date.now() - startMs) / 1000;
        return Math.max(0, Math.floor(timeLimit - elapsed));
    });

    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        if (isOver) return;

        const tick = () => {
            const elapsed = (Date.now() - startMs) / 1000;
            const remaining = Math.max(0, Math.floor(timeLimit - elapsed));
            setTimeLeft((prev) => (prev !== remaining ? remaining : prev));

            if (remaining <= 0) {
                onExpire?.();
                return; // stop looping
            }

            frameRef.current = requestAnimationFrame(tick);
        };

        frameRef.current = requestAnimationFrame(tick);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [startMs, timeLimit, isOver, onExpire]);

    return (
        <div
            className={`text-xl font-mono ${
                timeLeft <= 10 && !isOver ? 'text-red-400' : 'text-yellow-400'
            }`}
            aria-live="polite"
        >
            {isOver ? 'Game Over' : `Time Left: ${timeLeft}s`}
        </div>
    );
}
