'use client';

import { useState } from 'react';
import { DisasterTypeFilter } from '@/components/filter/DisasterTypeFilter';
import { ShelterList } from '@/components/shelter/ShelterList';
import { type SortMode, SortToggle } from '@/components/shelter/SortToggle';
import type { ShelterFeature } from '@/types/shelter';
import { type ViewMode, ViewModeTabs } from './ViewModeTabs';

interface ShelterWithDistance {
  shelter: ShelterFeature;
  distance: number | null;
}

interface SheetContentProps {
  shelters: ShelterWithDistance[];
  selectedShelterId?: string | null | undefined;
  onShelterSelect?: (id: string) => void;
  onMapViewRequest: () => void;
  sheetState?: 'minimized' | 'expanded';
  onSheetToggle?: () => void;
  sortMode?: SortMode;
  onSortModeChange?: (mode: SortMode) => void;
  hasPosition?: boolean;
}

export function SheetContent({
  shelters,
  selectedShelterId,
  onShelterSelect,
  onMapViewRequest,
  sheetState,
  onSheetToggle,
  sortMode = 'name',
  onSortModeChange,
  hasPosition = false,
}: SheetContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleModeChange = (mode: ViewMode): void => {
    setViewMode(mode);
    if (mode === 'map') {
      // 地図タブ選択時はシートを最小化
      onMapViewRequest();
    } else {
      // リスト・フィルタタブ選択時はシートを展開
      if (sheetState === 'minimized' && onSheetToggle) {
        onSheetToggle();
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* タブ */}
      <ViewModeTabs mode={viewMode} onModeChange={handleModeChange} />

      {/* リスト表示 */}
      {viewMode === 'list' && (
        <div
          role="tabpanel"
          id="list-panel"
          aria-labelledby="list-tab"
          className="flex-1 overflow-y-auto"
        >
          {/* ソート切り替え */}
          {onSortModeChange && (
            <div className="border-b p-4">
              <SortToggle
                mode={sortMode}
                onModeChange={onSortModeChange}
                disabled={!hasPosition}
              />
            </div>
          )}

          <div className="p-4">
            <ShelterList
              shelters={shelters}
              selectedShelterId={selectedShelterId}
              {...(onShelterSelect && { onShelterSelect })}
            />
          </div>
        </div>
      )}

      {/* フィルタ表示 */}
      {viewMode === 'filter' && (
        <div
          role="tabpanel"
          id="filter-panel"
          aria-labelledby="filter-tab"
          className="flex-1 overflow-y-auto p-4"
        >
          <DisasterTypeFilter />
        </div>
      )}

      {/* 地図表示（実際には閉じるだけ） */}
      {viewMode === 'map' && (
        <div
          role="tabpanel"
          id="map-panel"
          aria-labelledby="map-tab"
          className="flex-1 p-4"
        >
          <p className="text-center text-gray-600">地図を表示しています</p>
        </div>
      )}
    </div>
  );
}
