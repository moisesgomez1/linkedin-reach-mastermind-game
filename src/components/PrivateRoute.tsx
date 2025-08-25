import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ReactElement } from 'react';

export default function PrivateRoute({ children }: { children: ReactElement }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="text-center mt-10">Loading…</div>;
    if (!user) return <Navigate to="/login" />;

    return children;
}
