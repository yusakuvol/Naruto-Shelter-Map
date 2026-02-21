import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import { Router, useLocation, useRoute } from 'wouter';
import { SkipLink } from '@/components/a11y/SkipLink';
import { ChatFab } from '@/components/chat/ChatFab';
import { ChatModal } from '@/components/chat/ChatModal';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { NetworkError } from '@/components/error/NetworkError';
import { DisasterTypeFilter } from '@/components/filter/DisasterTypeFilter';
import { TermsModal } from '@/components/legal/TermsModal';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { UpdateNotification } from '@/components/pwa/UpdateNotification';
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

const ShelterMap = lazy(() =>
  import('@/components/map/Map').then((mod) => ({ default: mod.ShelterMap }))
);

const MAP_LOADING_FALLBACK = (
  <div className="flex h-full w-full items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      <p className="mt-4 text-gray-600">地図を読み込んでいます...</p>
    </div>
  </div>
);

function HomePageContent({ mainContentId }: { mainContentId: string }) {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/shelter/:id');
  const shelterIdFromUrl = match ? (params.id ?? null) : null;
  const [termsMatch] = useRoute('/terms');
  const showTerms = !!termsMatch;

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
  const [selectedShelterIdState, setSelectedShelterIdState] = useState<
    string | null
  >(null);
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [listFilter, setListFilter] = useState<'all' | 'favorites' | 'chat'>(
    'all'
  );
  const [chatModalOpen, setChatModalOpen] = useState(false);

  const selectedShelterId = shelterIdFromUrl ?? selectedShelterIdState;
  const setSelectedShelterId = useCallback((id: string | null) => {
    setSelectedShelterIdState(id);
  }, []);

  const detailModalShelter = useMemo(() => {
    if (!shelterIdFromUrl || !data?.features) return null;
    return (
      data.features.find((f) => f.properties.id === shelterIdFromUrl) ?? null
    );
  }, [shelterIdFromUrl, data]);

  const openDetail = useCallback(
    (shelter: ShelterFeature) => {
      setLocation(`/shelter/${shelter.properties.id}`);
    },
    [setLocation]
  );
  const closeDetail = useCallback(() => {
    if (shelterIdFromUrl) {
      setSelectedShelterIdState(shelterIdFromUrl);
    }
    setLocation('/');
  }, [setLocation, shelterIdFromUrl]);

  const openTerms = useCallback(() => {
    setLocation('/terms');
  }, [setLocation]);
  const closeTerms = useCallback(() => {
    setLocation('/');
  }, [setLocation]);

  // 存在しない id の場合はトップへリダイレクト
  useEffect(() => {
    if (
      shelterIdFromUrl &&
      data?.features &&
      !data.features.some((f) => f.properties.id === shelterIdFromUrl)
    ) {
      setLocation('/');
    }
  }, [shelterIdFromUrl, data?.features, setLocation]);

  const allShelters = data?.features ?? [];
  const filteredShelters = useFilteredShelters(allShelters);

  const sortedShelters = useMemo(() => {
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

    if (sortMode === 'distance' && position) {
      return sheltersWithDistance
        .filter((item) => item.distance !== null)
        .sort((a, b) => {
          if (a.distance === null || b.distance === null) return 0;
          return a.distance - b.distance;
        });
    }

    return sheltersWithDistance.sort((a, b) =>
      a.shelter.properties.name.localeCompare(
        b.shelter.properties.name,
        'ja-JP'
      )
    );
  }, [filteredShelters, sortMode, position]);

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
            className="shrink-0 rounded p-1 text-amber-700 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
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

      <div className="relative flex h-screen flex-col lg:hidden">
        <main id={mainContentId} className="relative min-h-0 flex-1">
          <Suspense fallback={MAP_LOADING_FALLBACK}>
            <ShelterMap
              shelters={filteredShelters}
              selectedShelterId={selectedShelterId}
              onShelterSelect={setSelectedShelterId}
              onShowDetail={openDetail}
              position={position}
              geolocationState={geolocationState}
              geolocationError={geolocationError}
              onGetCurrentPosition={getCurrentPosition}
              onRefresh={refresh}
              isRefreshing={isRefreshing}
              onShowTerms={openTerms}
            />
          </Suspense>
        </main>
        <div className="absolute bottom-34 right-4 z-10">
          <ChatFab onClick={() => setChatModalOpen(true)} />
        </div>
      </div>

      <div className="hidden lg:flex lg:h-screen lg:flex-row lg:overflow-hidden">
        <aside
          className="flex h-full w-96 flex-col border-r bg-white"
          aria-label="避難所フィルタとリスト"
        >
          <header className="border-b p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <img
                  src="/icon.svg"
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9"
                  aria-hidden="true"
                />
                鳴門避難マップ
              </h1>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void refresh()}
                  disabled={isRefreshing}
                  className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-1.5 text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60"
                  aria-label="避難所データを最新に更新"
                  title="通信して最新の避難所データを取得します"
                >
                  {isRefreshing ? (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
                      aria-hidden
                    />
                  ) : (
                    <svg
                      className="h-4 w-4"
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
                </button>
                <button
                  type="button"
                  onClick={openTerms}
                  className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-1.5 text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  aria-label="利用規約を表示"
                  title="利用規約"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              {listFilter === 'chat'
                ? '避難所について質問'
                : listFilter === 'favorites'
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
              <button
                type="button"
                role="tab"
                aria-selected={listFilter === 'chat'}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  listFilter === 'chat'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setListFilter('chat')}
              >
                チャット
              </button>
            </div>
          </div>

          <nav aria-label="災害種別フィルタ" className="border-b p-4">
            <DisasterTypeFilter />
          </nav>

          {listFilter !== 'chat' && (
            <div className="border-b p-4">
              <SortToggle
                mode={sortMode}
                onModeChange={setSortMode}
                disabled={!position}
              />
            </div>
          )}

          <nav
            aria-label={
              listFilter === 'chat' ? '避難所について質問' : '避難所一覧'
            }
            className="min-h-0 flex-1 overflow-hidden"
          >
            {listFilter === 'chat' ? (
              <ChatPanel
                shelters={filteredShelters}
                userPosition={position ?? null}
              />
            ) : (
              <ShelterList
                shelters={listShelters}
                selectedShelterId={selectedShelterId}
                onShelterSelect={setSelectedShelterId}
                onShowDetail={openDetail}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                userPosition={position}
                {...(listFilter === 'favorites' && {
                  emptyMessage:
                    'お気に入りに追加した避難所がここに表示されます',
                })}
              />
            )}
          </nav>
        </aside>

        <main id={mainContentId} className="relative h-full flex-1">
          <Suspense fallback={MAP_LOADING_FALLBACK}>
            <ShelterMap
              shelters={filteredShelters}
              selectedShelterId={selectedShelterId}
              onShelterSelect={setSelectedShelterId}
              onShowDetail={openDetail}
              position={position}
              geolocationState={geolocationState}
              geolocationError={geolocationError}
              onGetCurrentPosition={getCurrentPosition}
            />
          </Suspense>
        </main>
      </div>

      {detailModalShelter && (
        <ShelterDetailModal
          shelter={detailModalShelter}
          isOpen={!!detailModalShelter}
          onClose={closeDetail}
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

      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        shelters={filteredShelters}
        userPosition={position ?? null}
      />

      <TermsModal isOpen={showTerms} onClose={closeTerms} />
    </>
  );
}

function App() {
  const mainContentId = useId();
  return (
    <div className="font-sans antialiased">
      <SkipLink targetId={mainContentId} />
      <ServiceWorkerRegistration />
      <ErrorBoundary>
        <FilterProvider>
          <Router>
            <HomePageContent mainContentId={mainContentId} />
          </Router>
        </FilterProvider>
      </ErrorBoundary>
      <OfflineIndicator />
      <InstallPrompt />
      <UpdateNotification />
    </div>
  );
}

export { App };
