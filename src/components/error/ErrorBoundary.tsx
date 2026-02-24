import { AlertTriangleIcon } from 'lucide-react';
import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * エラーバウンダリコンポーネント
 *
 * 子コンポーネントでエラーが発生した場合にフォールバックUIを表示します。
 * React 19のエラーハンドリングパターンに準拠しています。
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // エラーログをコンソールに出力（本番環境ではSentryなどに送信）
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            {/* エラーアイコン */}
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangleIcon
                  className="h-8 w-8 text-red-600"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* エラーメッセージ */}
            <h2 className="mb-2 text-center text-xl font-bold text-foreground">
              エラーが発生しました
            </h2>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              申し訳ございません。予期しないエラーが発生しました。
              <br />
              ページを再読み込みしてお試しください。
            </p>

            {/* エラー詳細（開発環境のみ） */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4 rounded bg-muted p-3">
                <summary className="cursor-pointer text-sm font-semibold text-foreground/80">
                  エラー詳細（開発環境のみ）
                </summary>
                <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* アクションボタン */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={this.reset}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
              >
                もう一度試す
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
