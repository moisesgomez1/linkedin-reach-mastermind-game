import { useEffect, useState } from 'react';
import GuessInput from '@/components/GuessInput';
import GuessFeedback from '@/components/GuessFeedback';
import GuessHistory from '@/components/GuessHistory';
import GameStatus from '@/components/GameStatus';
import GameTimer from '@/components/GameTimer';

// Types
type GuessRecord = {
    id: string;
    guess: number[];
    correctNumbers: number;
    correctPositions: number;
};

type GameStateData = {
    guesses: GuessRecord[];
    attemptsLeft: number;
    isWin: boolean;
    isOver: boolean;
    mode: 'classic' | 'timed';
    startTime: string | null;
    timeLimit: number | null;
    secret?: number[]; // the secret is optional and only sent at game end
};

type GameStateResponse = {
    success: boolean;
    message: string;
    data: GameStateData;
};

// Specific for feedback. Details of the result of the latest move made my the user. Depending on this data the game will either end or continue.
export type LastResult = {
    guess: GuessRecord;
    attemptsLeft: number;
    isWin: boolean;
    isOver: boolean;
    secret?: number[];
};

export default function Mastermind() {
    // State handlers
    const [guess, setGuess] = useState('');
    const [guessHistory, setGuessHistory] = useState<GuessRecord[]>([]);
    const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
    const [isOver, setIsOver] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [lastResult, setLastResult] = useState<LastResult | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loadingGame, setLoadingGame] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [secret, setSecret] = useState<number[] | null>(null);

    const [mode, setMode] = useState<'classic' | 'timed'>('classic');
    const [startTime, setStartTime] = useState<string | null>(null);
    const [timeLimit, setTimeLimit] = useState<number | null>(null);
    const [timeExpired, setTimeExpired] = useState(false); // local UX-only lock

    // This determines if the user can submit a guess based on whether the game is timed and if the time has expired.
    const timedLock = mode === 'timed' && timeExpired;
    // Basic validation for 4 digits 0–7, not submitting, game not over, and not locked by timer expiry.
    const canSubmit =
        guess.length === 4 && /^[0-7]{4}$/.test(guess) && !submitting && !isOver && !timedLock;

    // On mount, load current active game, it can be a fresh new game or an existing game based on the game data.
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('http://localhost:3000/api/game', {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });

                const result: GameStateResponse = await res.json();

                if (!result.success) {
                    throw new Error(result.message || 'Failed to load game');
                }

                setGuessHistory(result.data?.guesses);
                setAttemptsLeft(result.data?.attemptsLeft);
                setIsOver(result.data?.isOver);
                setIsWin(result.data?.isWin);
                setSecret(result.data?.secret ?? null); // set secret if provided (game over)

                setMode(result.data?.mode ?? 'classic');
                setStartTime(result.data?.startTime ?? null);
                setTimeLimit(result.data?.timeLimit ?? null);

                // reset local timer lock when loading a new/other game
                setTimeExpired(false);
            } catch (err: any) {
                console.error(err);
                setError(err?.message ?? 'Failed to load game.');
            } finally {
                setLoadingGame(false);
            }
        })();
    }, []);

    // Submit handler to help make a request after submitting a guess. The response will contain the most recent data of the game instance.
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:3000/api/guess', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guess: guess.split('').map(Number) }),
            });

            const result: GameStateResponse = await res.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to submit guess.');
            }

            // Update fields from payload
            setGuessHistory(result.data?.guesses);
            setAttemptsLeft(result.data?.attemptsLeft);
            setIsOver(result.data?.isOver);
            setIsWin(result.data?.isWin);
            setSecret(result.data?.secret ?? null);

            /*We are doing this because when a user makes a guess we want to
      give them feedback of their last move. We update the setLastResult state setter to the latest element in the data.guesses object.*/
            const last = result.data?.guesses[result.data?.guesses.length - 1];
            if (last) {
                setLastResult({
                    guess: last,
                    attemptsLeft: result.data.attemptsLeft,
                    isWin: result.data.isWin,
                    isOver: result.data.isOver,
                    secret: result.data.secret,
                });
            }

            setGuess(''); //clear input
        } catch (err: any) {
            setError(err?.message ?? 'Failed to submit guess');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTimeExpire = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/game/expire', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isOver: true }),
            });

            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to expire game.');
            }

            setTimeExpired(true);
            setIsOver(true);
            setSecret(result.data?.secret ?? null);
        } catch (err: any) {
            console.error('Failed to expire game:', err);
            setTimeExpired(true); // fallback local lock
        }
    };

    if (loadingGame) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                Loading game...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
            {/* Centered Game UI */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 gap-8 max-w-3xl mx-auto">
                <h1 className="text-5xl font-bold tracking-wider mb-4 text-white drop-shadow-lg">
                    MASTERMIND
                </h1>

                <GameStatus isOver={isOver} isWin={isWin} secret={secret} />

                {mode === 'timed' && startTime && timeLimit !== null && (
                    <GameTimer
                        startTime={startTime}
                        timeLimit={timeLimit}
                        isOver={isOver}
                        onExpire={handleTimeExpire}
                    />
                )}

                <GuessInput
                    guess={guess}
                    setGuess={setGuess}
                    onSubmit={handleSubmit}
                    canSubmit={canSubmit}
                    disabled={isOver || timedLock} // disabled when game is over.
                    submitting={submitting}
                />

                <GuessFeedback result={lastResult} attemptsLeft={attemptsLeft} />

                {error && <div className="text-red-400 font-semibold">{error}</div>}
            </div>

            {/* Guess History Sidebar */}
            <div className="w-96 h-screen p-6 overflow-y-auto bg-gray-950 border-l border-gray-800">
                <GuessHistory history={guessHistory} />
            </div>
        </div>
    );
}
