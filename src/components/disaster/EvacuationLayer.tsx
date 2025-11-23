'use client';

import type { FeatureCollection } from 'geojson';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { useEffect } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import type { EvacuationInfo } from '@/types/disaster';
import { EVACUATION_LEVEL_COLORS } from '@/types/disaster';

interface EvacuationLayerProps {
  evacuationInfo: EvacuationInfo[];
}

/**
 * 避難情報を地図上に表示するレイヤーコンポーネント
 *
 * MapLibre GL JSのSourceとLayerを使用して、避難情報エリアをポリゴンとして表示します。
 */
export function EvacuationLayer({
  evacuationInfo,
}: EvacuationLayerProps): null {
  const mapRef = useMap();

  useEffect(() => {
    if (!mapRef.current || evacuationInfo.length === 0) return;

    const map = mapRef.current as unknown as MapLibreMap;

    // GeoJSON FeatureCollectionを作成
    const features = evacuationInfo
      .filter(
        (
          info
        ): info is EvacuationInfo & {
          geometry: NonNullable<EvacuationInfo['geometry']>;
        } => info.geometry !== undefined && info.geometry !== null
      ) // ジオメトリがあるもののみ
      .map((info) => ({
        type: 'Feature' as const,
        geometry: info.geometry,
        properties: {
          level: info.level,
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
    if (map.getSource('evacuation-areas')) {
      if (map.getLayer('evacuation-fill')) {
        map.removeLayer('evacuation-fill');
      }
      if (map.getLayer('evacuation-outline')) {
        map.removeLayer('evacuation-outline');
      }
      map.removeSource('evacuation-areas');
    }

    // ソースを追加
    map.addSource('evacuation-areas', {
      type: 'geojson',
      data: geojson,
    });

    // 塗りつぶしレイヤーを追加
    map.addLayer({
      id: 'evacuation-fill',
      type: 'fill',
      source: 'evacuation-areas',
      paint: {
        'fill-color': [
          'match',
          ['get', 'level'],
          5,
          EVACUATION_LEVEL_COLORS[5], // レベル5: 黒
          4,
          EVACUATION_LEVEL_COLORS[4], // レベル4: 紫
          3,
          EVACUATION_LEVEL_COLORS[3], // レベル3: 赤
          2,
          EVACUATION_LEVEL_COLORS[2], // レベル2: 青
          1,
          EVACUATION_LEVEL_COLORS[1], // レベル1: グレー
          '#6B7280', // デフォルト: グレー
        ],
        'fill-opacity': 0.3,
      },
    });

    // アウトライン（輪郭）レイヤーを追加
    map.addLayer({
      id: 'evacuation-outline',
      type: 'line',
      source: 'evacuation-areas',
      paint: {
        'line-color': [
          'match',
          ['get', 'level'],
          5,
          EVACUATION_LEVEL_COLORS[5],
          4,
          EVACUATION_LEVEL_COLORS[4],
          3,
          EVACUATION_LEVEL_COLORS[3],
          2,
          EVACUATION_LEVEL_COLORS[2],
          1,
          EVACUATION_LEVEL_COLORS[1],
          '#6B7280',
        ],
        'line-width': 2,
        'line-opacity': 0.8,
      },
    });

    // クリーンアップ関数
    return () => {
      const cleanupMap = (mapRef.current as unknown as MapLibreMap) || null;
      if (!cleanupMap) return;

      if (cleanupMap.getLayer('evacuation-fill')) {
        cleanupMap.removeLayer('evacuation-fill');
      }
      if (cleanupMap.getLayer('evacuation-outline')) {
        cleanupMap.removeLayer('evacuation-outline');
      }
      if (cleanupMap.getSource('evacuation-areas')) {
        cleanupMap.removeSource('evacuation-areas');
      }
    };
  }, [mapRef, evacuationInfo]);

  return null;
}
