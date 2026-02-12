'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { NetworkError } from '@/components/error/NetworkError';
import { DisasterTypeFilter } from '@/components/filter/DisasterTypeFilter';
import { ShelterDetailModal } from '@/components/shelter/ShelterDetailModal';
import { ShelterList } from '@/components/shelter/ShelterList';
import { type SortMode, SortToggle } from '@/components/shelter/SortToggle';
import { FilterProvider } from '@/contexts/FilterContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useFilteredShelters } from '@/hooks/useFilteredShelters';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useShelters } from '@/hooks/useShelters';
import { calculateDistance, toCoordinates } from '@/lib/geo';
import type { ShelterFeature } from '@/types/shelter';

// 地図コンポーネントを動的インポート（LCP改善のため）
const ShelterMap = dynamic(
  () =>
    import('@/components/map/Map').then((mod) => ({ default: mod.ShelterMap })),
  {
    ssr: false, // 地図はクライアントサイドのみで動作
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-4 text-gray-600">地図を読み込んでいます...</p>
        </div>
      </div>
    ),
  }
);

function HomePageContent() {
  const {
    data,
    isLoading,
    error,
    retry,
    refresh,
    isRefreshing,
    refreshError,
    clearRefreshError,
  } = useShelters();
  const {
    position,
    state: geolocationState,
    error: geolocationError,
    getCurrentPosition,
  } = useGeolocation();
  const { favorites, toggleFavorite } = useFavorites();
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(
    null
  );
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [listFilter, setListFilter] = useState<'all' | 'favorites'>('all');
  const [detailModalShelter, setDetailModalShelter] =
    useState<ShelterFeature | null>(null);

  const allShelters = data?.features ?? [];
  const filteredShelters = useFilteredShelters(allShelters);

  // 距離計算とソート
  const sortedShelters = useMemo(() => {
    // 距離を含む拡張データを作成
    const sheltersWithDistance = filteredShelters.map((shelter) => ({
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
  }, [filteredShelters, sortMode, position]);

  // お気に入りフィルタ適用後のリスト（サイドバー表示用）
  const listShelters = useMemo(() => {
    if (listFilter === 'favorites') {
      return sortedShelters.filter((item) =>
        favorites.has(item.shelter.properties.id)
      );
    }
    return sortedShelters;
  }, [sortedShelters, listFilter, favorites]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <NetworkError message={error.message} onRetry={retry} />
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
      {/* データ更新失敗時のメッセージ（オフライン等） */}
      {refreshError && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg sm:left-auto sm:right-4 sm:max-w-sm"
        >
          <p className="text-sm text-amber-900">
            {refreshError.message.includes('fetch') ||
            refreshError.message.includes('Network')
              ? 'オフラインのため更新できません'
              : refreshError.message}
          </p>
          <button
            type="button"
            onClick={clearRefreshError}
            className="flex-shrink-0 rounded p-1 text-amber-700 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="閉じる"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* モバイルレイアウト（< 1024px） */}
      <div className="flex h-screen flex-col lg:hidden">
        {/* 地図エリア（フルスクリーン） */}
        <main id="main-content" className="relative flex-1 min-h-0">
          <ShelterMap
            shelters={filteredShelters}
            selectedShelterId={selectedShelterId}
            onShelterSelect={setSelectedShelterId}
            onShowDetail={setDetailModalShelter}
            position={position}
            geolocationState={geolocationState}
            geolocationError={geolocationError}
            onGetCurrentPosition={getCurrentPosition}
            onRefresh={refresh}
            isRefreshing={isRefreshing}
          />
        </main>
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
            <div className="mb-2 flex items-center justify-between gap-2">
              <h1 className="flex-shrink-0 text-2xl font-bold text-gray-900">
                避難所マップ
              </h1>
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60"
                aria-label="避難所データを最新に更新"
                title="通信して最新の避難所データを取得します（通常はキャッシュのみで通信しません）"
              >
                {isRefreshing ? (
                  <span
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
                    aria-hidden
                  />
                ) : (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
                <span className="hidden sm:inline">
                  {isRefreshing ? '更新中...' : 'データを更新'}
                </span>
              </button>
            </div>
            <p className="text-sm text-gray-700">
              {listFilter === 'favorites'
                ? `${listShelters.length}件のお気に入り`
                : `${filteredShelters.length}件の避難所`}
              {listFilter === 'all' &&
                filteredShelters.length !== allShelters.length && (
                  <span className="ml-1 text-gray-700">
                    （全{allShelters.length}件中）
                  </span>
                )}
            </p>
          </header>

          {/* リスト表示切り替え（すべて / お気に入り） */}
          <div className="border-b p-4">
            <div
              className="flex rounded-lg border border-gray-200 p-1"
              role="tablist"
              aria-label="リストの表示"
            >
              <button
                type="button"
                role="tab"
                aria-selected={listFilter === 'all'}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  listFilter === 'all'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setListFilter('all')}
              >
                すべて
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={listFilter === 'favorites'}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  listFilter === 'favorites'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setListFilter('favorites')}
              >
                お気に入り{favorites.size > 0 && ` (${favorites.size})`}
              </button>
            </div>
          </div>

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
            className="min-h-0 flex-1 overflow-hidden"
          >
            <ShelterList
              shelters={listShelters}
              selectedShelterId={selectedShelterId}
              onShelterSelect={setSelectedShelterId}
              onShowDetail={(shelter) => {
                setSelectedShelterId(shelter.properties.id);
                setDetailModalShelter(shelter);
              }}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              userPosition={position}
              {...(listFilter === 'favorites' && {
                emptyMessage: 'お気に入りに追加した避難所がここに表示されます',
              })}
            />
          </nav>
        </aside>

        {/* 地図エリア（右側） */}
        <main id="main-content" className="relative h-full flex-1">
          <ShelterMap
            shelters={filteredShelters}
            selectedShelterId={selectedShelterId}
            onShelterSelect={setSelectedShelterId}
            onShowDetail={setDetailModalShelter}
            position={position}
            geolocationState={geolocationState}
            geolocationError={geolocationError}
            onGetCurrentPosition={getCurrentPosition}
          />
        </main>
      </div>

      {/* 詳細モーダル（マップポップアップから開く） */}
      {detailModalShelter && (
        <ShelterDetailModal
          shelter={detailModalShelter}
          isOpen={!!detailModalShelter}
          onClose={() => setDetailModalShelter(null)}
          distance={
            position
              ? calculateDistance(
                  position,
                  toCoordinates(detailModalShelter.geometry.coordinates)
                )
              : null
          }
          userPosition={position}
          isFavorite={favorites.has(detailModalShelter.properties.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </>
  );
}

export default function HomePage() {
  return (
    <ErrorBoundary>
      <FilterProvider>
        <HomePageContent />
      </FilterProvider>
    </ErrorBoundary>
  );
}
