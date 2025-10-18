'use client';

import { cn } from '@/lib/utils';
import { type KeyboardEvent } from 'react';

export type ViewMode = 'list' | 'map';

interface ViewModeTabsProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  shelterCount: number;
}

export function ViewModeTabs({
  mode,
  onModeChange,
  shelterCount,
}: ViewModeTabsProps) {
  // 矢印キーでタブ間移動
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      onModeChange(mode === 'list' ? 'map' : 'list');
    }
  };

  return (
    <div role="tablist" aria-label="表示モード" className="flex items-center border-b bg-white">
      {/* リストタブ */}
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'list'}
        aria-controls="list-panel"
        id="list-tab"
        tabIndex={mode === 'list' ? 0 : -1}
        className={cn(
          'flex-1 py-3 px-4 font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
          mode === 'list'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        )}
        onClick={() => onModeChange('list')}
        onKeyDown={handleKeyDown}
      >
        <svg
          className="inline h-5 w-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
        リスト ({shelterCount}件)
      </button>

      {/* 地図タブ */}
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'map'}
        aria-controls="map-panel"
        id="map-tab"
        tabIndex={mode === 'map' ? 0 : -1}
        className={cn(
          'flex-1 py-3 px-4 font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
          mode === 'map'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        )}
        onClick={() => onModeChange('map')}
        onKeyDown={handleKeyDown}
      >
        <svg
          className="inline h-5 w-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        地図
      </button>
    </div>
  );
}
