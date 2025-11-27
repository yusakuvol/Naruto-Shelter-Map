'use client';

import { useCallback, useEffect, useState } from 'react';
import type { EvacuationInfo } from '@/types/disaster';

/**
 * 避難情報を取得するフック
 *
 * 注意: 実際のAPIエンドポイントは調査が必要です。
 * 候補:
 * - L-Alert（災害情報共有システム）
 * - 総務省消防庁API
 * - 鳴門市公式API
 *
 * 現時点では、将来の実装のための構造を提供します。
 */
export function useEvacuationInfo(): {
  data: EvacuationInfo[] | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
} {
  const [data, setData] = useState<EvacuationInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchEvacuationInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: 実際のAPIエンドポイントを実装
      // 現時点では、モックデータまたは空の配列を返す
      // 実際のAPIが利用可能になったら、以下のように実装:
      //
      // const response = await fetch('https://api.example.com/evacuation-info');
      // if (!response.ok) {
      //   throw new Error(`避難情報の取得に失敗しました (HTTP ${response.status})`);
      // }
      // const json = await response.json();
      // setData(json);

      // 現時点では空の配列を返す（避難情報がない状態）
      setData([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '避難情報の取得に失敗しました';
      setError(new Error(errorMessage));
      setData(null);
      console.error('Failed to fetch evacuation info:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retryカウンターによる再フェッチのためretryCountが必要
  useEffect(() => {
    fetchEvacuationInfo();

    // 1分ごとに自動更新（緊急時は頻繁に更新）
    const interval = setInterval(
      () => {
        fetchEvacuationInfo();
      },
      1 * 60 * 1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [fetchEvacuationInfo, retryCount]);

  const retry = useCallback((): void => {
    setRetryCount((prev) => prev + 1);
  }, []);

  return { data, isLoading, error, retry };
}
