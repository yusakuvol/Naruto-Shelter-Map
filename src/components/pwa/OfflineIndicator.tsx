'use client';

import type { ReactElement } from 'react';
import { useOffline } from '@/hooks/useOffline';

/**
 * オフライン状態を表示するインジケーター
 */
export function OfflineIndicator(): ReactElement | null {
  const isOffline = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
        <span>オフラインです。キャッシュされたデータを表示しています。</span>
      </div>
    </div>
  );
}
