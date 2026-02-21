import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import type { SortMode } from '@/components/shelter/SortToggle';
import { useFavorites } from '@/hooks/useFavorites';
import { useFilteredShelters } from '@/hooks/useFilteredShelters';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useShelters } from '@/hooks/useShelters';
import { calculateDistance, toCoordinates } from '@/lib/geo';
import type { ShelterFeature } from '@/types/shelter';

interface ShelterWithDistance {
  shelter: ShelterFeature;
  distance: number | null;
}

export interface HomePageState {
  /** データ */
  filteredShelters: ShelterFeature[];
  allSheltersCount: number;
  listShelters: ShelterWithDistance[];
  isLoading: boolean;
  error: Error | null;
  retry: () => void;

  /** リフレッシュ */
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  refreshError: Error | null;
  clearRefreshError: () => void;

  /** 選択・詳細 */
  selectedShelterId: string | null;
  setSelectedShelterId: (id: string | null) => void;
  detailModalShelter: ShelterFeature | null;
  openDetail: (shelter: ShelterFeature) => void;
  closeDetail: () => void;

  /** 位置情報 */
  position: ReturnType<typeof useGeolocation>['position'];
  geolocationState: ReturnType<typeof useGeolocation>['state'];
  geolocationError: ReturnType<typeof useGeolocation>['error'];
  getCurrentPosition: () => void;

  /** お気に入り */
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;

  /** ソート・フィルタ */
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  listFilter: 'all' | 'favorites' | 'chat';
  setListFilter: (filter: 'all' | 'favorites' | 'chat') => void;

  /** チャット */
  chatModalOpen: boolean;
  setChatModalOpen: (open: boolean) => void;

  /** 利用規約 */
  showTerms: boolean;
  openTerms: () => void;
  closeTerms: () => void;
}

export function useHomePageState(): HomePageState {
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

  return {
    filteredShelters,
    allSheltersCount: allShelters.length,
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
    setListFilter,
    listFilter,
    chatModalOpen,
    setChatModalOpen,
    showTerms,
    openTerms,
    closeTerms,
  };
}
