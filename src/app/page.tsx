'use client';

import { ShelterMap } from '@/components/map/Map';
import { BottomSheet, type SheetState } from '@/components/mobile/BottomSheet';
import { SheetContent } from '@/components/mobile/SheetContent';
import { ShelterList } from '@/components/shelter/ShelterList';
import { useShelters } from '@/hooks/useShelters';
import { useState } from 'react';

export default function HomePage() {
  const { data, isLoading, error } = useShelters();
  const [sheetState, setSheetState] = useState<SheetState>('minimized');
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(
    null
  );

  const shelters = data?.features ?? [];

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
        <div className="flex-1 min-h-0">
          <ShelterMap
            shelters={shelters}
            selectedShelterId={selectedShelterId}
            onShelterSelect={setSelectedShelterId}
          />
        </div>

        {/* Bottom Sheet */}
        <BottomSheet state={sheetState} onStateChange={setSheetState}>
          <SheetContent
            shelters={shelters}
            selectedShelterId={selectedShelterId}
            onShelterSelect={(id) => {
              setSelectedShelterId(id);
              setSheetState('minimized'); // カードクリック時に地図を見せる
            }}
            onMapViewRequest={() => setSheetState('minimized')}
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
            <p className="text-sm text-gray-600">{shelters.length}件の避難所</p>
          </div>

          {/* 避難所リスト */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <ShelterList
              shelters={shelters}
              selectedShelterId={selectedShelterId}
              onShelterSelect={setSelectedShelterId}
            />
          </div>
        </div>

        {/* 地図エリア（右側） */}
        <div className="h-full flex-1">
          <ShelterMap
            shelters={shelters}
            selectedShelterId={selectedShelterId}
            onShelterSelect={setSelectedShelterId}
          />
        </div>
      </div>
    </>
  );
}
