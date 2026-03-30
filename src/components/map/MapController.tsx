import { useEffect } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import type { ShelterFeature } from '@/types/shelter';

interface MapControllerProps {
  selectedShelterId?: string | null | undefined;
  shelters: ShelterFeature[];
}

/**
 * 選択された避難所に地図を滑らかに移動する内部コンポーネント
 */
export function MapController({
  selectedShelterId,
  shelters,
}: MapControllerProps): null {
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
