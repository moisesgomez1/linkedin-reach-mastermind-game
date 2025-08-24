import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StartButton from '../components/StartButton';
import GameList from '@/components/GamesList';
import { GameSummary } from '@/components/GamesList';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);
    const [listLoading, setListLoading] = useState(false);
    const [games, setGames] = useState<GameSummary[]>([]);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    // When this function is called, navigate to the mode selection page. This is used in the StartButton component.
    const goToModeSelect = () => {
        navigate('/select-mode');
    };

    const handleContinue = async () => {
        setShowList(true);
        setListLoading(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:3000/api/games', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to load games.');
            }
            setGames(result.data?.games ?? []);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong.');
        } finally {
            setListLoading(false);
        }
    };

    const handleSelectGame = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:3000/api/games/${id}/select`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to select game.');
            }
            // cookie now points to selected game → go to play screen
            navigate('/mastermind');
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Failed to select game.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-3xl">
                <div className="bg-white rounded-2xl shadow p-8">
                    <h1 className="text-3xl font-black text-slate-800 text-center">Mastermind</h1>
                    <p className="text-center text-slate-500 mt-2">
                        Start a new game or continue from your history.
                    </p>

                    <div className="mt-8 flex items-center justify-center gap-4">
                        <StartButton
                            onClick={goToModeSelect}
                            disabled={loading}
                            loading={loading}
                        />
                        <button
                            onClick={handleContinue}
                            disabled={listLoading}
                            className="h-12 px-6 rounded-2xl bg-green-600 text-white font-semibold shadow hover:bg-green-500 disabled:opacity-50"
                        >
                            {listLoading ? 'Loading…' : 'Continue Game'}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {showList && (
                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-slate-700">Your Games</h2>
                            {listLoading ? (
                                <div className="mt-6 text-slate-500">Loading games…</div>
                            ) : (
                                <GameList games={games} onSelect={handleSelectGame} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
