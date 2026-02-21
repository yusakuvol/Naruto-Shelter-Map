import { useEffect } from 'react';

/**
 * Service Worker登録コンポーネント
 * 本番ビルドで vite-plugin-pwa が生成した sw.js を登録する
 */
export function ServiceWorkerRegistration(): null {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!('serviceWorker' in navigator)) {
      return;
    }

    // 開発環境では Service Worker を無効化（Vite: import.meta.env.DEV）
    if (import.meta.env.DEV) {
      return;
    }

    // Service Workerの登録
    const registerServiceWorker = async (): Promise<void> => {
      try {
        // 既に登録されているか確認
        const existingRegistration =
          await navigator.serviceWorker.getRegistration();

        if (existingRegistration) {
          return;
        }

        // Service Workerを登録
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // 登録成功時のイベントハンドラ
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (!newWorker) {
            return;
          }

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // 新しいService Workerが利用可能
              }
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    // ページ読み込み完了後に登録
    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker);
    }

    // クリーンアップ関数
    return () => {
      window.removeEventListener('load', registerServiceWorker);
    };
  }, []);

  // このコンポーネントは何もレンダリングしない
  return null;
}
