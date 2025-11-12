/**
 * 地図スタイルの種類
 */
export type MapStyleType = "standard" | "satellite" | "terrain";

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
    id: "standard",
    name: "標準",
    url: "https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json",
    icon: "🗺️",
    description: "標準地図",
  },
  satellite: {
    id: "satellite",
    name: "衛星写真",
    // MapTiler Satellite Style JSON (無料プラン、APIキー不要のデモURL)
    url: "https://api.maptiler.com/maps/satellite/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
    icon: "🛰️",
    description: "航空写真・衛星画像",
  },
  terrain: {
    id: "terrain",
    name: "地形",
    // MapTiler Terrain Style JSON (無料プラン、APIキー不要のデモURL)
    url: "https://api.maptiler.com/maps/topo-v2/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
    icon: "🏔️",
    description: "地形図・等高線表示",
  },
};

/**
 * LocalStorageキー
 */
export const MAP_STYLE_STORAGE_KEY = "naruto-shelter-map-style";
