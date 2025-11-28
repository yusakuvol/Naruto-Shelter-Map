'use client';

import { useCallback, useEffect, useState } from 'react';
import type { EvacuationInfo } from '@/types/disaster';

/**
 * 避難情報を取得するフック
 *
 * 以下のAPIが利用可能（実装時は詳細を確認すること）:
 *
 * - DMDATA.JP Service
 *   - 気象庁が配信する地震情報、津波情報、気象警報などをWebSocketでリアルタイム配信
 *   - https://dmdata.jp/
 *
 * - 全国避難所ガイド「開設避難所・混雑状況API」
 *   - 開設されている避難所の位置情報と混雑状況を提供
 *   - https://www.hinanjyo.jp/api.html
 *
 * - L-Alert（災害情報共有システム）
 *   - APIの公開状況は要確認
 *
 * 実装時は、エンドポイントURL、認証方法、データ形式を確認してから実装すること。
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
      // 利用可能なAPI:
      // - DMDATA.JP Service (WebSocket)
      // - 全国避難所ガイド「開設避難所・混雑状況API」
      // - L-Alert（要確認）
      // 実装時は、エンドポイントURL、認証方法、データ形式を確認してから実装すること。
      // 現時点では、モックデータまたは空の配列を返す

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
