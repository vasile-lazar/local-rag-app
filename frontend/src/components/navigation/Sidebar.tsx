import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    PlusIcon, ChatBubbleLeftIcon, ShieldCheckIcon,
    ArrowRightStartOnRectangleIcon, Bars3Icon, XMarkIcon,
    ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '../../hooks/useAuth';
import { useConversations } from '../../hooks/useConversations';
import { useToggle } from '../../hooks/useToggle';
import { PATHS } from '../../routes/paths';
import type { User as UserType } from '../../types';

interface SidebarProps {
    user: UserType;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const roleLabel: Record<string, string> = {
    admin: 'Admin',
    user: 'Member',
};

export const Sidebar: React.FC<SidebarProps> = ({
                                                    user,
                                                    isCollapsed = false,
                                                    onToggleCollapse,
                                                }) => {
    const { logout } = useAuth();
    const { conversations, isLoading } = useConversations();
    const navigate = useNavigate();
    const [isMobileOpen, toggleMobile, setMobileOpen] = useToggle(false);

    const handleLogout = () => {
        logout();
        navigate(PATHS.public.login);
    };

    const handleNewChat = () => {
        navigate(PATHS.app.chat);
        setMobileOpen(false);
    };

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => toggleMobile()}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl border border-theme shadow-lg"
                style={{ background: 'var(--bg-card)' }}
                aria-label="Toggle menu"
            >
                {isMobileOpen ? <XMarkIcon className="h-5 w-5 text-theme" /> : <Bars3Icon className="h-5 w-5 text-theme" />}
            </button>

            {/* Backdrop */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 flex flex-col
                    border-r border-theme
                    transform transition-[width,transform] duration-300 ease-in-out
                    lg:translate-x-0
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
                    w-64
                `}
                style={{ background: 'var(--bg-card)' }}
            >
                {/* Brand */}
                <div className={`relative z-10 border-b border-theme flex items-center min-h-[72px] ${
                    isCollapsed ? 'justify-center px-3' : 'px-5'
                }`}>
                    {!isCollapsed && (
                        <span className="text-xl font-semibold tracking-wide text-theme">RagApp</span>
                    )}
                    {isCollapsed && (
                        <span className="text-lg font-semibold accent-text">R</span>
                    )}

                    <button
                        onClick={onToggleCollapse}
                        className={`
                            hidden lg:flex items-center justify-center flex-shrink-0
                            w-7 h-7 rounded-lg border border-theme text-muted
                            hover:accent-text hover:border-accent transition-all duration-200
                            ${isCollapsed ? 'absolute -right-3.5 top-1/2 -translate-y-1/2 z-10' : ''}
                        `}
                        style={{ background: 'var(--bg-alt)' }}
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        {isCollapsed
                            ? <ChevronRightIcon className="h-3.5 w-3.5" />
                            : <ChevronLeftIcon className="h-3.5 w-3.5" />}
                    </button>
                </div>

                {/* New conversation */}
                <div className={`relative z-10 mx-3 mt-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <button
                        onClick={handleNewChat}
                        className={`flex items-center gap-2 accent-bg accent-fg rounded-xl font-medium text-sm transition-opacity hover:opacity-90 ${
                            isCollapsed ? 'p-2.5' : 'w-full justify-center px-3 py-2.5'
                        }`}
                        title={isCollapsed ? 'New conversation' : undefined}
                    >
                        <PlusIcon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span>New conversation</span>}
                    </button>
                </div>

                {/* Conversation list */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    {!isCollapsed && (
                        <>
                            {isLoading && (
                                <p className="text-xs text-muted px-3 py-2">Loading conversations…</p>
                            )}
                            {!isLoading && conversations.length === 0 && (
                                <p className="text-xs text-muted px-3 py-2">No conversations yet</p>
                            )}
                            <ul className="flex flex-col gap-1">
                                {conversations.map((c) => (
                                    <li key={c.id}>
                                        <NavLink
                                            to={PATHS.app.chatConversation.replace(':id', String(c.id))}
                                            onClick={() => setMobileOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-2 px-3 py-2 rounded-xl text-sm truncate transition-all ${
                                                    isActive
                                                        ? 'accent-bg accent-fg font-medium'
                                                        : 'text-muted hover:text-theme hover:bg-theme-alt'
                                                }`
                                            }
                                        >
                                            <ChatBubbleLeftIcon className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">{c.title ?? 'Untitled'}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </nav>

                {/* User card + admin link + logout */}
                <div className="relative z-10 border-t border-theme p-3 space-y-2">
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-1'}`}>
                        <div className="w-8 h-8 rounded-full accent-bg accent-fg flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-theme truncate">{user.username}</p>
                                <p className="text-[10px] tracking-widest accent-text uppercase">
                                    {roleLabel[user.role] ?? user.role}
                                </p>
                            </div>
                        )}
                    </div>

                    {user.role === 'admin' && (
                        <NavLink
                            to={PATHS.admin.conversations}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-2 rounded-xl text-muted hover:text-theme hover:bg-theme-alt transition-all text-xs ${
                                isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
                            }`}
                            title={isCollapsed ? 'Admin' : undefined}
                        >
                            <ShieldCheckIcon className="h-4 w-4 flex-shrink-0" />
                            {!isCollapsed && <span>Admin panel</span>}
                        </NavLink>
                    )}

                    <button
                        onClick={handleLogout}
                        title={isCollapsed ? 'Log out' : undefined}
                        className={`flex items-center gap-2 rounded-xl text-muted hover:text-theme hover:bg-theme-card transition-all text-xs w-full ${
                            isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
                        }`}
                    >
                        <ArrowRightStartOnRectangleIcon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span>Log out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};