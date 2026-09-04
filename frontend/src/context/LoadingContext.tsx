import React, {createContext, useCallback, useContext, useState} from 'react';

interface LoadingContextValue {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function useLoading() {
    const ctx = useContext(LoadingContext);
    if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
    return ctx;
}

interface LoadingProviderProps {
    children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({children}) => {
    const [isLoading, setLoading] = useState(false);

    const withLoading = useCallback(
        async <T, >(fn: () => Promise<T>): Promise<T> => {
            setLoading(true);
            try {
                return await fn();
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const value: LoadingContextValue = {isLoading, setLoading, withLoading};
    return (
        <LoadingContext.Provider value={value}>
            {children}
            <LoadingOverlay/>
        </LoadingContext.Provider>
    );
};

function LoadingOverlay() {
    const ctx = useContext(LoadingContext);
    if (!ctx || !ctx.isLoading) return null;
    return (
        <div
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            role="progressbar"
            aria-label="Loading"
        >
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"/>
        </div>
    );
}
