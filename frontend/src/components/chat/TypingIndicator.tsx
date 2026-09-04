export function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-4 py-3 w-fit rounded-2xl bg-theme-card">
            <span className="w-2 h-2 rounded-full bg-theme-muted animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-theme-muted animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-theme-muted animate-bounce" />
        </div>
    );
}