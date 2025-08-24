import { useEffect, useMemo, useState } from 'react';

type GameTimerProps = {
    startTime: string; // ISO string from backend
    timeLimit: number; // seconds from backend
    isOver: boolean; // stop ticking if game is over
    onExpire?: () => void; // optional callback when timer hits 0
};

export default function GameTimer({ startTime, timeLimit, isOver, onExpire }: GameTimerProps) {
    // precompute the numeric start once to avoid recreating a Date every tick
    const startMs = useMemo(() => new Date(startTime).getTime(), [startTime]);
    const [timeLeft, setTimeLeft] = useState<number>(() => {
        const elapsed = (Date.now() - startMs) / 1000;
        return Math.max(0, Math.floor(timeLimit - elapsed));
    });

    useEffect(() => {
        if (isOver) return; // stop if server says game over

        const id = setInterval(() => {
            const elapsed = (Date.now() - startMs) / 1000;
            const remaining = Math.max(0, Math.floor(timeLimit - elapsed));
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(id);
                onExpire?.(); // let parent disable inputs, etc.
            }
        }, 1000);

        return () => clearInterval(id);
    }, [isOver, startMs, timeLimit, onExpire]);

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
