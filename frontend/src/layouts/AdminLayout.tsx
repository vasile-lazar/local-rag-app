import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AdminLayout: React.FC = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="min-h-screen bg-theme">
            <header className="border-b border-theme px-6 py-4 flex items-center justify-between">
                <h1 className="text-lg font-medium text-theme">Admin</h1>
                <span className="text-sm text-muted">{user.username}</span>
            </header>
            <main className="p-6">
                <Outlet />
            </main>
        </div>
    );
};