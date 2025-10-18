'use client';

import { ShelterMap } from '@/components/map/Map';
import { SearchBar } from '@/components/search/SearchBar';
import { ShelterList } from '@/components/shelter/ShelterList';
import { BottomSheet, type SheetState } from '@/components/mobile/BottomSheet';
import { SheetContent } from '@/components/mobile/SheetContent';
import { useShelters } from '@/hooks/useShelters';
import { useMemo, useState } from 'react';

export default function HomePage() {
  const { data, isLoading, error } = useShelters();
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetState, setSheetState] = useState<SheetState>('half');

  // 検索フィルタリング
  const filteredShelters = useMemo(() => {
    if (!data?.features) return [];
    if (!searchQuery.trim()) return data.features;

    const query = searchQuery.toLowerCase();
    return data.features.filter((shelter) => {
      const { name, address, type, disasterTypes } = shelter.properties;
      return (
        name.toLowerCase().includes(query) ||
        address.toLowerCase().includes(query) ||
        type.toLowerCase().includes(query) ||
        disasterTypes.some((dt) => dt.toLowerCase().includes(query))
      );
    });
  }, [data, searchQuery]);

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
        {/* ヘッダー + 検索（sticky） */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b">
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-900">
              鳴門市避難所マップ
            </h1>
          </div>
          <div className="px-4 pb-4">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="避難所名・住所・災害種別で検索..."
            />
          </div>
        </header>

        {/* 地図エリア（フルスクリーン） */}
        <div className="flex-1">
          <ShelterMap shelters={filteredShelters} />
        </div>

        {/* Bottom Sheet */}
        <BottomSheet state={sheetState} onStateChange={setSheetState}>
          <SheetContent
            shelters={filteredShelters}
            onMapViewRequest={() => setSheetState('closed')}
          />
        </BottomSheet>
      </div>

      {/* デスクトップレイアウト（>= 1024px） */}
      <div className="hidden lg:flex lg:h-screen lg:flex-row lg:overflow-hidden">
        {/* サイドバー（左側） */}
        <div className="flex h-full w-96 flex-col border-r bg-white">
          {/* ヘッダー */}
          <div className="border-b p-4">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              鳴門市避難所マップ
            </h1>
            <p className="text-sm text-gray-600">
              {filteredShelters.length}件の避難所
            </p>
          </div>

          {/* 検索バー */}
          <div className="border-b p-4">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="避難所名・住所・災害種別で検索..."
            />
          </div>

          {/* 避難所リスト */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <ShelterList shelters={filteredShelters} />
          </div>
        </div>

        {/* 地図エリア（右側） */}
        <div className="h-full flex-1">
          <ShelterMap shelters={filteredShelters} />
        </div>
      </div>
    </>
  );
}
