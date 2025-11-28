'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RiverWaterLevelInfo } from '@/types/disaster';

/**
 * 河川水位情報を取得するフック
 *
 * 国土交通省の川の防災情報から鳴門市周辺の河川（旧吉野川、今切川）の水位情報を取得します。
 * データは公開されているが、REST APIの詳細なエンドポイントは要確認。
 *
 * 参考:
 * - 国土交通省「川の防災情報」: https://www.river.go.jp/
 * - 各河川管理事務所が個別にAPIを提供している場合あり
 *
 * 実装時は、エンドポイントURL、認証方法、データ形式を確認してから実装すること。
 * 現時点では、将来の実装のための構造を提供します。
 */
export function useRiverWaterLevels(): {
  data: RiverWaterLevelInfo[] | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
} {
  const [data, setData] = useState<RiverWaterLevelInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 鳴門市周辺の河川観測所
  // TODO: 実際の観測所コードを調査
  // 国土交通省「川の防災情報」から観測所情報を取得する必要がある
  // const OBSERVATION_POINTS = [
  //   {
  //     riverName: '旧吉野川',
  //     observationPoint: '鳴門観測所',
  //     coordinates: [134.6, 34.17] as [number, number],
  //   },
  //   {
  //     riverName: '今切川',
  //     observationPoint: '鳴門観測所',
  //     coordinates: [134.6, 34.18] as [number, number],
  //   },
  // ];

  const fetchRiverWaterLevels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: 実際のAPIエンドポイントを実装
      // 国土交通省「川の防災情報」のREST APIエンドポイントを調査して実装すること。
      // 実装時は、エンドポイントURL、認証方法、データ形式を確認してから実装すること。
      // 現時点では、モックデータまたは空の配列を返す

      // 現時点では空の配列を返す（水位情報がない状態）
      setData([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '河川水位情報の取得に失敗しました';
      setError(new Error(errorMessage));
      setData(null);
      console.error('Failed to fetch river water levels:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retryカウンターによる再フェッチのためretryCountが必要
  useEffect(() => {
    fetchRiverWaterLevels();

    // 10分ごとに自動更新
    const interval = setInterval(
      () => {
        fetchRiverWaterLevels();
      },
      10 * 60 * 1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [fetchRiverWaterLevels, retryCount]);

  const retry = useCallback((): void => {
    setRetryCount((prev) => prev + 1);
  }, []);

  return { data, isLoading, error, retry };
}
