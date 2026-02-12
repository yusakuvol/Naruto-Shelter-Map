import { useCallback, useEffect, useState } from 'react';
import type { ShelterGeoJSON } from '@/types/shelter';

/** キャッシュをバイパスして最新を取得する用の URL（SW プリキャッシュにヒットさせない） */
function getSheltersUrl(cacheBust = false): string {
  if (cacheBust) {
    return `/data/shelters.geojson?t=${Date.now()}`;
  }
  return '/data/shelters.geojson';
}

const REFRESH_ERROR_DURATION_MS = 6000;

export function useShelters(): {
  data: ShelterGeoJSON | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
  /** 通信して最新データを取得（押したときだけ。通常はキャッシュのみで通信しない） */
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  /** refresh 失敗時のメッセージ（オフライン等）。数秒で自動クリア。 */
  refreshError: Error | null;
  clearRefreshError: () => void;
} {
  const [data, setData] = useState<ShelterGeoJSON | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<Error | null>(null);

  const clearRefreshError = useCallback((): void => {
    setRefreshError(null);
  }, []);

  const fetchShelters = useCallback(async (bypassCache: boolean) => {
    const url = getSheltersUrl(bypassCache);
    try {
      if (!bypassCache) setIsLoading(true);
      setError(null);
      if (bypassCache) setRefreshError(null);

      const response = await fetch(url, {
        cache: bypassCache ? 'no-store' : 'default',
      });

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
      const errorObj = new Error(errorMessage);
      setError(errorObj);
      if (!bypassCache) setData(null);
      if (bypassCache) {
        setRefreshError(errorObj);
        setTimeout(() => setRefreshError(null), REFRESH_ERROR_DURATION_MS);
      }
      console.error('Failed to fetch shelters:', err);
    } finally {
      if (!bypassCache) setIsLoading(false);
      if (bypassCache) setIsRefreshing(false);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retryカウンターによる再フェッチのためretryCountが必要
  useEffect(() => {
    fetchShelters(false);
  }, [fetchShelters, retryCount]);

  const retry = useCallback((): void => {
    setRetryCount((prev) => prev + 1);
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    await fetchShelters(true);
  }, [fetchShelters]);

  return {
    data,
    isLoading,
    error,
    retry,
    refresh,
    isRefreshing,
    refreshError,
    clearRefreshError,
  };
}
