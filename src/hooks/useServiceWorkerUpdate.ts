"use client";

import { useEffect, useState } from "react";

// Service Worker登録の型（ブラウザAPIの型を使用）
type ServiceWorkerRegistrationType = ServiceWorkerRegistration;

/**
 * Service Workerの更新を検出・管理するカスタムフック
 * @returns {{ isUpdateAvailable: boolean, updateServiceWorker: () => Promise<void> }}
 */
export function useServiceWorkerUpdate() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistrationType | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Service Worker登録を取得
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => {
        if (!reg) {
          return;
        }

        setRegistration(reg);

        // 既に待機中のService Workerがあるかチェック
        if (reg.waiting) {
          setIsUpdateAvailable(true);
        }

        // Service Workerの更新を監視
        const checkForUpdate = (): void => {
          if (reg.installing) {
            const installingWorker = reg.installing;

            installingWorker.addEventListener("statechange", () => {
              if (installingWorker.state === "installed") {
                // アクティブなService Workerがある場合、更新が利用可能
                if (reg.active) {
                  setIsUpdateAvailable(true);
                }
              }
            });
          }
        };

        // 定期的に更新をチェック（5分ごと）
        const intervalId = setInterval(() => {
          reg.update();
          checkForUpdate();
        }, 5 * 60 * 1000);

        // 初回チェック
        checkForUpdate();

        // ページがフォーカスされたときに更新をチェック
        const handleFocus = (): void => {
          reg.update();
          checkForUpdate();
        };

        window.addEventListener("focus", handleFocus);

        return () => {
          clearInterval(intervalId);
          window.removeEventListener("focus", handleFocus);
        };
      })
      .catch((error) => {
        console.error("Service Worker registration error:", error);
      });
  }, []);

  const updateServiceWorker = async (): Promise<void> => {
    if (!registration) {
      return;
    }

    const reg = registration;

    if (reg.waiting) {
      // 待機中のService Workerにメッセージを送信してスキップ待機を促す
      reg.waiting.postMessage({ type: "SKIP_WAITING" });

      // Service Workerがアクティブになるのを待つ
      const handleStateChange = (e: Event): void => {
        const worker = e.target as ServiceWorker;
        if (worker.state === "activated") {
          // ページをリロードして新しいService Workerを有効化
          window.location.reload();
        }
      };

      reg.waiting.addEventListener("statechange", handleStateChange);

      // タイムアウト（5秒後に強制的にリロード）
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } else {
      // 待機中のService Workerがない場合、更新を試みる
      try {
        await reg.update();
        // 更新後、ページをリロード
        window.location.reload();
      } catch (error) {
        console.error("Service Worker update error:", error);
      }
    }
  };

  return {
    isUpdateAvailable,
    updateServiceWorker,
  };
}
