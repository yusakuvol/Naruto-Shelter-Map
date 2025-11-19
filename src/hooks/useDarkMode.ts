'use client';

import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'naruto-shelter-map-theme';

/**
 * ダークモード管理フック
 *
 * - システム設定（prefers-color-scheme）への対応
 * - 手動切り替え機能
 * - LocalStorageへの永続化
 */
export function useDarkMode() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  // 初回マウント時にLocalStorageから読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (
        saved &&
        (saved === 'light' || saved === 'dark' || saved === 'system')
      ) {
        setThemeState(saved as Theme);
      }
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
    }
  }, []);

  /**
   * ドキュメントのクラスを更新
   */
  const updateDocumentClass = useCallback((dark: boolean): void => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // システム設定の変更を監視
  useEffect(() => {
    if (theme !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent): void => {
      setIsDark(e.matches);
      updateDocumentClass(e.matches);
    };

    // 初回設定
    setIsDark(mediaQuery.matches);
    updateDocumentClass(mediaQuery.matches);

    // 変更を監視
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, updateDocumentClass]);

  // テーマ変更時にドキュメントクラスを更新
  useEffect(() => {
    if (theme === 'light') {
      setIsDark(false);
      updateDocumentClass(false);
    } else if (theme === 'dark') {
      setIsDark(true);
      updateDocumentClass(true);
    }
    // theme === 'system' の場合は上記のuseEffectで処理
  }, [theme, updateDocumentClass]);

  /**
   * テーマを変更
   */
  const setTheme = (newTheme: Theme): void => {
    setThemeState(newTheme);

    // LocalStorageに保存
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  };

  return {
    theme,
    isDark,
    setTheme,
  };
}
