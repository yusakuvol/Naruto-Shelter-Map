'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDarkMode } from '@/hooks/useDarkMode';
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
 * - ダークモード時の自動スタイル切り替え
 */
export function useMapStyle(): {
  styleType: MapStyleType;
  styleUrl: string;
  setStyleType: (styleType: MapStyleType) => void;
} {
  const { isDark } = useDarkMode();
  const [styleType, setStyleTypeState] = useState<MapStyleType>('standard');
  const [userSelectedStyle, setUserSelectedStyle] =
    useState<MapStyleType | null>(null);

  // 初回マウント時にLocalStorageから読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MAP_STYLE_STORAGE_KEY);
      if (saved && saved in MAP_STYLES) {
        const savedStyle = saved as MapStyleType;
        setStyleTypeState(savedStyle);
        setUserSelectedStyle(savedStyle);
      }
    } catch (error) {
      console.error('Failed to load map style from localStorage:', error);
    }
  }, []);

  // ダークモードに応じてスタイルを自動切り替え
  // ユーザーが手動で選択したスタイルがある場合は、それを優先
  useEffect(() => {
    if (userSelectedStyle !== null) {
      // ユーザーが手動で選択したスタイルを使用
      setStyleTypeState(userSelectedStyle);
      return;
    }

    // ユーザーが手動で選択していない場合、ダークモードに応じて自動切り替え
    if (isDark) {
      setStyleTypeState('dark');
    } else {
      setStyleTypeState('standard');
    }
  }, [isDark, userSelectedStyle]);

  // スタイル変更処理
  const setStyleType = useCallback((newStyleType: MapStyleType): void => {
    setStyleTypeState(newStyleType);
    setUserSelectedStyle(newStyleType);

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
