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

const DISASTER_ICONS: Record<DisasterType, string> = {
  洪水: '🌊',
  津波: '🌊',
  土砂災害: '⛰️',
  地震: '🏚️',
  火災: '🔥',
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
        {DISASTER_TYPES.map((disaster) => (
          <label
            key={disaster}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selectedDisasters.includes(disaster)}
              onChange={() => toggleDisaster(disaster)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              aria-label={`${disaster}で絞り込む`}
            />
            <span className="text-lg" aria-hidden="true">
              {DISASTER_ICONS[disaster]}
            </span>
            <span className="text-sm text-gray-700">{disaster}</span>
          </label>
        ))}
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
