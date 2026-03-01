import { lazy, Suspense, useEffect, useId } from 'react';
import { toast } from 'sonner';
import { Router } from 'wouter';
import { SkipLink } from '@/components/a11y/SkipLink';
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
import { Toaster } from '@/components/ui/sonner';
import { FilterProvider } from '@/contexts/FilterContext';
import { useHomePageState } from '@/hooks/useHomePageState';
import { calculateDistance, toCoordinates } from '@/lib/geo';

const ShelterMap = lazy(() =>
  import('@/components/map/Map').then((mod) => ({ default: mod.ShelterMap }))
);

const MAP_LOADING_FALLBACK = (
  <div className="flex h-full w-full items-center justify-center bg-muted">
    <div className="text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      <p className="mt-4 text-sm text-muted-foreground">
        地図を読み込んでいます...
      </p>
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

  // リフレッシュエラーを Sonner toast で表示
  useEffect(() => {
    if (refreshError) {
      const message =
        refreshError.message.includes('fetch') ||
        refreshError.message.includes('Network')
          ? 'オフラインのため更新できません'
          : refreshError.message;
      toast.warning(message);
      clearRefreshError();
    }
  }, [refreshError, clearRefreshError]);

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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
              onOpenChat={() => setChatModalOpen(true)}
            />
          </Suspense>
        </main>
        <p className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-2 z-10 text-[10px] text-muted-foreground/70">
          Designed by Yusaku Matsukawa
        </p>
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
      <Toaster position="bottom-center" />
    </div>
  );
}

export { App };
