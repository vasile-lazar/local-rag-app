// hooks/useChat.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAxios } from '../axios';
import type { Message, AskResponse } from '../types';

export function useChat(conversationId?: number) {
    const { api } = useAxios();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const loadedIdRef = useRef<number | undefined>(undefined);

    // Fetch history only when we land on a conversation ID we haven't
    // already got messages for in this session (e.g. clicked from sidebar,
    // or a page refresh) — never re-fetch one we just created locally.
    useEffect(() => {
        if (!api) return;

        if (!conversationId) {
            loadedIdRef.current = undefined;
            setMessages([]);
            return;
        }

        if (loadedIdRef.current === conversationId) return; // already have it

        setIsLoadingHistory(true);
        api.get(`/api/conversations/${conversationId}`)
            .then((res: any) => {
                const mapped: Message[] = res.messages.map((m: any) => ({
                    id: m.id,
                    role: m.role.toLowerCase(),
                    content: m.content,
                    sources: m.sourcesJson ? JSON.parse(m.sourcesJson) : undefined,
                    isError: m.isError,
                    errorSeverity: m.errorSeverity,
                    createdAtTimestamp: m.createdAtTimestamp,
                }));
                setMessages(mapped);
                loadedIdRef.current = conversationId;
            })
            .finally(() => setIsLoadingHistory(false));
    }, [api, conversationId]);

    const sendMessage = useCallback(async (query: string): Promise<AskResponse | undefined> => {
        if (!api) return undefined;

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: query,
            createdAtTimestamp: Date.now() / 1000,
        };
        setMessages(prev => [...prev, userMessage]);
        setIsSending(true);

        try {
            const res: AskResponse = await api.post('/api/conversations/ask', { conversationId, query });

            const assistantMessage: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: res.answer,
                sources: res.sources,
                isError: res.isError,
                errorSeverity: res.errorSeverity,
                createdAtTimestamp: Date.now() / 1000,
            };
            setMessages(prev => [...prev, assistantMessage]);

            // We already have this message locally — mark this conversation
            // ID as "loaded" so the effect above doesn't re-fetch and duplicate it.
            if (res.conversationId) {
                loadedIdRef.current = res.conversationId;
            }

            return res;
        } finally {
            setIsSending(false);
        }
    }, [api, conversationId]);

    return { messages, isSending, isLoadingHistory, sendMessage };
}