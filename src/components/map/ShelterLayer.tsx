import type {
  CircleLayerSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';
import { useEffect } from 'react';
import { Layer, Source, useMap } from 'react-map-gl/maplibre';
import type { ShelterGeoJSON } from '@/types/shelter';

const SOURCE_ID = 'shelters';
export const SHELTER_INTERACTIVE_LAYER_ID = 'shelter-marker';

const SHELTER_ICONS = {
  designated: { id: 'shelter-pin-designated', color: '#2563eb' },
  emergency: { id: 'shelter-pin-emergency', color: '#dc2626' },
  both: { id: 'shelter-pin-both', color: '#7c3aed' },
  default: { id: 'shelter-pin-default', color: '#4b5563' },
} as const;

const SHELTER_COLOR: CircleLayerSpecification['paint'] = {
  'circle-color': [
    'match',
    ['get', 'type'],
    '指定避難所',
    '#2563eb',
    '緊急避難場所',
    '#dc2626',
    '両方',
    '#7c3aed',
    '#4b5563',
  ],
};

const SHELTER_ICON: SymbolLayerSpecification['layout'] = {
  'icon-image': [
    'match',
    ['get', 'type'],
    '指定避難所',
    SHELTER_ICONS.designated.id,
    '緊急避難場所',
    SHELTER_ICONS.emergency.id,
    '両方',
    SHELTER_ICONS.both.id,
    SHELTER_ICONS.default.id,
  ],
};

function createShelterPin(color: string): ImageData | null {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 84;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.save();
  context.translate(4, 2);
  context.shadowColor = 'rgba(0, 0, 0, 0.35)';
  context.shadowBlur = 4;
  context.shadowOffsetY = 3;
  context.fillStyle = color;
  context.fill(
    new Path2D(
      'M28 0C12.536 0 0 12.536 0 28c0 6.83 4.2 15.2 9.8 22.4C16.1 59.2 28 76 28 76s11.9-16.8 18.2-25.6C51.8 43.2 56 34.83 56 28 56 12.536 43.464 0 28 0z'
    )
  );
  context.restore();

  context.beginPath();
  context.arc(32, 28, 9, 0, Math.PI * 2);
  context.fillStyle = '#ffffff';
  context.fill();
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function ShelterIconImages(): null {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;

    const registerIcons = () => {
      for (const { id, color } of Object.values(SHELTER_ICONS)) {
        if (map.hasImage(id)) continue;
        const image = createShelterPin(color);
        if (image) map.addImage(id, image, { pixelRatio: 2 });
      }
    };

    if (map.isStyleLoaded()) {
      registerIcons();
      return;
    }

    map.on('load', registerIcons);
    return () => {
      map.off('load', registerIcons);
    };
  }, [map]);

  return null;
}

interface ShelterLayerProps {
  data: ShelterGeoJSON;
  selectedShelterId?: string | null | undefined;
}

/** 避難所をDOM要素ではなくMapLibreのGeoJSONレイヤーとして描画する */
export function ShelterLayer({
  data,
  selectedShelterId,
}: ShelterLayerProps): React.JSX.Element {
  const selectedFilter: CircleLayerSpecification['filter'] = [
    '==',
    ['get', 'id'],
    selectedShelterId ?? '',
  ];

  return (
    <>
      <ShelterIconImages />
      <Source id={SOURCE_ID} type="geojson" data={data}>
        {/* biome-ignore lint/correctness/useUniqueElementIds: MapLibre layer ID, not a DOM ID */}
        <Layer
          id="selected-shelter-halo"
          type="circle"
          source={SOURCE_ID}
          filter={selectedFilter}
          paint={{
            ...SHELTER_COLOR,
            'circle-radius': 19,
            'circle-opacity': 0.25,
            'circle-blur': 0.15,
            'circle-translate': [0, -18],
          }}
        />
        <Layer
          id={SHELTER_INTERACTIVE_LAYER_ID}
          type="symbol"
          source={SOURCE_ID}
          layout={{
            ...SHELTER_ICON,
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-size': [
              'case',
              ['==', ['get', 'id'], selectedShelterId ?? ''],
              1.25,
              1,
            ],
          }}
        />
      </Source>
    </>
  );
}
