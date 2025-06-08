/**
 * Custom hooks for API state management
 * Provides loading, error, and data states for API calls
 */

import { useState, useEffect, useCallback } from "react";
import { ApiResponse, ApiError } from "./api";

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for API calls with loading and error states
 */
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();

      if (response.success) {
        setData(response.data || null);
      } else {
        setError(response.message || "API call failed");
      }
    } catch (err) {
      console.error("API Error:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE operations)
 */
export function useMutation<T, P = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (
      apiCall: (params: P) => Promise<ApiResponse<T>>,
      params: P
    ): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall(params);

        if (response.success) {
          return response.data || null;
        } else {
          setError(response.message || "Mutation failed");
          return null;
        }
      } catch (err) {
        console.error("Mutation Error:", err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    mutate,
    loading,
    error,
    clearError: () => setError(null),
  };
}
