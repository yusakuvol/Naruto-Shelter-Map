'use client';

import { clsx } from 'clsx';
import type { ReactElement } from 'react';
import { useDarkMode } from '@/hooks/useDarkMode';

/**
 * ダークモード切り替えボタンコンポーネント
 *
 * - ライト/ダーク/システム設定の3つのモードを切り替え可能
 * - アクセシビリティ対応（ARIA属性、キーボード操作）
 */
export function DarkModeToggle(): ReactElement {
  const { theme, isDark, setTheme } = useDarkMode();

  const handleToggle = (): void => {
    // ライト → ダーク → システム → ライト の順で切り替え
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  // アイコンとラベルの決定
  const getIcon = () => {
    if (theme === 'system') {
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    }
    if (isDark) {
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    }
    return (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    );
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'システム設定';
    }
    return isDark ? 'ダークモード' : 'ライトモード';
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={clsx(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
        'bg-white text-gray-700 shadow-md',
        'hover:bg-gray-50 hover:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
        'dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
      )}
      aria-label={`テーマを切り替え（現在: ${getLabel()}）`}
      title={`テーマ切り替え: ${getLabel()}`}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </button>
  );
}
