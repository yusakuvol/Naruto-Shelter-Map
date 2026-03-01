import { InfoIcon, RefreshCwIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import MapGL, {
  Marker,
  NavigationControl,
  useMap,
  type ViewStateChangeEvent,
} from 'react-map-gl/maplibre';
import { ChatFab } from '@/components/chat/ChatFab';
import type {
  Coordinates,
  GeolocationError,
  GeolocationState,
} from '@/hooks/useGeolocation';
import { MAP_STYLES } from '@/types/map';
import type { ShelterFeature } from '@/types/shelter';
import { CurrentLocationButton } from './CurrentLocationButton';
import { FilterButton } from './FilterButton';
import { ShelterPinMarker } from './ShelterPinMarker';
import { ShelterPopup } from './ShelterPopup';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapProps {
  shelters: ShelterFeature[];
  selectedShelterId?: string | null | undefined;
  onShelterSelect?: (id: string | null) => void;
  onShowDetail?: (shelter: ShelterFeature) => void;
  position?: Coordinates | null;
  geolocationState?: GeolocationState;
  geolocationError?: GeolocationError | null;
  onGetCurrentPosition?: () => void;
  /** モバイル用: 避難所データを最新に更新（押したときだけ通信） */
  onRefresh?: () => void;
  isRefreshing?: boolean;
  /** 利用規約モーダルを開く */
  onShowTerms?: () => void;
  /** モバイル用: チャットモーダルを開く */
  onOpenChat?: () => void;
}

// 地図の移動を制御する内部コンポーネント
function MapController({
  selectedShelterId,
  shelters,
}: {
  selectedShelterId?: string | null | undefined;
  shelters: ShelterFeature[];
}) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!selectedShelterId || !map) return;

    const shelter = shelters.find((s) => s.properties.id === selectedShelterId);
    if (!shelter) return;

    const [lng, lat] = shelter.geometry.coordinates;

    // 地図を滑らかに移動（現在のズームは維持）
    const currentZoom = map.getZoom();
    map.flyTo({
      center: [lng, lat],
      zoom: currentZoom,
      duration: 1000,
    });
  }, [selectedShelterId, shelters, map]);

  return null;
}

// 現在地を取得したら地図を移動する内部コンポーネント
function LocationController({ position }: { position?: Coordinates | null }) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!position || !map) return;

    map.flyTo({
      center: [position.longitude, position.latitude],
      zoom: 15,
      duration: 1000,
    });
  }, [position, map]);

  return null;
}

export function ShelterMap({
  shelters,
  selectedShelterId,
  onShelterSelect,
  onShowDetail,
  position: externalPosition,
  geolocationState,
  geolocationError,
  onGetCurrentPosition,
  onRefresh,
  isRefreshing = false,
  onShowTerms,
  onOpenChat,
}: MapProps) {
  const [selectedShelter, setSelectedShelter] = useState<ShelterFeature | null>(
    null
  );
  // 標準地図のみを使用
  const styleUrl = MAP_STYLES.standard.url;

  // 外部から渡された位置情報を使用、なければフォールバック
  const position = externalPosition ?? null;
  const state = geolocationState ?? 'idle';
  const error = geolocationError ?? null;

  const handleMarkerClick = useCallback(
    (shelter: ShelterFeature) => {
      setSelectedShelter(shelter);
      onShelterSelect?.(shelter.properties.id);
    },
    [onShelterSelect]
  );

  const handleClosePopup = useCallback(() => {
    setSelectedShelter(null);
    onShelterSelect?.(null);
  }, [onShelterSelect]);

  const handleLocationButtonClick = useCallback(() => {
    onGetCurrentPosition?.();
  }, [onGetCurrentPosition]);

  // 地図の移動を追跡（必要に応じて）
  const handleMove = useCallback((_evt: ViewStateChangeEvent) => {
    // クラスタリング削除により、ズームレベルと表示領域の追跡は不要
  }, []);

  // selectedShelterIdが変更されたらポップアップを表示
  useEffect(() => {
    if (!selectedShelterId) return;

    const shelter = shelters.find((s) => s.properties.id === selectedShelterId);
    if (!shelter) return;

    setSelectedShelter(shelter);
  }, [selectedShelterId, shelters]);

  // マーカーをメモ化してレンダリング最適化
  const markers = useMemo(
    () =>
      shelters.map((shelter) => {
        const coordinates = shelter.geometry.coordinates;
        const lng = coordinates[0];
        const lat = coordinates[1];

        if (lng === undefined || lat === undefined) return null;

        const isSelected = selectedShelterId === shelter.properties.id;

        return (
          <Marker
            key={shelter.properties.id}
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            onClick={() => handleMarkerClick(shelter)}
          >
            <ShelterPinMarker shelter={shelter} isSelected={isSelected} />
          </Marker>
        );
      }),
    [shelters, selectedShelterId, handleMarkerClick]
  );

  return (
    <div className="map-container relative h-full w-full">
      {/* スクリーンリーダー用の説明 */}
      {/* biome-ignore lint/a11y/useSemanticElements: スクリーンリーダー用のステータス表示のためrole="status"が適切 */}
      <div className="sr-only" role="status" aria-live="polite">
        地図: 鳴門市の避難所を表示しています。
        矢印キーで地図を移動、+/-キーでズーム、
        Tabキーで避難所マーカーを選択できます。
      </div>

      <MapGL
        initialViewState={{
          longitude: 134.609,
          latitude: 34.173,
          zoom: 12,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={styleUrl}
        onMove={handleMove}
      >
        <MapController
          selectedShelterId={selectedShelterId}
          shelters={shelters}
        />
        <LocationController position={position} />
        <NavigationControl
          position="top-right"
          showCompass={false}
          showZoom={true}
        />
        {/* モバイル用: フィルタ + データ更新ボタン（横並び） */}
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 lg:hidden">
          <FilterButton />
          {onRefresh && (
            <button
              type="button"
              onClick={() => onRefresh()}
              disabled={isRefreshing}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-lg transition-all hover:bg-accent hover:shadow-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60"
              aria-label="避難所データを最新に更新"
              title="通信して最新の避難所データを取得します"
            >
              {isRefreshing ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
                  aria-hidden
                />
              ) : (
                <RefreshCwIcon
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden
                />
              )}
            </button>
          )}
        </div>

        {markers}

        {/* 現在地マーカー */}
        {position && (
          <Marker
            longitude={position.longitude}
            latitude={position.latitude}
            anchor="center"
          >
            <div
              className="relative flex h-6 w-6 items-center justify-center"
              role="img"
              aria-label="現在地"
            >
              {/* 外側のパルスアニメーション */}
              <div
                className="absolute h-6 w-6 animate-ping rounded-full bg-primary/60 opacity-75"
                aria-hidden="true"
              />
              {/* 内側の固定円 */}
              <div
                className="relative h-4 w-4 rounded-full border-2 border-background bg-primary shadow-lg"
                aria-hidden="true"
              />
            </div>
          </Marker>
        )}

        {selectedShelter && (
          <ShelterPopup
            shelter={selectedShelter}
            onClose={handleClosePopup}
            onShowDetail={onShowDetail}
          />
        )}
      </MapGL>

      {/* モバイル用右側ボタン群（上: チャット → 中: 現在地 → 下: 規約） */}
      <div className="absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] right-4 z-10 flex flex-col items-end gap-3 lg:hidden">
        {onOpenChat && <ChatFab onClick={onOpenChat} />}
        <CurrentLocationButton
          onClick={handleLocationButtonClick}
          state={state}
          error={error}
        />
        {onShowTerms && (
          <button
            type="button"
            onClick={onShowTerms}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-lg transition-all hover:bg-accent hover:shadow-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            aria-label="利用規約を表示"
            title="利用規約"
          >
            <InfoIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
          </button>
        )}
      </div>

      {/* デスクトップ用現在地ボタン */}
      <div className="absolute bottom-10 right-4 z-10 hidden lg:block">
        <CurrentLocationButton
          onClick={handleLocationButtonClick}
          state={state}
          error={error}
        />
      </div>
    </div>
  );
}
