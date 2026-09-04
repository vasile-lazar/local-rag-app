import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sidebar } from '../components/navigation/Sidebar';

export const AppLayout: React.FC = () => {
    const { user } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-theme">
            <Sidebar
                user={user}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
            />
            <main
                className={`flex-1 overflow-auto min-h-screen transition-[margin] duration-300 ease-in-out ${
                    isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
                }`}
            >
                <div className="h-full flex flex-col">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};