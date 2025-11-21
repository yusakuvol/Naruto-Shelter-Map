'use client';

import { clsx } from 'clsx';
import type { ReactElement } from 'react';
import type { WeatherWarning } from '@/types/disaster';

interface WeatherWarningBannerProps {
  warnings: WeatherWarning[];
  areaName: string;
  onClose?: () => void;
}

/**
 * 気象警報・注意報バナーコンポーネント
 *
 * 画面上部に警報・注意報を表示します。
 * 重要度に応じて色分けされます（赤: 警報、黄: 注意報）。
 */
export function WeatherWarningBanner({
  warnings,
  areaName,
  onClose,
}: WeatherWarningBannerProps): ReactElement | null {
  // 警報・注意報がない場合は表示しない
  const activeWarnings = warnings.filter(
    (w) => w.level !== 'none' && w.status !== '解除'
  );

  if (activeWarnings.length === 0) {
    return null;
  }

  // 警報と注意報を分離
  const criticalWarnings = activeWarnings.filter((w) => w.level === 'warning');
  const advisories = activeWarnings.filter((w) => w.level === 'advisory');

  // 警報がある場合は警報を優先表示
  const displayWarnings =
    criticalWarnings.length > 0 ? criticalWarnings : advisories;
  const isWarning = criticalWarnings.length > 0;

  return (
    <div
      className={clsx(
        'sticky top-0 z-50 w-full px-4 py-3 shadow-md',
        isWarning ? 'bg-red-600 text-white' : 'bg-yellow-500 text-yellow-900'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* アイコン */}
          <svg
            className={clsx(
              'h-6 w-6 shrink-0',
              !isWarning && 'text-yellow-900'
            )}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>

          {/* メッセージ */}
          <div className="flex-1">
            <p className="font-semibold">
              {displayWarnings.map((w) => w.name).join('・')}
              {isWarning ? '警報' : '注意報'} 発令中（{areaName}）
            </p>
            {displayWarnings.length > 1 && (
              <p className="mt-1 text-sm opacity-90">
                他 {displayWarnings.length - 1}件の
                {isWarning ? '警報' : '注意報'}
              </p>
            )}
          </div>
        </div>

        {/* 閉じるボタン */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={clsx(
              'rounded-full p-1 transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2',
              isWarning ? 'focus:ring-white' : 'focus:ring-yellow-900'
            )}
            aria-label="閉じる"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
