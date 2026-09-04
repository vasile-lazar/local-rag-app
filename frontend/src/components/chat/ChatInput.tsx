import { useState, type SubmitEventHandler } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface ChatInputProps {
    onSend: (query: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [value, setValue] = useState('');

    const submit = () => {
        const trimmed = value.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setValue('');
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        submit();
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 border-t border-theme">
            <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submit();
                    }
                }}
                placeholder="Ask about the Constitution…"
                rows={1}
                disabled={disabled}
                className="flex-1 resize-none px-4 py-3 rounded-xl bg-theme-alt border border-theme text-theme text-sm outline-none focus:border-accent transition-colors disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={disabled || !value.trim()}
                className="p-3 rounded-xl accent-bg accent-fg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
            >
                <PaperAirplaneIcon className="h-5 w-5" />
            </button>
        </form>
    );
}