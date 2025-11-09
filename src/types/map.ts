/**
 * 地図スタイルの種類
 */
export type MapStyleType = 'standard' | 'satellite' | 'terrain' | 'dark';

/**
 * 地図スタイル設定
 */
export interface MapStyle {
  id: MapStyleType;
  name: string;
  url: string;
  icon: string;
  description: string;
}

/**
 * 利用可能な地図スタイル一覧
 */
export const MAP_STYLES: Record<MapStyleType, MapStyle> = {
  standard: {
    id: 'standard',
    name: '標準',
    url: 'https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json',
    icon: '🗺️',
    description: 'OpenStreetMap標準スタイル（日本語）',
  },
  satellite: {
    id: 'satellite',
    name: '衛星写真',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', // 仮URL（後で調整）
    icon: '🛰️',
    description: '航空写真・衛星画像',
  },
  terrain: {
    id: 'terrain',
    name: '地形',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', // 仮URL（後で調整）
    icon: '🏔️',
    description: '地形図・等高線表示',
  },
  dark: {
    id: 'dark',
    name: 'ダーク',
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', // Stadia Maps Dark
    icon: '🌙',
    description: 'ダークモード用スタイル',
  },
};

/**
 * LocalStorageキー
 */
export const MAP_STYLE_STORAGE_KEY = 'naruto-shelter-map-style';
