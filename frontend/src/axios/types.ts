import type {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";

export type Token = string;

export type TokenStorage = {
    get: () => Token | undefined;
    set: (token?: Token) => void;
};

export type RefreshResult = {
    accessToken: Token;
};

export type NotifyLevel = "info" | "success" | "warning" | "error";

export type NotifyPayload = {
    level: NotifyLevel;
    message: string;
    // optional metadata consumers might use
    code?: string;
    status?: number;
    url?: string;
};

export type RetriableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
    _skipNotify?: boolean;
};

export type ShouldRetry = (error: AxiosError, config: RetriableRequestConfig) => boolean;

export type ShouldRefresh = (error: AxiosError, config: RetriableRequestConfig) => boolean;

export type IsRefreshRequest = (config: InternalAxiosRequestConfig) => boolean;

export type OnAuthFailure = (reason: {
    error?: unknown;
    lastToken?: string;
}) => void;

export type OnNotify = (payload: NotifyPayload) => void;

export type GetTimeZone = () => string;

export type BuildAuthHeader = (token: Token) => string;

export type CreateAxiosInstance = (params: {
    baseURL: string;
}) => AxiosInstance;

export type RefreshAccessToken = (params: {
    refreshClient: AxiosInstance;
    token: Token;
}) => Promise<RefreshResult>;

export type ApiClient = {
    get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
    postBlob: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<Blob>;
    uploadFile: <T = any>(
        url: string,
        formData: FormData,
        config?: AxiosRequestConfig
    ) => Promise<T>;
};

export type AxiosProviderProps = {
    children: React.ReactNode;

    /**
     * Base URL for both main and refresh clients.
     */
    baseURL?: string;

    /**
     * Token storage adapter (sessionStorage, localStorage, memory, etc.)
     */
    tokenStorage?: TokenStorage;

    /**
     * Default: Intl.DateTimeFormat().resolvedOptions().timeZone
     */
    getTimeZone?: GetTimeZone;

    /**
     * Default: token => `Bearer ${token}`
     */
    buildAuthHeader?: BuildAuthHeader;

    /**
     * Custom factory for axios instances.
     */
    createMainClient?: CreateAxiosInstance;

    /**
     * Custom factory for refresh client (often withCredentials true).
     */
    createRefreshClient?: CreateAxiosInstance;

    /**
     * Called when 401 happens and refresh fails (or no token).
     * You can redirect to login, clear app state, etc.
     */
    onAuthFailure?: OnAuthFailure;

    /**
     * Optional UI notification hook (toast/i18n is implemented in your app, not here).
     */
    onNotify?: OnNotify;

    /**
     * Decide if we should attempt refresh on this error.
     * Default: status === 401 and not already retried.
     */
    shouldRefresh?: ShouldRefresh;

    /**
     * Decide if we should retry for non-refreshable cases.
     * Default: false (only refresh flow does retry).
     */
    shouldRetry?: ShouldRetry;

    /**
     * Identify refresh requests to avoid refresh loops.
     * If you use refreshAccessToken that calls /auth/refresh, mark it here.
     * Default: config.url includes "/auth/refresh"
     */
    isRefreshRequest?: IsRefreshRequest;

    /**
     * Your refresh implementation (library doesn't know your endpoint/body).
     */
    refreshAccessToken?: RefreshAccessToken;

    /**
     * Expose the helper `api` wrapper (data-unwrapping)
     * Default: true
     */
    exposeApi?: boolean;
};

export type AxiosContextValue = {
    client: AxiosInstance;
    refreshClient: AxiosInstance;

    token?: Token;
    setToken: (token?: Token) => void;

    api?: ApiClient;
};