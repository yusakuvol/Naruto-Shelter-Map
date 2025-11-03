import { useCallback, useEffect, useState } from 'react';

/**
 * Device Orientation APIの状態
 */
export type DeviceOrientationState =
  | 'idle' // 初期状態
  | 'requesting' // 許可リクエスト中
  | 'granted' // 許可済み
  | 'denied' // 拒否
  | 'not_supported'; // ブラウザが対応していない

/**
 * useDeviceOrientationの戻り値
 */
export interface UseDeviceOrientationReturn {
  /** デバイスの方位角（0-360度、北が0度） */
  heading: number | null;
  /** 取得状態 */
  state: DeviceOrientationState;
  /** 許可をリクエストする関数 */
  requestPermission: () => Promise<void>;
}

/**
 * Device Orientation APIを使用してデバイスの方位を取得するカスタムフック
 *
 * iOS 13+では明示的な許可が必要です。
 *
 * @returns DeviceOrientationState
 *
 * @example
 * ```tsx
 * function CompassComponent() {
 *   const { heading, state, requestPermission } = useDeviceOrientation();
 *
 *   if (state === 'not_supported') {
 *     return <div>お使いのブラウザは対応していません</div>;
 *   }
 *
 *   if (state === 'idle' || state === 'denied') {
 *     return (
 *       <button onClick={requestPermission}>
 *         コンパスを有効にする
 *       </button>
 *     );
 *   }
 *
 *   return (
 *     <div>
 *       現在の方位: {heading !== null ? `${Math.round(heading)}°` : '取得中...'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDeviceOrientation(): UseDeviceOrientationReturn {
  const [heading, setHeading] = useState<number | null>(null);
  const [state, setState] = useState<DeviceOrientationState>('idle');

  // ブラウザ対応チェック
  const isSupported =
    typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;

  /**
   * Device Orientationイベントハンドラ
   */
  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent): void => {
      let compassHeading: number | null = null;

      // iOS Safari: webkitCompassHeadingを使用
      // @ts-expect-error - webkitCompassHeadingはiOS Safari固有
      if (event.webkitCompassHeading !== undefined) {
        // @ts-expect-error - webkitCompassHeadingはiOS Safari固有
        compassHeading = event.webkitCompassHeading;
      }
      // Android Chrome: alphaを使用
      else if (event.alpha !== null) {
        // alphaは北が0度で時計回りに増加するが、
        // デバイスの向きに応じて補正が必要
        compassHeading = 360 - event.alpha;
      }

      if (compassHeading !== null) {
        setHeading(compassHeading);
      }
    },
    []
  );

  /**
   * 許可をリクエストする
   */
  const requestPermission = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      setState('not_supported');
      return;
    }

    setState('requesting');

    try {
      // iOS 13+: 明示的な許可が必要
      // biome-ignore lint/suspicious/noExplicitAny: iOS Safari固有のrequestPermission APIのため
      const DeviceOrientationEventAny = DeviceOrientationEvent as any;

      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEventAny.requestPermission === 'function'
      ) {
        const permissionState =
          await DeviceOrientationEventAny.requestPermission();

        if (permissionState === 'granted') {
          setState('granted');
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setState('denied');
        }
      }
      // その他のブラウザ: 自動的に許可
      else {
        setState('granted');
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    } catch (error) {
      console.error('Failed to request device orientation permission:', error);
      setState('denied');
    }
  }, [isSupported, handleOrientation]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation]);

  // 初期状態設定
  useEffect(() => {
    if (!isSupported) {
      setState('not_supported');
    }
  }, [isSupported]);

  return {
    heading,
    state,
    requestPermission,
  };
}
