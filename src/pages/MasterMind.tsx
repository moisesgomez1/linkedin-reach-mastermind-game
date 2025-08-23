import GuessHistory from '@/components/GuessHistory';
import { useEffect, useState } from 'react';

// Types
type GuessRecord = {
    id: string;
    guess: number[];
    correctNumbers: number;
    correctPositions: number;
    createdAt?: string;
};

type GameStateResponse = {
    guesses: GuessRecord[];
    attemptsLeft: number;
    isWin: boolean;
    isOver: boolean;
};

// Specific for feedback. Details of the result of the latest move made my the user. Depending on this data the game will either end or continue.
type LastResult = {
    guess: GuessRecord;
    attemptsLeft: number;
    isWin: boolean;
    isOver: boolean;
};

export default function Mastermind() {
    // State handlers
    const [guess, setGuess] = useState('');
    const [guessHistory, setGuessHistory] = useState<GuessRecord[]>([]); // full history of guesses
    const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
    const [isOver, setIsOver] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [lastResult, setLastResult] = useState<LastResult | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loadingGame, setLoadingGame] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Basic validation for 4 digits 0–7
    const canSubmit = guess.length === 4 && /^[0-7]{4}$/.test(guess) && !submitting && !isOver;

    // On mount, load current active game, it can be a fresh new game or an existing game based on the game data.
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('http://localhost:3000/api/game', {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!res.ok) throw new Error(await res.text());

                const data: GameStateResponse = await res.json();

                setGuessHistory(data.guesses); // full ordered history
                setAttemptsLeft(data.attemptsLeft); // show attempts from payload
                setIsOver(data.isOver);
                setIsWin(data.isWin);
            } catch (err: any) {
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
                body: JSON.stringify({ guess: guess.split('').map((d) => Number(d)) }),
            });
            if (!res.ok) throw new Error(await res.text());

            const data: GameStateResponse = await res.json();

            setGuessHistory(data.guesses);

            // Update fields from payload
            setAttemptsLeft(data.attemptsLeft);
            setIsOver(data.isOver);
            setIsWin(data.isWin);

            /*We are doing this because when a user makes a guess we want to
            give them feedback of their last move. We update the setLastResult state setter to the latest element in the data.guesses object.*/
            const last = data.guesses[data.guesses.length - 1];
            if (last) {
                setLastResult({
                    guess: last,
                    attemptsLeft: data.attemptsLeft,
                    isWin: data.isWin,
                    isOver: data.isOver,
                });
            }

            setGuess(''); // clear input
        } catch (err: any) {
            setError(err?.message ?? 'Failed to submit guess');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingGame) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                Loading game…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
            <div className="relative w-[560px] max-w-[90vw]">
                <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-blue-500/30 via-cyan-400/20 to-indigo-500/30 blur-2xl opacity-60 pointer-events-none" />
                <div className="relative bg-white/95 backdrop-blur rounded-[24px] shadow-2xl ring-1 ring-black/5 p-8 md:p-10">
                    <h1 className="text-center text-4xl font-black tracking-tight text-slate-800 drop-shadow-sm">
                        Mastermind
                    </h1>
                    <p className="mt-2 text-center text-slate-500">Guess the secret code.</p>

                    {/* Guess Form*/}
                    <form onSubmit={handleSubmit} className="mt-8 flex flex-col items-center gap-5">
                        <input
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)} // keep local input
                            placeholder="Enter guess (4 digits 0–7)"
                            className="
                w-full max-w-[420px]
                text-center
                text-2xl
                font-bold
                px-6 py-4
                rounded-2xl
                border-2 border-slate-200
                focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400
                bg-slate-50 text-slate-900
                placeholder:text-slate-300
              "
                            disabled={isOver} // disabled when game is over.
                        />

                        <button
                            type="submit"
                            disabled={!canSubmit} // simple gating to avoid submission when the input is not valid or when an event is happening
                            className="
                w-full max-w-[420px]
                h-14
                rounded-2xl
                bg-blue-600 text-white
                text-lg font-bold
                shadow-lg shadow-blue-600/30
                hover:bg-blue-700
                focus:outline-none focus:ring-4 focus:ring-blue-300
                disabled:opacity-50 disabled:cursor-not-allowed
              "
                        >
                            {submitting ? 'Checking…' : 'Submit Guess'}
                        </button>
                    </form>

                    {/* Simple error banner */}
                    {error && (
                        <div className="mt-4 rounded-2xl bg-red-50 text-red-700 px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {/* */}
                    {!lastResult && attemptsLeft !== null && (
                        <div className="mt-8 grid grid-cols-1 gap-4">
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
                                <div className="text-sm text-slate-500">Attempts Left</div>
                                <div className="mt-1 text-4xl font-black text-slate-900">
                                    {attemptsLeft}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Only when lastResult is available */}
                    {lastResult && (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
                                <div className="text-sm text-slate-500">Correct Numbers</div>
                                <div className="mt-1 text-4xl font-black text-slate-900">
                                    {lastResult.guess.correctNumbers}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
                                <div className="text-sm text-slate-500">Correct Positions</div>
                                <div className="mt-1 text-4xl font-black text-slate-900">
                                    {lastResult.guess.correctPositions}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
                                <div className="text-sm text-slate-500">Attempts Left</div>
                                <div className="mt-1 text-4xl font-black text-slate-900">
                                    {attemptsLeft ?? 0} {/* read from summary */}
                                </div>
                            </div>
                        </div>
                    )}

                    {/*  End-state message driven by summary */}
                    {isOver && (
                        <div className="mt-6 p-4 text-center text-xl font-semibold">
                            {isWin ? (
                                <span className="text-green-600">🎉 You Won!</span>
                            ) : (
                                <span className="text-red-600">💀 Game Over. You Lost!</span>
                            )}
                        </div>
                    )}

                    {/*  History list */}
                    <GuessHistory history={guessHistory} />
                </div>
            </div>
        </div>
    );
}
