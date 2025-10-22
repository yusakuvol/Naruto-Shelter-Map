import { useCallback, useEffect, useState } from 'react';
import type { Coordinates } from '@/lib/geo';

/**
 * Geolocation APIの状態
 */
export type GeolocationState =
  | 'idle' // 初期状態
  | 'loading' // 位置情報取得中
  | 'success' // 取得成功
  | 'error'; // 取得失敗

/**
 * Geolocation APIのエラー理由
 */
export type GeolocationError =
  | 'permission_denied' // ユーザーが位置情報の使用を拒否
  | 'position_unavailable' // 位置情報が利用できない
  | 'timeout' // タイムアウト
  | 'not_supported' // ブラウザが対応していない
  | 'unknown'; // 不明なエラー

/**
 * useGeolocationの戻り値
 */
export interface UseGeolocationReturn {
  /** 現在地の座標 */
  position: Coordinates | null;
  /** 取得状態 */
  state: GeolocationState;
  /** エラー理由 */
  error: GeolocationError | null;
  /** 現在地を取得する関数 */
  getCurrentPosition: () => void;
  /** 位置情報の監視を開始する関数 */
  watchPosition: () => void;
  /** 位置情報の監視を停止する関数 */
  clearWatch: () => void;
}

/**
 * Geolocation APIを使用して現在地を取得するカスタムフック
 *
 * @returns GeolocationState
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { position, state, error, getCurrentPosition } = useGeolocation();
 *
 *   if (state === 'error') {
 *     return <div>エラー: {error}</div>;
 *   }
 *
 *   if (state === 'loading') {
 *     return <div>位置情報取得中...</div>;
 *   }
 *
 *   return (
 *     <div>
 *       {position && (
 *         <p>
 *           緯度: {position.latitude}, 経度: {position.longitude}
 *         </p>
 *       )}
 *       <button onClick={getCurrentPosition}>現在地を取得</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [state, setState] = useState<GeolocationState>('idle');
  const [error, setError] = useState<GeolocationError | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Geolocation APIが利用可能かチェック
  const isSupported =
    typeof window !== 'undefined' && 'geolocation' in navigator;

  /**
   * 位置情報取得成功時のコールバック
   */
  const handleSuccess = useCallback((pos: GeolocationPosition): void => {
    setPosition({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    });
    setState('success');
    setError(null);
  }, []);

  /**
   * 位置情報取得失敗時のコールバック
   */
  const handleError = useCallback((err: GeolocationPositionError): void => {
    setState('error');

    switch (err.code) {
      case err.PERMISSION_DENIED:
        setError('permission_denied');
        break;
      case err.POSITION_UNAVAILABLE:
        setError('position_unavailable');
        break;
      case err.TIMEOUT:
        setError('timeout');
        break;
      default:
        setError('unknown');
    }
  }, []);

  /**
   * 現在地を1回取得する
   */
  const getCurrentPosition = useCallback((): void => {
    if (!isSupported) {
      setState('error');
      setError('not_supported');
      return;
    }

    setState('loading');
    setError(null);

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, [isSupported, handleSuccess, handleError]);

  /**
   * 位置情報の監視を開始する
   */
  const watchPosition = useCallback((): void => {
    if (!isSupported) {
      setState('error');
      setError('not_supported');
      return;
    }

    // 既に監視中の場合は何もしない
    if (watchId !== null) {
      return;
    }

    setState('loading');
    setError(null);

    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    setWatchId(id);
  }, [isSupported, watchId, handleSuccess, handleError]);

  /**
   * 位置情報の監視を停止する
   */
  const clearWatch = useCallback((): void => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // コンポーネントアンマウント時に監視を停止
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    position,
    state,
    error,
    getCurrentPosition,
    watchPosition,
    clearWatch,
  };
}
