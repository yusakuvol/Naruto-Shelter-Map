import { lazy, Suspense, useCallback, useEffect, useId, useState } from 'react';
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
import { useIsDesktop } from '@/hooks/useIsDesktop';
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

interface HomePageContentProps {
  mainContentId: string;
  onMapReady: () => void;
}

function HomePageContent({ mainContentId, onMapReady }: HomePageContentProps) {
  const isDesktop = useIsDesktop();
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

  return (
    <>
      <div className="relative flex h-screen flex-col lg:flex-row lg:overflow-hidden">
        {isDesktop && (
          <div className="h-full">
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
          </div>
        )}
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
              onRefresh={refresh}
              isRefreshing={isRefreshing}
              onShowTerms={openTerms}
              onOpenChat={() => setChatModalOpen(true)}
              onMapReady={onMapReady}
            />
          </Suspense>
          {isLoading && (
            <div
              className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border border-border bg-card/95 px-4 py-2 text-sm text-muted-foreground shadow-lg"
              role="status"
              aria-live="polite"
            >
              避難所データを読み込んでいます...
            </div>
          )}
        </main>
        <p className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-2 z-10 text-[10px] text-muted-foreground/70 lg:hidden">
          Designed by Yusaku Matsukawa
        </p>
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
  const [mapReady, setMapReady] = useState(false);
  const handleMapReady = useCallback(() => setMapReady(true), []);

  // 地図読み込みに失敗しても、次回のオフライン利用に備えて登録は継続する
  useEffect(() => {
    if (mapReady) return;
    const timeoutId = window.setTimeout(() => setMapReady(true), 10_000);
    return () => window.clearTimeout(timeoutId);
  }, [mapReady]);

  return (
    <div className="font-sans antialiased">
      <SkipLink targetId={mainContentId} />
      <ServiceWorkerRegistration enabled={mapReady} />
      <ErrorBoundary>
        <FilterProvider>
          <Router>
            <HomePageContent
              mainContentId={mainContentId}
              onMapReady={handleMapReady}
            />
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
