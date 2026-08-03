import { layers, namedFlavor } from '@protomaps/basemaps';
import type { StyleSpecification } from 'maplibre-gl';

/**
 * オフライン地図スタイルの設定
 *
 * 同梱した PMTiles（対象5市町のベクタータイル）とフォント・スプライトを
 * 参照するスタイルを生成します。すべてのリソースが precache されるため、
 * 初回インストール直後からオフラインで地図を表示できます。
 */

/** 同梱ベースマップ（PMTiles）のパス */
export const BASEMAP_PMTILES_PATH = '/map/basemap.pmtiles';

/**
 * 防災時の位置把握と経路確認に必要なレイヤーだけを残す。
 * POI・住所・装飾的な土地利用などを初期スタイルから除外し、
 * MapLibreのスタイル評価とシンボル配置を軽量化する。
 */
const ESSENTIAL_BASEMAP_LAYER_IDS = new Set([
  'background',
  'earth',
  'landuse_park',
  'landuse_hospital',
  'landuse_school',
  'landuse_aerodrome',
  'roads_runway',
  'roads_taxiway',
  'landuse_runway',
  'water',
  'water_stream',
  'water_river',
  'roads_tunnels_minor',
  'roads_tunnels_link',
  'roads_tunnels_major',
  'roads_tunnels_highway',
  'buildings',
  'roads_minor_casing',
  'roads_link_casing',
  'roads_major_casing_late',
  'roads_highway_casing_late',
  'roads_other',
  'roads_link',
  'roads_minor_service',
  'roads_minor',
  'roads_major',
  'roads_highway',
  'roads_rail',
  'boundaries_country',
  'boundaries',
  'roads_bridges_link_casing',
  'roads_bridges_minor_casing',
  'roads_bridges_major_casing',
  'roads_bridges_highway_casing',
  'roads_bridges_link',
  'roads_bridges_minor',
  'roads_bridges_major',
  'roads_bridges_highway',
  'water_label_ocean',
  'earth_label_islands',
  'water_label_lakes',
  'roads_shields',
  'roads_labels_minor',
  'roads_labels_major',
  'places_subplace',
  'places_region',
  'places_locality',
  'places_country',
]);

/** 地図スタイル（Protomaps Light・日本語ラベル）を生成する */
export function createMapStyle(): StyleSpecification {
  // glyphs / sprite はスタイル仕様上、絶対 URL である必要がある
  const origin = window.location.origin;
  return {
    version: 8,
    name: 'Protomaps Light（オフライン同梱）',
    glyphs: `${origin}/map/fonts/{fontstack}/{range}.pbf`,
    sprite: `${origin}/map/sprites/v4/light`,
    sources: {
      protomaps: {
        type: 'vector',
        url: `pmtiles://${origin}${BASEMAP_PMTILES_PATH}`,
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: layers('protomaps', namedFlavor('light'), { lang: 'ja' }).filter(
      (layer) => ESSENTIAL_BASEMAP_LAYER_IDS.has(layer.id)
    ),
  };
}
