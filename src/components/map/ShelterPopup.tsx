import { InfoIcon, MapIcon } from 'lucide-react';
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
  const { name, address, disasterTypes, capacity } = shelter.properties;

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
        <h3 className="mb-2 text-base font-bold text-foreground">{name}</h3>
        <div className="space-y-1 text-sm text-foreground/80 mb-3">
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
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-secondary-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={`${name}の詳細を見る`}
          >
            <InfoIcon className="h-4 w-4" aria-hidden="true" />
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
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={`${name}への経路案内`}
          >
            <MapIcon className="h-4 w-4" aria-hidden="true" />
            <span>経路案内を開く</span>
          </button>
        </div>
      </div>
    </Popup>
  );
}
