import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';
import { PATHS } from './paths';

interface GuardProps {
    requireAuth?: boolean;
    allowedRoles?: UserRole[];
    publicOnly?: boolean;
    redirectTo?: string;
}

export function Guard({
                          requireAuth = false,
                          allowedRoles,
                          publicOnly = false,
                          redirectTo,
                      }: GuardProps) {
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();

    if (publicOnly && isAuthenticated) {
        const destination = redirectTo ?? (() => {
            if (user?.role === 'admin') return PATHS.admin.conversations;
            return PATHS.app.chat;
        })();
        return <Navigate to={destination} replace />;
    }

    if (requireAuth && !isAuthenticated) {
        return (
            <Navigate
                to={redirectTo ?? PATHS.public.login}
                replace
                state={{ from: location }}
            />
        );
    }

    if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
        return <Navigate to={redirectTo ?? PATHS.public.forbidden} replace />;
    }

    return <Outlet />;
}