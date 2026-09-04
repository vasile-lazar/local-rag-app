import { useState, useEffect, useCallback } from 'react';
import { useAxios } from '../axios';
import type { ConversationSummary } from '../types';

export function useConversations() {
    const { api } = useAxios();
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!api) return;
        setIsLoading(true);
        try {
            const res = await api.get('/api/conversations');
            setConversations(res);
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    useEffect(() => { refresh(); }, [refresh]);

    return { conversations, isLoading, refresh };
}