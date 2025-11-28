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
 * 利用可能な地図スタイル一覧（標準のみ）
 */
export const MAP_STYLES: Record<MapStyleType, MapStyle> = {
  standard: {
    id: 'standard',
    name: '標準',
    url: 'https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json',
  },
};

/**
 * LocalStorageキー
 */
export const MAP_STYLE_STORAGE_KEY = 'naruto-shelter-map-style';
