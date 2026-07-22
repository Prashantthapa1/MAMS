import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { ApiResponse } from '../api/types';

export function useApiResource<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<ApiResponse<T>>(endpoint);
      setData(response.data.data);
    } catch {
      setError('Unable to load data. Check that the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = useCallback(
    async (id: string) => {
      await api.delete(`${endpoint}/${id}`);
      await load();
    },
    [endpoint, load],
  );

  return { data, isLoading, error, reload: load, remove };
}
