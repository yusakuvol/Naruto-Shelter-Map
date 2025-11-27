'use client';

import type { FeatureCollection } from 'geojson';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { useEffect } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import type { RiverWaterLevelInfo } from '@/types/disaster';
import { RIVER_WATER_LEVEL_COLORS } from '@/types/disaster';

interface RiverWaterLevelLayerProps {
  waterLevels: RiverWaterLevelInfo[];
}

/**
 * 河川水位情報を地図上に表示するレイヤーコンポーネント
 *
 * MapLibre GL JSのSourceとLayerを使用して、河川ラインと水位レベルを表示します。
 */
export function RiverWaterLevelLayer({
  waterLevels,
}: RiverWaterLevelLayerProps): null {
  const mapRef = useMap();

  useEffect(() => {
    if (!mapRef.current || waterLevels.length === 0) return;

    const map = mapRef.current as unknown as MapLibreMap;

    // GeoJSON FeatureCollectionを作成
    const features = waterLevels
      .filter(
        (
          info
        ): info is RiverWaterLevelInfo & {
          geometry: NonNullable<RiverWaterLevelInfo['geometry']>;
        } => info.geometry !== undefined && info.geometry !== null
      ) // ジオメトリがあるもののみ
      .map((info) => ({
        type: 'Feature' as const,
        geometry: info.geometry,
        properties: {
          riverName: info.riverName,
          observationPoint: info.observationPoint,
          currentLevel: info.currentLevel,
          warningLevel: info.warningLevel,
          dangerLevel: info.dangerLevel,
          level: info.level,
        },
      }));

    if (features.length === 0) return;

    const geojson: FeatureCollection = {
      type: 'FeatureCollection',
      features: features as FeatureCollection['features'],
    };

    // 既存のソースとレイヤーを削除（再描画時）
    if (map.getSource('river-water-levels')) {
      if (map.getLayer('river-line')) {
        map.removeLayer('river-line');
      }
      if (map.getLayer('river-markers')) {
        map.removeLayer('river-markers');
      }
      map.removeSource('river-water-levels');
    }

    // ソースを追加
    map.addSource('river-water-levels', {
      type: 'geojson',
      data: geojson,
    });

    // 河川ラインを追加
    map.addLayer({
      id: 'river-line',
      type: 'line',
      source: 'river-water-levels',
      paint: {
        'line-color': [
          'match',
          ['get', 'level'],
          4,
          RIVER_WATER_LEVEL_COLORS[4], // レベル4: 赤
          3,
          RIVER_WATER_LEVEL_COLORS[3], // レベル3: オレンジ
          2,
          RIVER_WATER_LEVEL_COLORS[2], // レベル2: 黄色
          1,
          RIVER_WATER_LEVEL_COLORS[1], // レベル1: グレー
          '#6B7280', // デフォルト: グレー
        ],
        'line-width': [
          'match',
          ['get', 'level'],
          4,
          4, // レベル4: 太め
          3,
          3, // レベル3: 中
          2,
          2, // レベル2: 細め
          1,
          1, // レベル1: 細い
          1, // デフォルト
        ],
        'line-opacity': 0.8,
      },
    });

    // クリーンアップ関数
    return () => {
      const cleanupMap = (mapRef.current as unknown as MapLibreMap) || null;
      if (!cleanupMap) return;

      if (cleanupMap.getLayer('river-line')) {
        cleanupMap.removeLayer('river-line');
      }
      if (cleanupMap.getLayer('river-markers')) {
        cleanupMap.removeLayer('river-markers');
      }
      if (cleanupMap.getSource('river-water-levels')) {
        cleanupMap.removeSource('river-water-levels');
      }
    };
  }, [mapRef, waterLevels]);

  return null;
}
