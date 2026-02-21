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
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { NetworkError } from '@/components/error/NetworkError';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { TermsModal } from '@/components/legal/TermsModal';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { UpdateNotification } from '@/components/pwa/UpdateNotification';
import { ShelterDetailModal } from '@/components/shelter/ShelterDetailModal';
import type { SortMode } from '@/components/shelter/SortToggle';
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

      {/* モバイルレイアウト */}
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

      {/* デスクトップレイアウト */}
      <div className="hidden lg:flex lg:h-screen lg:flex-row lg:overflow-hidden">
        <DesktopSidebar
          mainContentId={mainContentId}
          filteredShelters={filteredShelters}
          allSheltersCount={allShelters.length}
          listShelters={listShelters}
          selectedShelterId={selectedShelterId}
          onShelterSelect={setSelectedShelterId}
          onShowDetail={openDetail}
          onShowTerms={openTerms}
          onRefresh={refresh}
          isRefreshing={isRefreshing}
          position={position ?? null}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          listFilter={listFilter}
          onListFilterChange={setListFilter}
        />

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
