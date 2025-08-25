import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SignOutButton() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login'); // redirect to login after logout
    };

    if (!user) return null; // don’t render if not logged in

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 shadow"
        >
            Sign Out
        </button>
    );
}
