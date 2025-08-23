import { useEffect, useState } from 'react';
import GuessInput from '@/components/GuessInput';
import GuessFeedback from '@/components/GuessFeedback';
import GuessHistory from '@/components/GuessHistory';
import GameStatus from '@/components/GameStatus';

// Types
type GuessRecord = {
    id: string;
    guess: number[];
    correctNumbers: number;
    correctPositions: number;
};

type GameStateResponse = {
    guesses: GuessRecord[];
    attemptsLeft: number;
    isWin: boolean;
    isOver: boolean;
};
// Specific for feedback. Details of the result of the latest move made my the user. Depending on this data the game will either end or continue.
export type LastResult = {
    guess: GuessRecord;
    attemptsLeft: number;
    isWin: boolean;
    isOver: boolean;
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

                setGuessHistory(data.guesses);
                setAttemptsLeft(data.attemptsLeft);
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
                body: JSON.stringify({ guess: guess.split('').map(Number) }),
            });

            if (!res.ok) throw new Error(await res.text());

            const data: GameStateResponse = await res.json();
            // Update fields from payload
            setGuessHistory(data.guesses);
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

            setGuess(''); //clear input
        } catch (err: any) {
            setError(err?.message ?? 'Failed to submit guess');
        } finally {
            setSubmitting(false);
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

                <GameStatus isOver={isOver} isWin={isWin} />

                <GuessInput
                    guess={guess}
                    setGuess={setGuess}
                    onSubmit={handleSubmit}
                    canSubmit={canSubmit}
                    disabled={isOver} // disabled when game is over.
                    submitting={submitting}
                />

                <GuessFeedback result={lastResult} attemptsLeft={attemptsLeft} />

                {error && <div className="text-red-400 font-semibold">{error}</div>}
            </div>

            {/* Guess History Sidebar */}
            <div className="w-96 p-6 overflow-y-auto bg-gray-950 border-l border-gray-800">
                <GuessHistory history={guessHistory} />
            </div>
        </div>
    );
}
