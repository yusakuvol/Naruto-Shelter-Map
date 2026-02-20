'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import MapGL, {
  Marker,
  NavigationControl,
  Popup,
  useMap,
  type ViewStateChangeEvent,
} from 'react-map-gl/maplibre';
import type {
  Coordinates,
  GeolocationError,
  GeolocationState,
} from '@/hooks/useGeolocation';
import { generateNavigationURL } from '@/lib/navigation';
import { MAP_STYLES } from '@/types/map';
import type { ShelterFeature } from '@/types/shelter';
import { CurrentLocationButton } from './CurrentLocationButton';
import { FilterButton } from './FilterButton';
import { ShelterPinMarker } from './ShelterPinMarker';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapProps {
  shelters: ShelterFeature[];
  selectedShelterId?: string | null | undefined;
  onShelterSelect?: (id: string) => void;
  onShowDetail?: (shelter: ShelterFeature) => void;
  position?: Coordinates | null;
  geolocationState?: GeolocationState;
  geolocationError?: GeolocationError | null;
  onGetCurrentPosition?: () => void;
  /** モバイル用: 避難所データを最新に更新（押したときだけ通信） */
  onRefresh?: () => void;
  isRefreshing?: boolean;
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
  }, []);

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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
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
                  className="h-4 w-4 text-gray-600"
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
                className="absolute h-6 w-6 animate-ping rounded-full bg-blue-400 opacity-75"
                aria-hidden="true"
              />
              {/* 内側の固定円 */}
              <div
                className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg"
                aria-hidden="true"
              />
            </div>
          </Marker>
        )}

        {selectedShelter && (
          <Popup
            key={selectedShelter.properties.id}
            longitude={selectedShelter.geometry.coordinates[0]}
            latitude={selectedShelter.geometry.coordinates[1]}
            anchor="bottom"
            onClose={handleClosePopup}
            closeButton={true}
            closeOnClick={false}
            className="shelter-popup"
          >
            <div className="p-4">
              <h3 className="mb-2 font-bold text-gray-900">
                {selectedShelter.properties.name}
              </h3>
              <div className="space-y-1 text-sm text-gray-700 mb-3">
                <p>
                  <span className="font-semibold">種別:</span>{' '}
                  {selectedShelter.properties.type}
                </p>
                <p>
                  <span className="font-semibold">住所:</span>{' '}
                  {selectedShelter.properties.address}
                </p>
                <p>
                  <span className="font-semibold">災害種別:</span>{' '}
                  {selectedShelter.properties.disasterTypes.join('・')}
                </p>
                {selectedShelter.properties.capacity && (
                  <p>
                    <span className="font-semibold">収容人数:</span>{' '}
                    {selectedShelter.properties.capacity}人
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onShowDetail?.(selectedShelter);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  aria-label={`${selectedShelter.properties.name}の詳細を見る`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>詳細を見る</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const [lng, lat] = selectedShelter.geometry.coordinates;
                    const url = generateNavigationURL(
                      { latitude: lat, longitude: lng },
                      undefined,
                      'walking'
                    );
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  aria-label={`${selectedShelter.properties.name}への経路案内`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <span>経路案内を開く</span>
                </button>
              </div>
            </div>
          </Popup>
        )}
      </MapGL>

      {/* 現在地ボタン - モバイル: 右下、PC: 右下 */}
      <div className="absolute bottom-20 right-4 z-10 lg:bottom-10 lg:right-4">
        <CurrentLocationButton
          onClick={handleLocationButtonClick}
          state={state}
          error={error}
        />
      </div>
    </div>
  );
}
