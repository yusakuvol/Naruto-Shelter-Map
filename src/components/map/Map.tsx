'use client';

import type { ShelterFeature } from '@/types/shelter';
import { useCallback, useState } from 'react';
import MapGL, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapProps {
  shelters: ShelterFeature[];
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

export function ShelterMap({ shelters }: MapProps) {
  const [selectedShelter, setSelectedShelter] = useState<ShelterFeature | null>(
    null
  );

  const handleMarkerClick = useCallback((shelter: ShelterFeature) => {
    setSelectedShelter(shelter);
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedShelter(null);
  }, []);

  return (
    <div className="h-full w-full">
      <MapGL
        initialViewState={{
          longitude: 134.609,
          latitude: 34.173,
          zoom: 12,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json"
      >
        <NavigationControl position="top-right" />

        {shelters.map((shelter) => {
          const [lng, lat] = shelter.geometry.coordinates;
          const color = getShelterColor(shelter.properties.type);

          return (
            <Marker
              key={shelter.properties.id}
              longitude={lng}
              latitude={lat}
              anchor="bottom"
              onClick={() => handleMarkerClick(shelter)}
            >
              <div
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              >
                <svg
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
            </Marker>
          );
        })}

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
    </div>
  );
}
