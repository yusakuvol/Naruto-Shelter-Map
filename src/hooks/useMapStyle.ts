'use client';

import { useCallback, useEffect, useState } from 'react';
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

  // 初回マウント時にLocalStorageから読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MAP_STYLE_STORAGE_KEY);
      if (saved && saved in MAP_STYLES) {
        setStyleTypeState(saved as MapStyleType);
      }
    } catch (error) {
      console.error('Failed to load map style from localStorage:', error);
    }
  }, []);

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

  const styleUrl = MAP_STYLES[styleType].url;

  return {
    styleType,
    styleUrl,
    setStyleType,
  };
}
