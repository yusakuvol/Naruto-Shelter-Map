import type { ReactElement } from 'react';
import { Button } from '@/components/ui/button';

interface NetworkErrorProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * ネットワークエラー表示コンポーネント
 *
 * データ取得失敗時などに表示するエラーメッセージ
 */
export function NetworkError({
  message = 'データの読み込みに失敗しました',
  onRetry,
}: NetworkErrorProps): ReactElement {
  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center p-8"
      role="alert"
      aria-live="polite"
    >
      <div className="w-full max-w-sm text-center">
        {/* エラーアイコン */}
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-gray-100 p-3">
            <svg
              className="h-12 w-12 text-gray-400"
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
          </div>
        </div>

        {/* エラーメッセージ */}
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{message}</h3>
        <p className="mb-6 text-sm text-gray-600">
          ネットワーク接続を確認してから、
          <br />
          再度お試しください。
        </p>

        {/* リトライボタン */}
        {onRetry && (
          <Button onClick={onRetry}>
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            再試行
          </Button>
        )}
      </div>
    </div>
  );
}
