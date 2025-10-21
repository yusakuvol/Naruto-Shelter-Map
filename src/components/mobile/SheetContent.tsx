'use client';

import { useState } from 'react';
import { ShelterList } from '@/components/shelter/ShelterList';
import type { ShelterFeature } from '@/types/shelter';
import { type ViewMode, ViewModeTabs } from './ViewModeTabs';

interface SheetContentProps {
  shelters: ShelterFeature[];
  selectedShelterId?: string | null | undefined;
  onShelterSelect?: (id: string) => void;
  onMapViewRequest: () => void;
}

export function SheetContent({
  shelters,
  selectedShelterId,
  onShelterSelect,
  onMapViewRequest,
}: SheetContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleModeChange = (mode: ViewMode): void => {
    setViewMode(mode);
    if (mode === 'map') {
      // 地図タブ選択時はシートを閉じる
      onMapViewRequest();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* タブ */}
      <ViewModeTabs
        mode={viewMode}
        onModeChange={handleModeChange}
        shelterCount={shelters.length}
      />

      {/* リスト表示 */}
      {viewMode === 'list' && (
        <div
          role="tabpanel"
          id="list-panel"
          aria-labelledby="list-tab"
          className="flex-1 overflow-y-auto p-4"
        >
          <ShelterList
            shelters={shelters}
            selectedShelterId={selectedShelterId}
            {...(onShelterSelect && { onShelterSelect })}
          />
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
