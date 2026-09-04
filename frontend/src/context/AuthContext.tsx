import React, {createContext, useCallback, useEffect, useMemo, useState} from 'react';
import type {User, UserRole} from '../types';
import {useAxios} from '../axios';
import {useLoading} from "./LoadingContext.tsx";

const AUTH_USER_KEY = 'ragapp_user';
const AUTH_TOKEN_KEY = 'ragapp_token';
const AUTH_STORAGE_KEY = 'ragapp_use_session';

function parseRole(role: string): UserRole {
    const roles = ['user', 'admin'];
    if (roles.includes(role.toLowerCase())) {
        return role.toLowerCase() as UserRole;
    }
    throw new Error(`Invalid role: ${role}`);
}

function loadStoredAuth(): {
    user: User | null;
    token: string | null;
} {
    try {
        const rememberMe = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
        const storage = rememberMe ? localStorage : sessionStorage;

        const rawUser = storage.getItem(AUTH_USER_KEY);
        const user = rawUser ? (JSON.parse(rawUser) as User) : null;
        const token = storage.getItem(AUTH_TOKEN_KEY);

        return {user, token};
    } catch {
        return {user: null, token: null};
    }
}

export interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string, remember_me: boolean) => Promise<User>;
    logout: () => void;
    register: (username: string, email: string, password: string, confirmPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const {api, setToken, token} = useAxios();

    const [user, setUser] = useState<User | null>(null);
    const {withLoading} = useLoading();

    useEffect(() => {
        const {user: storedUser, token: storedToken} = loadStoredAuth();
        if (storedUser) setUser(storedUser);
        if (storedToken) setToken(storedToken);
    }, []);

    const persistUser = useCallback((userData: User, rememberMe: boolean, authToken: string) => {
        const storage = rememberMe ? localStorage : sessionStorage;
        const otherStorage = rememberMe ? sessionStorage : localStorage;

        otherStorage.removeItem(AUTH_USER_KEY);
        otherStorage.removeItem(AUTH_TOKEN_KEY);
        storage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        storage.setItem(AUTH_TOKEN_KEY, authToken);
        localStorage.setItem(AUTH_STORAGE_KEY, String(rememberMe));

        setUser(userData);
    }, []);

    const login = useCallback(
        async (email: string, password: string, remember_me: boolean): Promise<User> => {
            if (!api) throw new Error("API not ready");

            return withLoading(async () => {
                const res = await api.post('/api/auth/login', {email, password});

                const userData: User = {
                    id: res.id,
                    username: res.username,
                    email: res.email,
                    role: parseRole(res.role),
                };

                setToken(res.token);
                persistUser(userData, remember_me, res.token);
                return userData;
            });
        },
        [api, setToken, persistUser, withLoading]
    );

    const register = useCallback(
        async (username: string, email: string, password: string, confirmPassword: string) => {
            if (!api) throw new Error("API not ready");

            return withLoading(async () => {
                await api.post('/api/auth/register', {username, email, password, confirmPassword});
                await login(email, password, true);
            });
        },
        [api, login, withLoading]
    );

    const logout = useCallback(() => {
        setToken(undefined);

        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(AUTH_USER_KEY);
        sessionStorage.removeItem(AUTH_TOKEN_KEY);

        setUser(null);
    }, [setToken]);

    useEffect(() => {
        const handler = () => logout();
        window.addEventListener('auth:logout', handler);
        return () => window.removeEventListener('auth:logout', handler);
    }, [logout]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: !!user && !!token,
            login,
            logout,
            register,
        }),
        [user, token, login, logout, register]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};