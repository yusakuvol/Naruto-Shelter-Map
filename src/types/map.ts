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
 * 利用可能な地図スタイル一覧（OpenStreetMap）
 */
export const MAP_STYLES: Record<MapStyleType, MapStyle> = {
  standard: {
    id: 'standard',
    name: '標準',
    // OpenStreetMap Japan（ベクタータイル）- 日本語対応、無料、商用利用可能、視認性が高い
    // OpenStreetMap Japanが提供する日本語対応のStyle JSONを使用
    url: 'https://tile.openstreetmap.jp/styles/maptiler-basic-ja/style.json',
  },
};

/**
 * LocalStorageキー
 */
export const MAP_STYLE_STORAGE_KEY = 'naruto-shelter-map-style';
