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
import { getShelterIcon } from '@/lib/shelterIcons';
import { MAP_STYLES } from '@/types/map';
import type { ShelterFeature } from '@/types/shelter';
import { CurrentLocationButton } from './CurrentLocationButton';
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
}

// 避難所種別に応じたマーカー色
// WCAG 2.1 AA準拠（コントラスト比4.5:1以上）のため、白テキスト（#ffffff）との組み合わせを考慮
function getShelterColor(type: string): string {
  switch (type) {
    case '指定避難所':
      return '#2563eb'; // 青（blue-600）- コントラスト比: 4.5:1
    case '緊急避難場所':
      return '#dc2626'; // 赤（red-600）- コントラスト比: 5.1:1
    case '両方':
      return '#6d28d9'; // 紫（violet-700）- コントラスト比: 4.5:1（violet-600から変更）
    default:
      return '#4b5563'; // グレー（gray-600）- コントラスト比: 7.0:1
  }
}

// 避難所種別に応じたマーカー形状
// WCAG 1.4.1 Use of Color (Level A) に対応: 色だけでなく形状でも区別可能にする
function getShelterShape(type: string): string {
  switch (type) {
    case '指定避難所':
      return 'rounded-full'; // 円形
    case '緊急避難場所':
      return 'rounded-sm'; // 四角形（角丸）
    case '両方':
      return 'rounded-full'; // 円形（星アイコンで区別）
    default:
      return 'rounded-full'; // 円形
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
  onShowDetail,
  position: externalPosition,
  geolocationState,
  geolocationError,
  onGetCurrentPosition,
}: MapProps) {
  const [selectedShelter, setSelectedShelter] = useState<ShelterFeature | null>(
    null
  );
  const { current: map } = useMap();
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
    // 現在位置が既に取得されている場合は、すぐに地図を中心に移動
    if (position && map) {
      map.flyTo({
        center: [position.longitude, position.latitude],
        zoom: 15,
        duration: 1000,
      });
    }
  }, [onGetCurrentPosition, position, map]);

  // 地図の移動を追跡（必要に応じて）
  const handleMove = useCallback((_evt: ViewStateChangeEvent) => {
    // クラスタリング削除により、ズームレベルと表示領域の追跡は不要
  }, []);

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

  // マーカーをメモ化してレンダリング最適化
  const markers = useMemo(
    () =>
      shelters.map((shelter) => {
        const coordinates = shelter.geometry.coordinates;
        const lng = coordinates[0];
        const lat = coordinates[1];

        if (lng === undefined || lat === undefined) return null;

        const color = getShelterColor(shelter.properties.type);
        const shape = getShelterShape(shelter.properties.type);
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
              className={`flex cursor-pointer items-center justify-center border-2 shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${shape} ${
                isSelected
                  ? 'h-10 w-10 border-blue-500 ring-2 ring-blue-300'
                  : 'h-8 w-8 border-white'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`${shelter.properties.name}（${shelter.properties.type}）`}
              aria-pressed={isSelected}
              title={`${shelter.properties.name} - ${shelter.properties.type}`}
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
            <div className="p-3">
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
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
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
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
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

      {/* 現在地ボタン - モバイル: 右下（タブバーの上 = 80px + マージン）、PC: 右下 */}
      <div className="absolute bottom-32 right-4 z-10 lg:bottom-20 lg:right-4">
        <CurrentLocationButton
          onClick={handleLocationButtonClick}
          state={state}
          error={error}
        />
      </div>
    </div>
  );
}
