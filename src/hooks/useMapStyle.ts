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
  const [isInitialized, setIsInitialized] = useState(false);

  // 初回マウント時にLocalStorageから読み込み
  // ただし、自動切り替えを優先するため、userSelectedStyleは設定しない
  useEffect(() => {
    if (isInitialized) {
      return;
    }

    try {
      const saved = localStorage.getItem(MAP_STYLE_STORAGE_KEY);
      if (saved && saved in MAP_STYLES) {
        const savedStyle = saved as MapStyleType;
        // 保存されたスタイルが'satellite'または'terrain'の場合は、ユーザーが明示的に選択したものとして扱う
        if (savedStyle === 'satellite' || savedStyle === 'terrain') {
          setStyleTypeState(savedStyle);
          setUserSelectedStyle(savedStyle);
        }
        // 'dark'または'standard'の場合は、ダークモードに応じて自動切り替え（下記のuseEffectで処理）
      }
    } catch (error) {
      console.error('Failed to load map style from localStorage:', error);
    }

    setIsInitialized(true);
  }, [isInitialized]);

  // ダークモードに応じてスタイルを自動切り替え
  // ユーザーが手動で選択したスタイル（satellite, terrain）がある場合は、それを優先
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

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
  }, [isDark, userSelectedStyle, isInitialized]);

  // スタイル変更処理
  const setStyleType = useCallback((newStyleType: MapStyleType): void => {
    setStyleTypeState(newStyleType);

    // 'dark'または'standard'の場合は、自動切り替えの対象とするためuserSelectedStyleをnullに
    // それ以外（'satellite', 'terrain'）の場合は、ユーザーが明示的に選択したものとして扱う
    if (newStyleType === 'satellite' || newStyleType === 'terrain') {
      setUserSelectedStyle(newStyleType);
    } else {
      // 'dark'または'standard'の場合は、自動切り替えを有効にするためnullに設定
      setUserSelectedStyle(null);
    }

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
