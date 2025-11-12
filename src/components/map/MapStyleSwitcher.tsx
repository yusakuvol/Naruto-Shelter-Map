'use client';

import { clsx } from 'clsx';
import { type ReactElement, useState } from 'react';
import { MAP_STYLES, type MapStyleType } from '@/types/map';

interface MapStyleSwitcherProps {
  currentStyle: MapStyleType;
  onStyleChange: (style: MapStyleType) => void;
}

export function MapStyleSwitcher({
  currentStyle,
  onStyleChange,
}: MapStyleSwitcherProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  const handleStyleSelect = (styleId: MapStyleType): void => {
    onStyleChange(styleId);
    setIsOpen(false);
  };

  const currentStyleInfo = MAP_STYLES[currentStyle];

  return (
    <div className="relative">
      {/* トグルボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md transition-all',
          'hover:bg-gray-50 hover:shadow-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
          isOpen && 'ring-2 ring-blue-400'
        )}
        aria-label="地図スタイルを変更"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-base" aria-hidden="true">
          {currentStyleInfo.icon}
        </span>
        <span className="hidden sm:inline">{currentStyleInfo.name}</span>
        <svg
          className={clsx(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <>
          {/* 背景オーバーレイ（モバイル用） */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* ドロップダウンメニュー */}
          <div
            className={clsx(
              'absolute right-0 top-full z-50 mt-1',
              'w-48 lg:w-52',
              'rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5',
              'animate-in fade-in-0 slide-in-from-top-2 duration-200',
              'overflow-hidden'
            )}
            role="listbox"
            aria-labelledby="map-style-menu"
          >
            {(Object.keys(MAP_STYLES) as MapStyleType[]).map((styleId) => {
              const style = MAP_STYLES[styleId];
              const isSelected = styleId === currentStyle;

              return (
                <button
                  key={styleId}
                  type="button"
                  onClick={() => handleStyleSelect(styleId)}
                  className={clsx(
                    'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors',
                    'first:rounded-t-lg last:rounded-b-lg',
                    isSelected
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50',
                    'focus:outline-none focus:bg-gray-50',
                    'touch-manipulation' // モバイルのタッチ操作を最適化
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  {/* アイコン */}
                  <span className="text-lg flex-shrink-0" aria-hidden="true">
                    {style.icon}
                  </span>

                  {/* テキスト */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{style.name}</span>
                      {isSelected && (
                        <svg
                          className="h-4 w-4 text-blue-600 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 leading-tight">
                      {style.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
