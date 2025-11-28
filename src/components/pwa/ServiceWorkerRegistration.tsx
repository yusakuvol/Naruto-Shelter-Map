'use client';

import { useEffect } from 'react';

/**
 * Service Worker登録コンポーネント
 * 静的エクスポート環境でもService Workerを確実に登録する
 */
export function ServiceWorkerRegistration(): null {
  useEffect(() => {
    // サーバー側では実行しない
    if (typeof window === 'undefined') {
      return;
    }

    // Service Workerがサポートされていない場合は終了
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker is not supported');
      return;
    }

    // 開発環境ではService Workerを無効化（next.config.jsの設定に合わせる）
    if (process.env.NODE_ENV === 'development') {
      console.log('Service Worker is disabled in development mode');
      return;
    }

    // Service Workerの登録
    const registerServiceWorker = async (): Promise<void> => {
      try {
        // 既に登録されているか確認
        const existingRegistration =
          await navigator.serviceWorker.getRegistration();

        if (existingRegistration) {
          console.log('Service Worker already registered');
          return;
        }

        // Service Workerを登録
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log(
          'Service Worker registered successfully',
          registration.scope
        );

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
                console.log('New Service Worker available');
              } else {
                // 初回インストール完了
                console.log('Service Worker installed');
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
