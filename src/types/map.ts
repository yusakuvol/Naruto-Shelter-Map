/**
 * 地図スタイルの種類（標準のみ）
 */
export type MapStyleType = 'standard';

/**
 * 地図スタイル設定
 */
export interface MapStyle {
  id: MapStyleType;
  name: string;
  url: string;
}

/**
 * 利用可能な地図スタイル一覧（Vector Tiles対応）
 */
export const MAP_STYLES: Record<MapStyleType, MapStyle> = {
  standard: {
    id: 'standard',
    name: '標準',
    // MapLibre Demo Tiles (Vector Tiles) - 無料、オフラインキャッシュ対応
    url: 'https://demotiles.maplibre.org/style.json',
    // 将来的に国土地理院のベクトルタイルに切り替え可能:
    // url: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.pbf',
  },
};

/**
 * LocalStorageキー
 */
export const MAP_STYLE_STORAGE_KEY = 'naruto-shelter-map-style';
