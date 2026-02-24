import { WifiOffIcon } from 'lucide-react';
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
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-2 text-sm text-background shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <WifiOffIcon className="h-4 w-4" aria-hidden="true" />
        <span>オフラインです。キャッシュされたデータを表示しています。</span>
      </div>
    </div>
  );
}
