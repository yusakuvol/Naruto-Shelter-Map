import { useCallback, useEffect, useState } from 'react';
import type { ShelterGeoJSON } from '@/types/shelter';

export function useShelters(): {
  data: ShelterGeoJSON | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
} {
  const [data, setData] = useState<ShelterGeoJSON | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchShelters = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/data/shelters.geojson');

      if (!response.ok) {
        throw new Error(
          `避難所データの読み込みに失敗しました (HTTP ${response.status})`
        );
      }

      const geojson = (await response.json()) as ShelterGeoJSON;
      setData(geojson);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '避難所データの読み込みに失敗しました';
      setError(new Error(errorMessage));
      setData(null);
      console.error('Failed to fetch shelters:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retryカウンターによる再フェッチのためretryCountが必要
  useEffect(() => {
    fetchShelters();
  }, [fetchShelters, retryCount]);

  const retry = useCallback((): void => {
    setRetryCount((prev) => prev + 1);
  }, []);

  return { data, isLoading, error, retry };
}
