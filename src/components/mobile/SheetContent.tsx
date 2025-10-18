'use client';

import { useState } from 'react';
import type { ShelterFeature } from '@/types/shelter';
import { ShelterList } from '@/components/shelter/ShelterList';
import { ViewModeTabs, type ViewMode } from './ViewModeTabs';

interface SheetContentProps {
  shelters: ShelterFeature[];
  onMapViewRequest: () => void;
}

export function SheetContent({
  shelters,
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
        <div className="flex-1 overflow-y-auto p-4">
          <ShelterList shelters={shelters} />
        </div>
      )}
    </div>
  );
}
