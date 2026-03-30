import { useEffect } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import type { Coordinates } from '@/hooks/useGeolocation';

interface LocationControllerProps {
  position?: Coordinates | null;
}

/**
 * 現在地を取得したら地図を移動する内部コンポーネント
 */
export function LocationController({
  position,
}: LocationControllerProps): null {
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
