import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MAP_STYLE_STORAGE_KEY,
  MAP_STYLES,
  type MapStyleType,
} from '@/types/map';

/**
 * 地図スタイル管理フック
 *
 * - 地図スタイルの状態管理
 * - LocalStorageへの永続化
 * - スタイル変更処理
 */
export function useMapStyle(): {
  styleType: MapStyleType;
  styleUrl: string;
  setStyleType: (styleType: MapStyleType) => void;
} {
  const [styleType, setStyleTypeState] = useState<MapStyleType>('standard');
  const [isInitialized, setIsInitialized] = useState(false);

  // 初回マウント時にLocalStorageから読み込み
  useEffect(() => {
    if (isInitialized) {
      return;
    }

    try {
      const saved = localStorage.getItem(MAP_STYLE_STORAGE_KEY);
      if (saved && saved in MAP_STYLES) {
        const savedStyle = saved as MapStyleType;
        // 保存されたスタイルを復元
        setStyleTypeState(savedStyle);
      }
    } catch (error) {
      console.error('Failed to load map style from localStorage:', error);
    }

    setIsInitialized(true);
  }, [isInitialized]);

  // スタイル変更処理
  const setStyleType = useCallback((newStyleType: MapStyleType): void => {
    setStyleTypeState(newStyleType);

    // LocalStorageに保存
    try {
      localStorage.setItem(MAP_STYLE_STORAGE_KEY, newStyleType);
    } catch (error) {
      console.error('Failed to save map style to localStorage:', error);
    }
  }, []);

  const styleUrl = useMemo(() => MAP_STYLES[styleType].url, [styleType]);

  return {
    styleType,
    styleUrl,
    setStyleType,
  };
}
