import { SmartphoneIcon, XIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

/**
 * PWAインストールプロンプトコンポーネント
 */
export function InstallPrompt(): ReactElement | null {
  const { isInstallable, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) {
    return null;
  }

  const handleInstall = async (): Promise<void> => {
    const success = await install();
    if (success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = (): void => {
    setIsDismissed(true);
  };

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-card p-4 shadow-xl ring-1 ring-border lg:left-auto lg:right-4 lg:w-96"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <SmartphoneIcon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">
            アプリをインストール
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            ホーム画面に追加して、オフラインでも避難所情報を確認できます。
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleInstall}>
              インストール
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDismiss}>
              後で
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDismiss}
          className="shrink-0"
          aria-label="閉じる"
        >
          <XIcon className="size-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
