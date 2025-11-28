'use client';

import { useCallback, useEffect, useState } from 'react';
import type { HazardMapInfo } from '@/types/disaster';

/**
 * ハザードマップ情報を取得するカスタムフック
 *
 * 現在はプレースホルダー実装。
 * 将来的には以下のAPIと連携する予定：
 *
 * - 国土交通省「不動産情報ライブラリ」防災情報API
 *   - 洪水浸水想定区域、土砂災害警戒区域、津波浸水想定、高潮浸水想定区域を提供
 *   - https://www.mlit.go.jp/report/press/tochi_fudousan_kensetsugyo17_hh_000001_00068.html
 *
 * - 全国避難所ガイド「全国ハザードデータベースAPI」
 *   - 土砂災害警戒区域、洪水浸水想定区域、津波浸水想定区域のデータを提供
 *   - https://www.hinanjyo.jp/api.html
 *
 * 実装時は、エンドポイントURL、認証方法、データ形式を確認してから実装すること。
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
      // 利用可能なAPI:
      // - 国土交通省「不動産情報ライブラリ」防災情報API
      // - 全国避難所ガイド「全国ハザードデータベースAPI」
      // 実装時は、エンドポイントURL、認証方法、データ形式を確認してから実装すること。
      // 現時点では、モックデータまたは空の配列を返す

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
