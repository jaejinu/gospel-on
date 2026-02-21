"use client";

import { useState, useEffect, useCallback } from "react";

interface UseFetchOptions {
  immediate?: boolean;
}

export function useFetch<T>(url: string, options: UseFetchOptions = {}) {
  const { immediate = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (overrideUrl?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(overrideUrl || url);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "데이터를 불러오는데 실패했습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return { data, isLoading, error, refetch: fetchData };
}
