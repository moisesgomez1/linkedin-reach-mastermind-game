import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StartButton from '../components/StartButton';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/start', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            console.log('Start game:', data);
            // Navigate to mastermind game page after succesfully starting a new game
            navigate('/mastermind');
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
