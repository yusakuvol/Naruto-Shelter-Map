import type { ReactElement } from 'react';
import { useState } from 'react';
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
      className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-white p-4 shadow-xl ring-1 ring-black ring-opacity-5 lg:left-auto lg:right-4 lg:w-96"
      role="alert"
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
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            アプリをインストール
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            ホーム画面に追加して、オフラインでも避難所情報を確認できます。
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              インストール
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              後で
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-500"
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
      </div>
    </div>
  );
}
