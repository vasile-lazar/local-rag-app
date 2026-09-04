import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { useConversations } from '../../hooks/useConversations';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { PATHS } from '../../routes/paths';

export const Chat: React.FC = () => {
    const { id } = useParams();
    const conversationId = id ? Number(id) : undefined;
    const navigate = useNavigate();
    const bottomRef = useRef<HTMLDivElement>(null);

    const { messages, isSending, isLoadingHistory, sendMessage } = useChat(conversationId);
    const { refresh: refreshSidebar } = useConversations();
    
    // Combine loaded history with any messages sent this session.
    // History resets when switching conversations; live messages are this session's additions.

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isSending]);

    const handleSend = async (query: string) => {
        const result = await sendMessage(query);
        // First message in a new conversation — the backend just created one.
        // Update the URL to reflect it, and refresh the sidebar so it appears there.
        if (!conversationId && result?.conversationId) {
            navigate(PATHS.app.chatConversation.replace(':id', String(result.conversationId)), { replace: true });
        }
        refreshSidebar();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 max-w-3xl mx-auto w-full">
                {isLoadingHistory && (
                    <p className="text-sm text-muted text-center">Loading conversation…</p>
                )}

                {!isLoadingHistory && messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-20">
                        <h2 className="text-xl font-medium text-theme">Ask about the Constitution</h2>
                        <p className="text-sm text-muted max-w-sm">
                            Every answer cites the specific article it's based on.
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {messages.map((m) => (
                        <MessageBubble key={m.id} message={m} />
                    ))}
                    {isSending && <TypingIndicator />}
                </div>

                <div ref={bottomRef} />
            </div>

            <div className="max-w-3xl mx-auto w-full">
                <ChatInput onSend={handleSend} disabled={isSending} />
            </div>
        </div>
    );
};