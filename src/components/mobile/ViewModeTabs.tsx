'use client';

import type { KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export type ViewMode = 'list' | 'map' | 'filter';

interface ViewModeTabsProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeTabs({
  mode,
  onModeChange,
}: ViewModeTabsProps) {
  // 矢印キーでタブ間移動
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const modes: ViewMode[] = ['list', 'filter', 'map'];
      const currentIndex = modes.indexOf(mode);
      const newIndex =
        e.key === 'ArrowRight'
          ? (currentIndex + 1) % modes.length
          : (currentIndex - 1 + modes.length) % modes.length;
      onModeChange(modes[newIndex] as ViewMode);
    }
  };

  return (
    <div className="flex items-center border-b bg-white">
      <div
        role="tablist"
        aria-label="表示モード"
        className="flex flex-1 items-center"
      >
        {/* リストタブ */}
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'list'}
          aria-controls="list-panel"
          aria-label="リスト表示"
          id="list-tab"
          tabIndex={mode === 'list' ? 0 : -1}
          className={cn(
            'flex-1 py-3 px-2 font-medium transition-all duration-200 flex flex-col items-center gap-1',
            'focus:outline-none relative',
            mode === 'list'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          )}
          onClick={() => onModeChange('list')}
          onKeyDown={handleKeyDown}
        >
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
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          <span className="text-xs">リスト</span>
          {/* 選択インジケーター - Google Maps風 */}
          {mode === 'list' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>

        {/* フィルタタブ */}
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'filter'}
          aria-controls="filter-panel"
          aria-label="フィルタ"
          id="filter-tab"
          tabIndex={mode === 'filter' ? 0 : -1}
          className={cn(
            'flex-1 py-3 px-2 font-medium transition-all duration-200 flex flex-col items-center gap-1',
            'focus:outline-none relative',
            mode === 'filter'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          )}
          onClick={() => onModeChange('filter')}
          onKeyDown={handleKeyDown}
        >
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="text-xs">フィルタ</span>
          {/* 選択インジケーター - Google Maps風 */}
          {mode === 'filter' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>

        {/* 地図タブ */}
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'map'}
          aria-controls="map-panel"
          aria-label="地図表示"
          id="map-tab"
          tabIndex={mode === 'map' ? 0 : -1}
          className={cn(
            'flex-1 py-3 px-2 font-medium transition-all duration-200 flex flex-col items-center gap-1',
            'focus:outline-none relative',
            mode === 'map'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          )}
          onClick={() => onModeChange('map')}
          onKeyDown={handleKeyDown}
        >
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
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <span className="text-xs">地図</span>
          {/* 選択インジケーター - Google Maps風 */}
          {mode === 'map' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>
    </div>
  );
}
