import { useEffect, useState } from 'react';
import type { ShelterGeoJSON } from '@/types/shelter';

export function useShelters() {
  const [data, setData] = useState<ShelterGeoJSON | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchShelters() {
      try {
        setIsLoading(true);
        const response = await fetch('/data/shelters.geojson');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const geojson = (await response.json()) as ShelterGeoJSON;
        setData(geojson);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch shelters')
        );
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchShelters();
  }, []);

  return { data, isLoading, error };
}
