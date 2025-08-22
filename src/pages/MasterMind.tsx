import { useState } from 'react';

type GuessResponse = {
    correctNumbers: number;
    correctPositions: number;
    attemptsLeft: number;
};

export default function Mastermind() {
    //state handlers
    const [guess, setGuess] = useState('');
    const [lastResult, setLastResult] = useState<GuessResponse | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    //some validation
    const canSubmit = guess.length === 4 && /^[0-7]{4}$/.test(guess) && !submitting;

    //submit handler
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
                body: JSON.stringify({
                    guess: guess.split('').map((d) => Number(d)), //converting the guess into an array of numbers
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Guess request failed');
            }

            const data: GuessResponse = await res.json();
            // sets the current data the reflect how many tries they have left and how many guesses they got correct. Feedback essentially
            setLastResult(data);
            setGuess('');
        } catch (err: any) {
            setError(err?.message ?? 'Failed to submit guess');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
            <div className="relative w-[560px] max-w-[90vw]">
                <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-blue-500/30 via-cyan-400/20 to-indigo-500/30 blur-2xl opacity-60 pointer-events-none" />
                <div className="relative bg-white/95 backdrop-blur rounded-[24px] shadow-2xl ring-1 ring-black/5 p-8 md:p-10">
                    <h1 className="text-center text-4xl font-black tracking-tight text-slate-800 drop-shadow-sm">
                        Mastermind
                    </h1>
                    <p className="mt-2 text-center text-slate-500">Guess the secret code.</p>

                    {/* Guess Form */}
                    <form onSubmit={handleSubmit} className="mt-8 flex flex-col items-center gap-5">
                        <input
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            placeholder="Enter guess"
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
                        />

                        <button
                            type="submit"
                            disabled={!canSubmit}
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

                    {error && (
                        <div className="mt-4 rounded-2xl bg-red-50 text-red-700 px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {lastResult && (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
                                <div className="text-sm text-slate-500">Correct Numbers</div>
                                <div className="mt-1 text-4xl font-black text-slate-900">
                                    {lastResult.correctNumbers}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
                                <div className="text-sm text-slate-500">Correct Positions</div>
                                <div className="mt-1 text-4xl font-black text-slate-900">
                                    {lastResult.correctPositions}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
                                <div className="text-sm text-slate-500">Attempts Left</div>
                                <div className="mt-1 text-4xl font-black text-slate-900">
                                    {lastResult.attemptsLeft}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
