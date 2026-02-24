import type { ReactElement } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';

/**
 * Service Worker更新通知コンポーネント
 */
export function UpdateNotification(): ReactElement | null {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorkerUpdate();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isUpdateAvailable || isDismissed) {
    return null;
  }

  const handleUpdate = async (): Promise<void> => {
    setIsUpdating(true);
    try {
      await updateServiceWorker();
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = (): void => {
    setIsDismissed(true);
  };

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-white p-4 shadow-xl ring-1 ring-black ring-opacity-5 lg:left-auto lg:right-4 lg:w-96"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-blue-600"
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
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
            アプリの更新が利用可能です
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            最新バージョンを利用するには、ページを更新してください。
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? '更新中...' : '更新する'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDismiss}
              disabled={isUpdating}
            >
              後で
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDismiss}
          disabled={isUpdating}
          className="shrink-0"
          aria-label="閉じる"
        >
          <svg
            className="size-5"
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
        </Button>
      </div>
    </div>
  );
}
