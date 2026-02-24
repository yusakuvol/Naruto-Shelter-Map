import { RefreshCwIcon, XIcon } from 'lucide-react';
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
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-4 z-50 rounded-lg bg-card p-4 shadow-xl ring-1 ring-border lg:left-auto lg:right-4 lg:w-96"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <RefreshCwIcon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            アプリの更新が利用可能です
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
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
          <XIcon className="size-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
