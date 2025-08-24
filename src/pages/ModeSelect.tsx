import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ModeSelect() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleStart = async (mode: 'classic' | 'timed') => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/start', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode }),
            });

            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to start game.');
            }

            navigate('/mastermind');
        } catch (err) {
            console.error(err);
            alert('Failed to start game.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
                    Choose Game Mode
                </h2>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => handleStart('classic')}
                        disabled={loading}
                        className="h-12 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Starting…' : 'Classic Mode'}
                    </button>

                    <button
                        onClick={() => handleStart('timed')}
                        disabled={loading}
                        className="h-12 rounded-xl bg-red-600 text-white font-semibold shadow hover:bg-red-500 disabled:opacity-50"
                    >
                        {loading ? 'Starting…' : 'Timed Mode (60s)'}
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="h-10 mt-4 text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
