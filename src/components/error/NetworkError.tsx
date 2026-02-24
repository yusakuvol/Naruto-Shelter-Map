import { RefreshCwIcon, WifiOffIcon } from 'lucide-react';
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
            <WifiOffIcon
              className="h-12 w-12 text-gray-400"
              aria-hidden="true"
            />
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
            <RefreshCwIcon className="size-4" aria-hidden="true" />
            再試行
          </Button>
        )}
      </div>
    </div>
  );
}
