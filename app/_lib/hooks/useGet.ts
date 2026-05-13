"use client";

import { useCallback, useEffect, useState } from "react";

export function useGet<T>(url: string, initialValue: T) {
    const [data, setData] = useState<T>(initialValue);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (signal?: AbortSignal) => {
        await Promise.resolve();

        if (signal?.aborted) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(url, { signal });

            if (!res.ok) {
                throw new Error(`Request failed with status ${res.status}`);
            }

            const result = (await res.json()) as T;
            if (!signal?.aborted) {
                setData(result);
            }
        } catch (err) {
            if (signal?.aborted) {
                return;
            }

            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, [url]);

    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => {
            void fetchData(controller.signal);
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [fetchData]);

    return {
        data,
        setData,
        loading,
        error,
        refetch: fetchData,
    };
}
