import type { CircleLayerSpecification } from 'maplibre-gl';
import { Layer, Source } from 'react-map-gl/maplibre';
import type { ShelterGeoJSON } from '@/types/shelter';

const SOURCE_ID = 'shelters';
export const SHELTER_HIT_LAYER_ID = 'shelter-hit-area';

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
    <Source id={SOURCE_ID} type="geojson" data={data}>
      {/* biome-ignore lint/correctness/useUniqueElementIds: MapLibre layer ID, not a DOM ID */}
      <Layer
        id="selected-shelter-halo"
        type="circle"
        source={SOURCE_ID}
        filter={selectedFilter}
        paint={{
          ...SHELTER_COLOR,
          'circle-radius': 17,
          'circle-opacity': 0.25,
          'circle-blur': 0.15,
        }}
      />
      {/* biome-ignore lint/correctness/useUniqueElementIds: MapLibre layer ID, not a DOM ID */}
      <Layer
        id="shelter-marker"
        type="circle"
        source={SOURCE_ID}
        paint={{
          ...SHELTER_COLOR,
          'circle-radius': [
            'case',
            ['==', ['get', 'id'], selectedShelterId ?? ''],
            11,
            9,
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        }}
      />
      {/* biome-ignore lint/correctness/useUniqueElementIds: MapLibre layer ID, not a DOM ID */}
      <Layer
        id="shelter-center-dot"
        type="circle"
        source={SOURCE_ID}
        paint={{ 'circle-color': '#ffffff', 'circle-radius': 3 }}
      />
      <Layer
        id={SHELTER_HIT_LAYER_ID}
        type="circle"
        source={SOURCE_ID}
        paint={{
          'circle-color': 'rgba(0, 0, 0, 0)',
          'circle-radius': 22,
        }}
      />
    </Source>
  );
}
