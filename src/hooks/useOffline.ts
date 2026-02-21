import { useEffect, useState } from 'react';

/**
 * オフライン状態を検出するフック
 */
export function useOffline(): boolean {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 初期状態を設定
    setIsOffline(!navigator.onLine);

    // オンライン/オフラインイベントリスナー
    const handleOnline = (): void => {
      setIsOffline(false);
    };

    const handleOffline = (): void => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}
