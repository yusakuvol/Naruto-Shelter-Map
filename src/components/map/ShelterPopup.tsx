import { Popup } from 'react-map-gl/maplibre';
import { generateNavigationURL } from '@/lib/navigation';
import type { ShelterFeature } from '@/types/shelter';

interface ShelterPopupProps {
  shelter: ShelterFeature;
  onClose: () => void;
  onShowDetail?: ((shelter: ShelterFeature) => void) | undefined;
}

export function ShelterPopup({
  shelter,
  onClose,
  onShowDetail,
}: ShelterPopupProps): React.JSX.Element {
  const [lng, lat] = shelter.geometry.coordinates;
  const { name, type, address, disasterTypes, capacity } = shelter.properties;

  return (
    <Popup
      key={shelter.properties.id}
      longitude={lng}
      latitude={lat}
      anchor="bottom"
      onClose={onClose}
      closeButton={true}
      closeOnClick={false}
      className="shelter-popup"
    >
      <div className="p-4">
        <h3 className="mb-2 text-base font-bold text-gray-900">{name}</h3>
        <div className="space-y-1 text-sm text-gray-700 mb-3">
          <p>
            <span className="font-semibold">種別:</span> {type}
          </p>
          <p>
            <span className="font-semibold">住所:</span> {address}
          </p>
          <p>
            <span className="font-semibold">災害種別:</span>{' '}
            {disasterTypes.join('・')}
          </p>
          {capacity && (
            <p>
              <span className="font-semibold">収容人数:</span> {capacity}人
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onShowDetail?.(shelter)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label={`${name}の詳細を見る`}
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
              const url = generateNavigationURL(
                { latitude: lat, longitude: lng },
                undefined,
                'walking'
              );
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            aria-label={`${name}への経路案内`}
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
  );
}
