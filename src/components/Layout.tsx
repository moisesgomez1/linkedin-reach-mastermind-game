import { ReactNode } from 'react';
import SignOutButton from './SignOutButton';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen relative">
            {/* Floating Sign Out Button */}
            <div className="absolute top-4 right-6">
                <SignOutButton />
            </div>

            {/* Page content */}
            {children}
        </div>
    );
}
