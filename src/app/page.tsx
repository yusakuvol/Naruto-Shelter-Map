'use client';

import { useMemo, useState } from 'react';
import { DisasterTypeFilter } from '@/components/filter/DisasterTypeFilter';
import { ShelterMap } from '@/components/map/Map';
import { MapSearchBar } from '@/components/map/MapSearchBar';
import { BottomSheet, type SheetState } from '@/components/mobile/BottomSheet';
import { SheetContent } from '@/components/mobile/SheetContent';
import { ShelterList } from '@/components/shelter/ShelterList';
import { type SortMode, SortToggle } from '@/components/shelter/SortToggle';
import { FilterProvider } from '@/contexts/FilterContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useFilteredShelters } from '@/hooks/useFilteredShelters';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useShelters } from '@/hooks/useShelters';
import { calculateDistance, toCoordinates } from '@/lib/geo';

function HomePageContent() {
  const { data, isLoading, error } = useShelters();
  const {
    position,
    state: geolocationState,
    error: geolocationError,
    getCurrentPosition,
  } = useGeolocation();
  const { favorites, toggleFavorite } = useFavorites();
  const [sheetState, setSheetState] = useState<SheetState>('minimized');
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('name');

  const allShelters = data?.features ?? [];
  const filteredShelters = useFilteredShelters(allShelters);

  // 検索クエリでさらにフィルタリング
  const searchedShelters = useMemo(() => {
    if (!searchQuery.trim()) return filteredShelters;

    const query = searchQuery.toLowerCase();
    return filteredShelters.filter((shelter) => {
      const { name, address } = shelter.properties;
      return (
        name.toLowerCase().includes(query) ||
        address.toLowerCase().includes(query)
      );
    });
  }, [filteredShelters, searchQuery]);

  // 距離計算とソート
  const sortedShelters = useMemo(() => {
    // 距離を含む拡張データを作成
    const sheltersWithDistance = searchedShelters.map((shelter) => ({
      shelter,
      distance:
        position && shelter.geometry.coordinates
          ? calculateDistance(
              position,
              toCoordinates(shelter.geometry.coordinates)
            )
          : null,
    }));

    // ソート
    if (sortMode === 'distance' && position) {
      return sheltersWithDistance
        .filter((item) => item.distance !== null)
        .sort((a, b) => {
          if (a.distance === null || b.distance === null) return 0;
          return a.distance - b.distance;
        });
    }

    // 名前順（デフォルト）
    return sheltersWithDistance.sort((a, b) =>
      a.shelter.properties.name.localeCompare(
        b.shelter.properties.name,
        'ja-JP'
      )
    );
  }, [searchedShelters, sortMode, position]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600">
            エラーが発生しました
          </h2>
          <p className="mt-4 text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* モバイルレイアウト（< 1024px） */}
      <div className="flex h-screen flex-col lg:hidden">
        {/* 地図エリア（フルスクリーン） */}
        <main id="main-content" className="relative flex-1 min-h-0">
          <ShelterMap
            shelters={searchedShelters}
            selectedShelterId={selectedShelterId}
            onShelterSelect={setSelectedShelterId}
            position={position}
            geolocationState={geolocationState}
            geolocationError={geolocationError}
            onGetCurrentPosition={getCurrentPosition}
          />

          {/* Googleマップ風検索バー */}
          <nav aria-label="避難所検索">
            <MapSearchBar
              onSearch={setSearchQuery}
              placeholder="避難所を検索..."
            />
          </nav>
        </main>

        {/* Bottom Sheet */}
        <BottomSheet state={sheetState} onStateChange={setSheetState}>
          <SheetContent
            shelters={sortedShelters}
            selectedShelterId={selectedShelterId}
            onShelterSelect={(id) => {
              setSelectedShelterId(id);
              setSheetState('minimized'); // カードクリック時に地図を見せる
            }}
            onMapViewRequest={() => setSheetState('minimized')}
            sheetState={sheetState}
            onSheetToggle={() =>
              setSheetState(
                sheetState === 'expanded' ? 'minimized' : 'expanded'
              )
            }
            sortMode={sortMode}
            onSortModeChange={setSortMode}
            hasPosition={!!position}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            userPosition={position}
          />
        </BottomSheet>
      </div>

      {/* デスクトップレイアウト（>= 1024px） */}
      <div className="hidden lg:flex lg:h-screen lg:flex-row lg:overflow-hidden">
        {/* サイドバー（左側） */}
        <aside
          className="flex h-full w-96 flex-col border-r bg-white"
          aria-label="避難所フィルタとリスト"
        >
          {/* ヘッダー */}
          <header className="border-b p-4">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              鳴門市避難所マップ
            </h1>
            <p className="text-sm text-gray-700">
              {filteredShelters.length}件の避難所
              {filteredShelters.length !== allShelters.length && (
                <span className="ml-1 text-gray-700">
                  （全{allShelters.length}件中）
                </span>
              )}
            </p>
          </header>

          {/* フィルタ */}
          <nav aria-label="災害種別フィルタ" className="border-b p-4">
            <DisasterTypeFilter />
          </nav>

          {/* ソート切り替え */}
          <div className="border-b p-4">
            <SortToggle
              mode={sortMode}
              onModeChange={setSortMode}
              disabled={!position}
            />
          </div>

          {/* 避難所リスト */}
          <nav
            aria-label="避難所一覧"
            className="min-h-0 flex-1 overflow-y-auto p-4"
          >
            <ShelterList
              shelters={sortedShelters}
              selectedShelterId={selectedShelterId}
              onShelterSelect={setSelectedShelterId}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              userPosition={position}
            />
          </nav>
        </aside>

        {/* 地図エリア（右側） */}
        <main id="main-content" className="relative h-full flex-1">
          <ShelterMap
            shelters={searchedShelters}
            selectedShelterId={selectedShelterId}
            onShelterSelect={setSelectedShelterId}
            position={position}
            geolocationState={geolocationState}
            geolocationError={geolocationError}
            onGetCurrentPosition={getCurrentPosition}
          />

          {/* Googleマップ風検索バー */}
          <nav aria-label="避難所検索">
            <MapSearchBar
              onSearch={setSearchQuery}
              placeholder="避難所を検索..."
            />
          </nav>
        </main>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <FilterProvider>
      <HomePageContent />
    </FilterProvider>
  );
}
