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
    layers: layers('protomaps', namedFlavor('light'), { lang: 'ja' }),
  };
}
