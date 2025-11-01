'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import MapGL, {
  Marker,
  NavigationControl,
  Popup,
  useMap,
} from 'react-map-gl/maplibre';
import type {
  Coordinates,
  GeolocationError,
  GeolocationState,
} from '@/hooks/useGeolocation';
import { getShelterIcon } from '@/lib/shelterIcons';
import type { ShelterFeature } from '@/types/shelter';
import { CurrentLocationButton } from './CurrentLocationButton';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapProps {
  shelters: ShelterFeature[];
  selectedShelterId?: string | null | undefined;
  onShelterSelect?: (id: string) => void;
  position?: Coordinates | null;
  geolocationState?: GeolocationState;
  geolocationError?: GeolocationError | null;
  onGetCurrentPosition?: () => void;
}

// 避難所種別に応じたマーカー色
function getShelterColor(type: string): string {
  switch (type) {
    case '指定避難所':
      return '#3b82f6'; // 青
    case '緊急避難場所':
      return '#ef4444'; // 赤
    case '両方':
      return '#8b5cf6'; // 紫
    default:
      return '#6b7280'; // グレー
  }
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

    // 地図を滑らかに移動
    map.flyTo({
      center: [lng, lat],
      zoom: 16,
      duration: 1000,
    });
  }, [selectedShelterId, shelters, map]);

  return null;
}

export function ShelterMap({
  shelters,
  selectedShelterId,
  onShelterSelect,
  position: externalPosition,
  geolocationState,
  geolocationError,
  onGetCurrentPosition,
}: MapProps) {
  const [selectedShelter, setSelectedShelter] = useState<ShelterFeature | null>(
    null
  );
  const { current: map } = useMap();

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
    // 現在位置が既に取得されている場合は、すぐに地図を中心に移動
    if (position && map) {
      map.flyTo({
        center: [position.longitude, position.latitude],
        zoom: 15,
        duration: 1000,
      });
    }
  }, [onGetCurrentPosition, position, map]);

  // 現在地を取得したら地図を移動
  useEffect(() => {
    if (!position || !map) return;

    map.flyTo({
      center: [position.longitude, position.latitude],
      zoom: 15,
      duration: 1000,
    });
  }, [position, map]);

  // selectedShelterIdが変更されたらポップアップを表示
  useEffect(() => {
    if (!selectedShelterId) return;

    const shelter = shelters.find((s) => s.properties.id === selectedShelterId);
    if (!shelter) return;

    setSelectedShelter(shelter);
  }, [selectedShelterId, shelters]);

  // マーカーをメモ化してレンダリング最適化（CLS削減）
  const markers = useMemo(
    () =>
      shelters.map((shelter) => {
        const [lng, lat] = shelter.geometry.coordinates;
        const color = getShelterColor(shelter.properties.type);
        const isSelected = selectedShelterId === shelter.properties.id;

        return (
          <Marker
            key={shelter.properties.id}
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            onClick={() => handleMarkerClick(shelter)}
          >
            <button
              type="button"
              className={`flex cursor-pointer items-center justify-center rounded-full border-2 shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                isSelected
                  ? 'h-10 w-10 border-blue-500 ring-2 ring-blue-300'
                  : 'h-8 w-8 border-white'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`${shelter.properties.name}（${shelter.properties.type}）`}
              aria-pressed={isSelected}
            >
              {getShelterIcon(shelter.properties.type, {
                className: 'h-5 w-5 text-white',
              })}
            </button>
          </Marker>
        );
      }),
    [shelters, selectedShelterId, handleMarkerClick]
  );

  return (
    <div className="map-container relative h-full w-full">
      {/* スクリーンリーダー用の説明 */}
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
        mapStyle="https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json"
      >
        <MapController
          selectedShelterId={selectedShelterId}
          shelters={shelters}
        />
        <NavigationControl position="top-right" />

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
            longitude={selectedShelter.geometry.coordinates[0]}
            latitude={selectedShelter.geometry.coordinates[1]}
            anchor="bottom"
            onClose={handleClosePopup}
            closeButton={true}
            closeOnClick={false}
            className="shelter-popup"
          >
            <div className="p-2">
              <h3 className="mb-2 font-bold text-gray-900">
                {selectedShelter.properties.name}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
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
            </div>
          </Popup>
        )}
      </MapGL>

      {/* 現在地ボタン - モバイル: 右下（タブバーの上 = 80px + 16px margin）、PC: 右下 */}
      <div className="absolute bottom-24 right-4 z-10 lg:bottom-20 lg:right-4">
        <CurrentLocationButton
          onClick={handleLocationButtonClick}
          state={state}
          error={error}
        />
      </div>
    </div>
  );
}
