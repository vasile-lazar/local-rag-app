import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { Guard } from './Guard';
import { PATHS } from './paths';

import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { Chat } from '../pages/chat/Chat';
// import { AdminConversations } from '../pages/admin/AdminConversations';
// import { ErrorPage } from '../pages/ErrorPage';

const router = createBrowserRouter([
    { path: '/', element: <Navigate to={PATHS.app.chat} replace /> },

    // Auth pages — redirect away if already logged in
    {
        element: <Guard publicOnly />,
        children: [
            {
                element: <AuthLayout />,
                children: [
                    { path: PATHS.public.login, element: <Login /> },
                    { path: PATHS.public.register, element: <Register /> },
                ],
            },
        ],
    },

    // Chat — any authenticated user or admin
    {
        element: <Guard requireAuth allowedRoles={['user', 'admin']} />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: PATHS.app.chat, element: <Chat /> },
                    { path: PATHS.app.chatConversation, element: <Chat /> },
                ],
            },
        ],
    },

    // Admin only
    {
        element: <Guard requireAuth allowedRoles={['admin']} />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    // { path: PATHS.admin.conversations, element: <AdminConversations /> },
                ],
            },
        ],
    },

    // { path: PATHS.public.forbidden, element: <ErrorPage variant="403" /> },
    // { path: '*', element: <ErrorPage variant="404" /> },
    // { path: PATHS.public.unauthorized, element: <ErrorPage variant="401" /> },
    // { path: PATHS.public.badRequest, element: <ErrorPage variant="400" /> },
    // { path: PATHS.public.serverError, element: <ErrorPage variant="500" /> },
]);

export const AppRoutes = () => <RouterProvider router={router} />;