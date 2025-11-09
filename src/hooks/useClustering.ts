'use client';

import type { BBox } from 'geojson';
import { useMemo } from 'react';
import Supercluster from 'supercluster';
import type { ShelterFeature } from '@/types/shelter';

interface ClusterProperties {
  cluster?: boolean;
  cluster_id?: number;
  point_count?: number;
  point_count_abbreviated?: string;
  shelterId?: string;
  shelterName?: string;
  shelterType?: string;
}

type ClusterFeature = Supercluster.ClusterFeature<ClusterProperties>;
type PointFeature = Supercluster.PointFeature<ClusterProperties>;

interface UseClusteringParams {
  shelters: ShelterFeature[];
  zoom: number;
  bounds: BBox;
  enabled?: boolean;
}

interface UseClusteringReturn {
  clusters: Array<ClusterFeature | PointFeature>;
  supercluster: Supercluster | null;
}

/**
 * マーカークラスタリング管理フック
 *
 * Superclusterを使用して避難所マーカーをクラスタリングします。
 * ズームレベルと表示領域に応じて動的にクラスタを生成します。
 *
 * @param shelters - 避難所データ配列
 * @param zoom - 現在の地図ズームレベル
 * @param bounds - 現在の地図表示領域 [west, south, east, north]
 * @param enabled - クラスタリング有効/無効（デフォルト: true）
 * @returns クラスタ配列とSuperclusterインスタンス
 */
export function useClustering({
  shelters,
  zoom,
  bounds,
  enabled = true,
}: UseClusteringParams): UseClusteringReturn {
  // Superclusterインスタンスをメモ化（sheltersが変更されたときのみ再生成）
  const supercluster = useMemo(() => {
    if (!enabled || shelters.length === 0) return null;

    // Supercluster初期化
    const cluster = new Supercluster<ClusterProperties, ClusterProperties>({
      radius: 60, // クラスタ半径（ピクセル）
      maxZoom: 16, // クラスタリング最大ズーム（これ以上ズームするとクラスタ解除）
      minZoom: 0, // クラスタリング最小ズーム
      minPoints: 2, // クラスタを形成する最小ポイント数
    });

    // 避難所データをSupercluster形式に変換
    const points: Array<PointFeature> = shelters.map((shelter) => ({
      type: 'Feature',
      properties: {
        cluster: false,
        shelterId: shelter.properties.id,
        shelterName: shelter.properties.name,
        shelterType: shelter.properties.type,
      },
      geometry: {
        type: 'Point',
        coordinates: shelter.geometry.coordinates,
      },
    }));

    // データをロード
    cluster.load(points);

    return cluster;
  }, [shelters, enabled]);

  // ズームレベルと表示領域に応じたクラスタを取得（メモ化）
  const clusters = useMemo(() => {
    if (!supercluster) {
      // クラスタリング無効時は元のデータをそのまま返す
      return shelters.map((shelter) => ({
        type: 'Feature' as const,
        properties: {
          cluster: false,
          shelterId: shelter.properties.id,
          shelterName: shelter.properties.name,
          shelterType: shelter.properties.type,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: shelter.geometry.coordinates,
        },
      }));
    }

    // 整数ズームレベルに丸める（Superclusterの要件）
    const intZoom = Math.floor(zoom);

    // 表示領域内のクラスタを取得
    return supercluster.getClusters(bounds, intZoom);
  }, [supercluster, zoom, bounds, shelters]);

  return {
    clusters,
    supercluster,
  };
}
