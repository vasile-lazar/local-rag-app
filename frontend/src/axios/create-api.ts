import type { AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";
import type { ApiClient, OnNotify } from "./types";

type CreateApiOptions = {
    onNotify?: OnNotify;
};

export function createApi(client: AxiosInstance, opts?: CreateApiOptions): ApiClient {
    const requestHandler = async <T>(request: () => Promise<AxiosResponse<T>>): Promise<T> => {
        try {
            const res = await request();
            return res.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const url = err.config?.url?.toString();

                // library-friendly: just notify via callback (optional)
                if (opts?.onNotify && !((err.config as any)?._skipNotify)) {
                    opts.onNotify({
                        level: "error",
                        message: "Request failed",
                        status,
                        url,
                        code: err.code,
                    });
                }
            }
            throw err;
        }
    };

    return {
        get: (url, config) => requestHandler(() => client.get(url, config)),
        post: (url, data, config) => requestHandler(() => client.post(url, data, config)),
        put: (url, data, config) => requestHandler(() => client.put(url, data, config)),
        patch: (url, data, config) => requestHandler(() => client.patch(url, data, config)),
        delete: (url, config) => requestHandler(() => client.delete(url, config)),

        postBlob: async (url, data, config) => {
            const res = await client.post(url, data, { ...config, responseType: "blob" });
            return res.data as Blob;
        },

        uploadFile: (url, formData, config) =>
            requestHandler(() =>
                client.post(url, formData, {
                    ...config,
                    headers: {
                        ...(config?.headers || {}),
                        "Content-Type": "multipart/form-data",
                    },
                })
            ),
    };
}