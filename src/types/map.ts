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
 * 利用可能な地図スタイル一覧（国土地理院標準地図）
 */
export const MAP_STYLES: Record<MapStyleType, MapStyle> = {
  standard: {
    id: 'standard',
    name: '標準',
    // 国土地理院標準地図（ラスタタイル）- 日本語対応、無料、安定
    // カスタムスタイルJSONを使用（public/gsi-raster-style.json）
    url: '/gsi-raster-style.json',
  },
};

/**
 * LocalStorageキー
 */
export const MAP_STYLE_STORAGE_KEY = 'naruto-shelter-map-style';
