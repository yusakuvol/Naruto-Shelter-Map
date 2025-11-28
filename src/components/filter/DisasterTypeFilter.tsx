'use client';

import type { ReactElement } from 'react';
import { useFilter } from '@/contexts/FilterContext';
import type { DisasterType } from '@/types/shelter';

const DISASTER_TYPES: readonly DisasterType[] = [
  '洪水',
  '津波',
  '土砂災害',
  '地震',
  '火災',
] as const;

// 災害種別アイコンコンポーネント
function FloodIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12h18M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 18h18"
      />
    </svg>
  );
}

function TsunamiIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12h18M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 9h18M3 18h18"
      />
    </svg>
  );
}

function LandslideIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

function EarthquakeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v12M6 12h12"
      />
    </svg>
  );
}

function FireIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 1.832 1.832 3 4.5 3 6.5a7.98 7.98 0 01-1.343 4.657z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.879 16.121A3 3 0 1012.015 11.11"
      />
    </svg>
  );
}

const DISASTER_ICONS: Record<
  DisasterType,
  ({ className }: { className?: string }) => ReactElement
> = {
  洪水: FloodIcon,
  津波: TsunamiIcon,
  土砂災害: LandslideIcon,
  地震: EarthquakeIcon,
  火災: FireIcon,
};

export function DisasterTypeFilter(): ReactElement {
  const { selectedDisasters, toggleDisaster, clearFilters } = useFilter();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">災害種別</h3>
        {selectedDisasters.length > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="フィルタをクリア"
          >
            クリア
          </button>
        )}
      </div>

      <div className="space-y-2">
        {DISASTER_TYPES.map((disaster) => {
          const IconComponent = DISASTER_ICONS[disaster];
          const isSelected = selectedDisasters.includes(disaster);
          return (
            <label
              key={disaster}
              className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors ${
                isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleDisaster(disaster)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                aria-label={`${disaster}で絞り込む`}
              />
              <IconComponent
                className={`h-5 w-5 shrink-0 transition-colors ${
                  isSelected ? 'text-blue-600' : 'text-gray-600'
                }`}
              />
              <span
                className={`text-sm transition-colors ${
                  isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'
                }`}
              >
                {disaster}
              </span>
            </label>
          );
        })}
      </div>

      {selectedDisasters.length > 0 && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-600">
            {selectedDisasters.length}件の災害種別でフィルタ中
          </p>
        </div>
      )}
    </div>
  );
}
