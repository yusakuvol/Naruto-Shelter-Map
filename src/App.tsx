import { lazy, Suspense, useId } from 'react';
import { Router } from 'wouter';
import { SkipLink } from '@/components/a11y/SkipLink';
import { ChatFab } from '@/components/chat/ChatFab';
import { ChatModal } from '@/components/chat/ChatModal';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { NetworkError } from '@/components/error/NetworkError';
import { RefreshErrorToast } from '@/components/error/RefreshErrorToast';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { TermsModal } from '@/components/legal/TermsModal';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { UpdateNotification } from '@/components/pwa/UpdateNotification';
import { ShelterDetailModal } from '@/components/shelter/ShelterDetailModal';
import { FilterProvider } from '@/contexts/FilterContext';
import { useHomePageState } from '@/hooks/useHomePageState';
import { calculateDistance, toCoordinates } from '@/lib/geo';

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
  const {
    filteredShelters,
    allSheltersCount,
    listShelters,
    isLoading,
    error,
    retry,
    refresh,
    isRefreshing,
    refreshError,
    clearRefreshError,
    selectedShelterId,
    setSelectedShelterId,
    detailModalShelter,
    openDetail,
    closeDetail,
    position,
    geolocationState,
    geolocationError,
    getCurrentPosition,
    favorites,
    toggleFavorite,
    sortMode,
    setSortMode,
    listFilter,
    setListFilter,
    chatModalOpen,
    setChatModalOpen,
    showTerms,
    openTerms,
    closeTerms,
  } = useHomePageState();

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
        <RefreshErrorToast error={refreshError} onClose={clearRefreshError} />
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
          allSheltersCount={allSheltersCount}
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
