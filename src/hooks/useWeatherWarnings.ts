'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  WarningLevel,
  WeatherInfo,
  WeatherWarningType,
} from '@/types/disaster';

/**
 * 気象警報・注意報を取得するフック
 *
 * 気象庁の防災情報APIから鳴門市（徳島県）の警報・注意報を取得します。
 * API: https://www.jma.go.jp/bosai/warning/data/warning/{areaCode}.json
 * 鳴門市のエリアコード: 3620000（徳島県）
 */
export function useWeatherWarnings(): {
  data: WeatherInfo | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
} {
  const [data, setData] = useState<WeatherInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 鳴門市のエリアコード（徳島県）
  const AREA_CODE = '3620000';

  const fetchWeatherWarnings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 気象庁防災情報API（JSON形式）
      // 注意: CORS制限があるため、Next.js API Route経由で取得する必要がある場合があります
      const response = await fetch(
        `https://www.jma.go.jp/bosai/warning/data/warning/${AREA_CODE}.json`,
        {
          // CORS対策: プロキシ経由またはNext.js API Routeを使用
          // 現時点では直接取得を試みる（CORSエラーが発生する場合はAPI Routeを作成）
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error(
          `気象情報の取得に失敗しました (HTTP ${response.status})`
        );
      }

      const json = (await response.json()) as {
        [key: string]: {
          areaCode: string;
          areaName: string;
          warnings: Array<{
            code: string;
            name: string;
            status: string;
          }>;
        };
      };

      // データを正規化
      const areaData = json[AREA_CODE];
      if (!areaData) {
        throw new Error('鳴門市の気象情報が見つかりませんでした');
      }

      const weatherInfo: WeatherInfo = {
        areaCode: areaData.areaCode,
        areaName: areaData.areaName,
        warnings: areaData.warnings.map((w) => ({
          code: w.code,
          name: w.name as WeatherWarningType,
          level:
            w.code.includes('warning') || w.code.includes('警報')
              ? ('warning' as WarningLevel)
              : w.code.includes('advisory') || w.code.includes('注意報')
                ? ('advisory' as WarningLevel)
                : ('none' as WarningLevel),
          status: w.status as '発表' | '継続' | '解除',
          publishedAt: new Date().toISOString(), // APIから取得できない場合は現在時刻
        })),
        updatedAt: new Date().toISOString(),
      };

      setData(weatherInfo);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '気象情報の取得に失敗しました';
      setError(new Error(errorMessage));
      setData(null);
      console.error('Failed to fetch weather warnings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retryカウンターによる再フェッチのためretryCountが必要
  useEffect(() => {
    fetchWeatherWarnings();

    // 5分ごとに自動更新
    const interval = setInterval(
      () => {
        fetchWeatherWarnings();
      },
      5 * 60 * 1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [fetchWeatherWarnings, retryCount]);

  const retry = useCallback((): void => {
    setRetryCount((prev) => prev + 1);
  }, []);

  return { data, isLoading, error, retry };
}
