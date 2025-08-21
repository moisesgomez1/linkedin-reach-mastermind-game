import { useState } from 'react';

type GuessResponse = {
    correctNumbers: number;
    correctPositions: number;
    attemptsLeft: number;
};

export default function Mastermind() {
    //state handlers
    const [gameId, setGameId] = useState('');
    const [guess, setGuess] = useState('');
    const [lastResult, setLastResult] = useState<GuessResponse | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    //some validation
    const canSubmit = !!gameId && guess.length === 4 && /^[0-7]{4}$/.test(guess) && !submitting;

    //submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:3000/api/guess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    guess: guess.split('').map((d) => Number(d)), //converting the guess into an array of numbers
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Guess request failed');
            }

            const data: GuessResponse = await res.json();
            setLastResult(data);
            setGuess('');
        } catch (err: any) {
            setError(err?.message ?? 'Failed to submit guess');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            {/* Centered Game Panel */}
            <div className="bg-white rounded-3xl shadow-2xl w-[500px] p-10 text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Mastermind</h1>

                {/* Game ID Input */}
                <div className="mb-6 text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Game ID (temporary)
                    </label>
                    <input
                        value={gameId}
                        onChange={(e) => setGameId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Paste the gameId"
                    />
                </div>

                {/* Guess Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        maxLength={4}
                        placeholder="Enter 4 digits (0–7)"
                        className="text-center text-3xl tracking-[1rem] py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
                    >
                        {submitting ? 'Checking...' : 'Submit Guess'}
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Result */}
                {lastResult && (
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-100">
                            <div className="text-sm text-gray-500">Correct Numbers</div>
                            <div className="text-2xl font-bold">{lastResult.correctNumbers}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-100">
                            <div className="text-sm text-gray-500">Correct Positions</div>
                            <div className="text-2xl font-bold">{lastResult.correctPositions}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-100">
                            <div className="text-sm text-gray-500">Attempts Left</div>
                            <div className="text-2xl font-bold">{lastResult.attemptsLeft}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
