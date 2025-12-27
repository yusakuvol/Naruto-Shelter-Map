/**
 * 対応地域の設定
 *
 * 鳴門市とその隣接地域を定義します。
 * 市境に住んでいる人のために、隣接地域の避難所も表示します。
 */

export interface Region {
  /** 地域ID（URLなどで使用） */
  id: string;
  /** 地域名（表示用） */
  name: string;
  /** 地域名（検索用、住所に含まれる文字列） */
  searchName: string;
  /** 都道府県 */
  prefecture: string;
  /** 地域の大まかな範囲（緯度・経度） */
  bounds: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
  };
  /** 優先度（数値が小さいほど優先） */
  priority: number;
}

/**
 * 対応地域一覧
 */
export const REGIONS: Region[] = [
  {
    id: 'naruto',
    name: '鳴門市',
    searchName: '鳴門市',
    prefecture: '徳島県',
    bounds: {
      minLng: 134.45,
      maxLng: 134.75,
      minLat: 34.0,
      maxLat: 34.3,
    },
    priority: 1, // メイン地域
  },
  {
    id: 'aizumi',
    name: '藍住町',
    searchName: '藍住町',
    prefecture: '徳島県',
    bounds: {
      minLng: 134.5,
      maxLng: 134.65,
      minLat: 34.1,
      maxLat: 34.2,
    },
    priority: 2,
  },
  {
    id: 'kitajima',
    name: '北島町',
    searchName: '北島町',
    prefecture: '徳島県',
    bounds: {
      minLng: 134.5,
      maxLng: 134.6,
      minLat: 34.1,
      maxLat: 34.15,
    },
    priority: 2,
  },
  {
    id: 'matsushige',
    name: '松茂町',
    searchName: '松茂町',
    prefecture: '徳島県',
    bounds: {
      minLng: 134.55,
      maxLng: 134.65,
      minLat: 34.15,
      maxLat: 34.2,
    },
    priority: 2,
  },
  {
    id: 'itano',
    name: '板野町',
    searchName: '板野町',
    prefecture: '徳島県',
    bounds: {
      minLng: 134.4,
      maxLng: 134.55,
      minLat: 34.1,
      maxLat: 34.2,
    },
    priority: 2,
  },
];

/**
 * デフォルト地域（鳴門市）
 * REGIONSは必ず1つ以上の要素を持つため、安全にアクセス可能
 */
export const DEFAULT_REGION: Region = REGIONS[0] as Region;

/**
 * 地域IDから地域情報を取得
 */
export function getRegionById(id: string): Region | undefined {
  return REGIONS.find((region) => region.id === id);
}

/**
 * 住所から地域を判定
 */
export function detectRegionFromAddress(address: string): Region | undefined {
  const normalizedAddress = address.trim();

  // 優先度順にチェック（より具体的な名前を優先）
  const sortedRegions = [...REGIONS].sort((a, b) => a.priority - b.priority);

  for (const region of sortedRegions) {
    if (normalizedAddress.includes(region.searchName)) {
      return region;
    }
  }

  return undefined;
}

/**
 * 座標から地域を判定（境界付近の判定に使用）
 */
export function detectRegionFromCoordinates(
  coordinates: [number, number]
): Region | undefined {
  const [lng, lat] = coordinates;

  // 境界内に含まれる地域を検索
  for (const region of REGIONS) {
    const { bounds } = region;
    if (
      lng >= bounds.minLng &&
      lng <= bounds.maxLng &&
      lat >= bounds.minLat &&
      lat <= bounds.maxLat
    ) {
      return region;
    }
  }

  return undefined;
}
