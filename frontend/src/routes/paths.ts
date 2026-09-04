export const PATHS = {
    public: {
        login: '/login',
        register: '/register',
        forbidden: '/403',
        notFound: '/404',
        unauthorized: '/401',
        badRequest: '/400',
        serverError: '/500',
    },
    app: {
        chat: '/chat',
        chatConversation: '/chat/:id',
    },
    admin: {
        conversations: '/admin/conversations',
    },

} as const;