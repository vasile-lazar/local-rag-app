import { ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { Message } from '../../types';

export function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user';

    if (message.isError) {
        const isTransient = message.errorSeverity === 'transient';
        return (
            <div className="flex justify-start">
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 flex items-start gap-2 ${
                    isTransient ? 'chat-bubble-error-transient' : 'chat-bubble-error-failed'
                }`}>
                    {isTransient
                        ? <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        : <XCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />}
                    <span className="text-sm">{message.content}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                isUser ? 'accent-bg accent-fg' : 'bg-theme-card border border-theme text-theme'
            }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-theme/20 flex flex-wrap gap-1.5">
                        {message.sources.map((s) => (
                            <span
                                key={s.id}
                                className="text-[11px] px-2 py-0.5 rounded-full bg-theme-alt text-muted"
                                title={`Distance: ${s.distance.toFixed(3)}`}
                            >
                                {s.id.replace('Articolul_', 'Art. ')}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}