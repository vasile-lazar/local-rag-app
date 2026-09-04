import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-theme px-4">
            <div className="w-full max-w-md bg-theme-card border border-theme rounded-2xl p-8">
                <Outlet />
            </div>
        </div>
    );
};