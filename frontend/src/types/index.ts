export type UserRole = 'user' | 'admin';

export interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
}
export interface ConversationSummary {
    id: number;
    title: string | null;
    createdAtTimestamp: number;
}

export interface Source {
    id: string;
    distance: number;
}

export interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    sources?: Source[];
    isError?: boolean;
    errorSeverity?: 'transient' | 'failed' | null;
    createdAtTimestamp: number;
}

export interface ConversationDetail {
    id: number;
    title: string | null;
    createdAtTimestamp: number;
    messages: Message[];
}

export interface AskResponse {
    conversationId: number;
    answer: string;
    sources: Source[];
    isError: boolean;
    errorSeverity: 'transient' | 'failed' | null;
}