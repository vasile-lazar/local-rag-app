import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import type {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from "axios";

import { AxiosContext } from "./context";
import { createApi } from "./create-api";
import type {
    AxiosProviderProps,
    RetriableRequestConfig,
    Token,
    TokenStorage,
} from "./types";

const defaultGetTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const defaultBuildAuthHeader = (t: string) => `Bearer ${t}`;
const defaultCreateClient = ({ baseURL }: { baseURL: string }) => axios.create({ baseURL });

const defaultIsRefreshRequest = (config: InternalAxiosRequestConfig) =>
    (config.url ?? "").toString().includes("/auth/refresh");

export function AxiosProvider({
                                  children,
                                  baseURL = import.meta.env.VITE_API_URL,
                                  tokenStorage,
                                  getTimeZone = defaultGetTimeZone,
                                  buildAuthHeader = defaultBuildAuthHeader,
                                  createMainClient = defaultCreateClient,
                                  createRefreshClient = ({ baseURL }) => axios.create({
                                      baseURL,
                                      withCredentials: true
                                  }),
                                  onAuthFailure,
                                  onNotify,
                                  shouldRefresh,
                                  shouldRetry,
                                  isRefreshRequest = defaultIsRefreshRequest,
                                  refreshAccessToken,
                                  exposeApi = true,
                              }: AxiosProviderProps) {
    const storage: TokenStorage = useMemo(
        () =>
            tokenStorage ?? {
                get: () => undefined,
                set: () => undefined,
            },
        [tokenStorage]
    );

    const [tokenState, setTokenState] = useState<Token | undefined>(() => storage.get());

    const tokenRef = useRef<Token | undefined>(tokenState);
    useEffect(() => {
        tokenRef.current = tokenState;
    }, [tokenState]);

    const setToken = useCallback(
        (t?: Token) => {
            storage.set(t);
            tokenRef.current = t;
            setTokenState(t);
        },
        [storage]
    );

    const client: AxiosInstance = useMemo(() => createMainClient({ baseURL }), [baseURL, createMainClient]);
    const refreshClient: AxiosInstance = useMemo(
        () => createRefreshClient({ baseURL }),
        [baseURL, createRefreshClient]
    );

    const refreshPromiseRef = useRef<Promise<Token> | null>(null);

    const doNotify = useCallback(
        (payload: {
            level: "info" | "success" | "warning" | "error";
            message: string;
            status?: number;
            code?: string;
            url?: string
        }) => {
            onNotify?.(payload);
        },
        [onNotify]
    );

    const defaultShouldRefresh = useCallback((error: AxiosError, config: RetriableRequestConfig) => {
        const status = error.response?.status;
        return status === 401 && !config._retry;
    }, []);

    const shouldRefreshFn = shouldRefresh ?? defaultShouldRefresh;

    const refreshToken = useCallback(async (): Promise<Token> => {
        if (!refreshAccessToken) {
            throw new Error("refreshAccessToken is not configured.");
        }

        if (refreshPromiseRef.current) return refreshPromiseRef.current;

        const task = (async () => {
            const current = tokenRef.current ?? storage.get();
            if (!current) throw new Error("Missing token.");

            const res = await refreshAccessToken({ refreshClient, token: current });
            if (!res?.accessToken) throw new Error("Refresh returned empty token.");

            setToken(res.accessToken);
            return res.accessToken;
        })();

        refreshPromiseRef.current = task;
        try {
            return await task;
        } finally {
            refreshPromiseRef.current = null;
        }
    }, [refreshAccessToken, refreshClient, setToken, storage]);

    const failAuth = useCallback(
        (reason: { error?: unknown }) => {
            const lastToken = tokenRef.current ?? storage.get();
            setToken(undefined);
            onAuthFailure?.({ error: reason.error, lastToken });
            doNotify({ level: "error", message: "Authentication required" });
        },
        [doNotify, onAuthFailure, setToken, storage]
    );

    useEffect(() => {
        const reqId = client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                config.headers = config.headers ?? {};

                config.headers["X-User-Time-Zone"] = getTimeZone();

                const t = tokenRef.current ?? storage.get();
                if (t) config.headers.Authorization = buildAuthHeader(t);
                else delete (config.headers as any).Authorization;

                return config;
            },
            (e) => Promise.reject(e)
        );

        const resId = client.interceptors.response.use(
            (r) => r,
            async (error: AxiosError) => {
                const original = error.config as RetriableRequestConfig | undefined;
                if (!original) return Promise.reject(error);

                if (error.code === "ERR_NETWORK") {
                    if (!original._skipNotify) doNotify({
                        level: "warning",
                        message: "Network error",
                        code: error.code
                    });
                    return Promise.reject(error);
                }

                if (shouldRetry?.(error, original) && !original._retry) {
                    original._retry = true;
                    return client(original);
                }

                if (shouldRefreshFn(error, original)) {
                    original._retry = true;

                    if (isRefreshRequest(original as any)) {
                        failAuth({ error });
                        return Promise.reject(error);
                    }

                    try {
                        const newToken = await refreshToken();
                        original.headers = original.headers ?? {};
                        (original.headers as any).Authorization = buildAuthHeader(newToken);
                        return client(original);
                    } catch (e) {
                        failAuth({ error: e });
                        return Promise.reject(e);
                    }
                }

                if (error.response?.status === 403) {
                    if (!original._skipNotify) doNotify({ level: "error", message: "Forbidden", status: 403 });
                }

                return Promise.reject(error);
            }
        );

        return () => {
            client.interceptors.request.eject(reqId);
            client.interceptors.response.eject(resId);
        };
    }, [
        client,
        buildAuthHeader,
        doNotify,
        failAuth,
        getTimeZone,
        isRefreshRequest,
        refreshToken,
        shouldRetry,
        shouldRefreshFn,
        storage,
    ]);

    const api = useMemo(() => (exposeApi ? createApi(client, { onNotify }) : undefined), [client, exposeApi, onNotify]);

    const value = useMemo(
        () => ({
            client,
            refreshClient,
            token: tokenState,
            setToken,
            api,
        }),
        [client, refreshClient, tokenState, setToken, api]
    );

    return <AxiosContext.Provider value={value}>{children}</AxiosContext.Provider>;
}