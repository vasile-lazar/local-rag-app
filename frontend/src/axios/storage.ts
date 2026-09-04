import type { TokenStorage } from "./types";

export function createSessionStorageTokenStorage(key: string): TokenStorage {
    return {
        get: () => {
            if (typeof window === "undefined") return undefined;
            return window.sessionStorage.getItem(key) ?? undefined;
        },
        set: (token?: string) => {
            if (typeof window === "undefined") return;
            if (token) window.sessionStorage.setItem(key, token);
            else window.sessionStorage.removeItem(key);
        },
    };
}

export function createLocalStorageTokenStorage(key: string): TokenStorage {
    return {
        get: () => {
            if (typeof window === "undefined") return undefined;
            return window.localStorage.getItem(key) ?? undefined;
        },
        set: (token?: string) => {
            if (typeof window === "undefined") return;
            if (token) window.localStorage.setItem(key, token);
            else window.localStorage.removeItem(key);
        },
    };
}

export function createMemoryTokenStorage(initial?: string): TokenStorage {
    let token = initial;
    return {
        get: () => token,
        set: (t?: string) => {
            token = t;
        },
    };
}