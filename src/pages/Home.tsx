import { useState } from 'react';
import StartButton from '../components/StartButton';

export default function Home() {
    const [loading, setLoading] = useState(false);

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            console.log('Start game:', data);
        } catch (err) {
            console.error(err);
            alert('Failed to start game.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <StartButton onClick={handleStart} disabled={loading} loading={loading} />
        </div>
    );
}
