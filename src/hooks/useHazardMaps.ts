'use client';

import { useCallback, useEffect, useState } from 'react';
import type { HazardMapInfo } from '@/types/disaster';

/**
 * ハザードマップ情報を取得するカスタムフック
 *
 * 現在はプレースホルダー実装。
 * 将来的には国土地理院のハザードマップAPIや
 * 鳴門市のハザードマップデータと連携する予定。
 */
export function useHazardMaps(): {
  data: HazardMapInfo[] | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
} {
  const [data, setData] = useState<HazardMapInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchHazardMaps = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: 実際のAPIエンドポイントを実装
      // 現時点では、モックデータまたは空の配列を返す
      // 実際のAPIが利用可能になったら、以下のように実装:
      //
      // const response = await fetch('https://api.example.com/hazard-maps');
      // if (!response.ok) {
      //   throw new Error(`ハザードマップ情報の取得に失敗しました (HTTP ${response.status})`);
      // }
      // const json = await response.json();
      // setData(json);

      // 現時点では空の配列を返す（ハザードマップ情報がない状態）
      setData([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'ハザードマップ情報の取得に失敗しました';
      setError(new Error(errorMessage));
      setData(null);
      console.error('Failed to fetch hazard maps:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retryカウンターによる再フェッチのためretryCountが必要
  useEffect(() => {
    fetchHazardMaps();

    // 10分ごとに自動更新
    const interval = setInterval(
      () => {
        fetchHazardMaps();
      },
      10 * 60 * 1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [fetchHazardMaps, retryCount]);

  const retry = useCallback((): void => {
    setRetryCount((prev) => prev + 1);
  }, []);

  return { data, isLoading, error, retry };
}
