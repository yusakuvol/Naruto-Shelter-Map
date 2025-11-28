'use client';

import type { FeatureCollection } from 'geojson';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { useEffect } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import type { HazardMapInfo } from '@/types/disaster';
import { HAZARD_MAP_COLORS } from '@/types/disaster';

interface HazardMapLayerProps {
  hazardMaps: HazardMapInfo[];
  enabled?: boolean;
}

/**
 * ハザードマップを地図上に表示するレイヤーコンポーネント
 *
 * MapLibre GL JSのSourceとLayerを使用して、ハザードマップエリアをポリゴンとして表示します。
 * 各ハザードマップ種別（洪水、土砂災害、津波、地震）ごとに異なる色で表示します。
 */
export function HazardMapLayer({
  hazardMaps,
  enabled = true,
}: HazardMapLayerProps): null {
  const mapRef = useMap();

  useEffect(() => {
    if (!mapRef.current || !enabled || hazardMaps.length === 0) return;

    const map = mapRef.current as unknown as MapLibreMap;

    // GeoJSON FeatureCollectionを作成
    const features = hazardMaps
      .filter(
        (
          info
        ): info is HazardMapInfo & {
          geometry: NonNullable<HazardMapInfo['geometry']>;
        } => info.geometry !== undefined && info.geometry !== null
      ) // ジオメトリがあるもののみ
      .map((info) => ({
        type: 'Feature' as const,
        geometry: info.geometry,
        properties: {
          type: info.type,
          name: info.name,
          description: info.description,
          areaName: info.areaName,
        },
      }));

    if (features.length === 0) return;

    const geojson: FeatureCollection = {
      type: 'FeatureCollection',
      features: features as FeatureCollection['features'],
    };

    // 既存のソースとレイヤーを削除（再描画時）
    if (map.getSource('hazard-maps')) {
      if (map.getLayer('hazard-map-fill')) {
        map.removeLayer('hazard-map-fill');
      }
      if (map.getLayer('hazard-map-outline')) {
        map.removeLayer('hazard-map-outline');
      }
      map.removeSource('hazard-maps');
    }

    // ソースを追加
    map.addSource('hazard-maps', {
      type: 'geojson',
      data: geojson,
    });

    // 塗りつぶしレイヤーを追加
    map.addLayer({
      id: 'hazard-map-fill',
      type: 'fill',
      source: 'hazard-maps',
      paint: {
        'fill-color': [
          'match',
          ['get', 'type'],
          'flood',
          HAZARD_MAP_COLORS.flood, // 青: 洪水
          'sediment',
          HAZARD_MAP_COLORS.sediment, // オレンジ: 土砂災害
          'tsunami',
          HAZARD_MAP_COLORS.tsunami, // 緑: 津波
          'earthquake',
          HAZARD_MAP_COLORS.earthquake, // 赤: 地震
          '#6B7280', // デフォルト: グレー
        ],
        'fill-opacity': 0.2, // 半透明で表示（他の情報と重ならないように）
      },
    });

    // アウトライン（輪郭）レイヤーを追加
    map.addLayer({
      id: 'hazard-map-outline',
      type: 'line',
      source: 'hazard-maps',
      paint: {
        'line-color': [
          'match',
          ['get', 'type'],
          'flood',
          HAZARD_MAP_COLORS.flood,
          'sediment',
          HAZARD_MAP_COLORS.sediment,
          'tsunami',
          HAZARD_MAP_COLORS.tsunami,
          'earthquake',
          HAZARD_MAP_COLORS.earthquake,
          '#6B7280',
        ],
        'line-width': 2,
        'line-opacity': 0.6,
      },
    });

    // クリーンアップ関数
    return () => {
      const cleanupMap = (mapRef.current as unknown as MapLibreMap) || null;
      if (!cleanupMap) return;

      if (cleanupMap.getLayer('hazard-map-fill')) {
        cleanupMap.removeLayer('hazard-map-fill');
      }
      if (cleanupMap.getLayer('hazard-map-outline')) {
        cleanupMap.removeLayer('hazard-map-outline');
      }
      if (cleanupMap.getSource('hazard-maps')) {
        cleanupMap.removeSource('hazard-maps');
      }
    };
  }, [mapRef, hazardMaps, enabled]);

  return null;
}
