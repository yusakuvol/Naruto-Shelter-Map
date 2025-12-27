/**
 * 避難所の種別
 */
export type ShelterType = '指定避難所' | '緊急避難場所' | '両方';

/**
 * 災害種別
 */
export type DisasterType = '洪水' | '津波' | '土砂災害' | '地震' | '火災';

/**
 * 設備情報
 */
export interface Facilities {
  toilet?: boolean;
  water?: boolean;
  electricity?: boolean;
  heating?: boolean;
  airConditioning?: boolean;
  wifi?: boolean;
}

/**
 * バリアフリー情報
 */
export interface Accessibility {
  wheelchairAccessible?: boolean;
  elevator?: boolean;
  multipurposeToilet?: boolean;
  brailleBlocks?: boolean;
  signLanguageSupport?: boolean;
}

/**
 * ペット情報
 */
export interface PetPolicy {
  allowed?: boolean;
  separateArea?: boolean;
  notes?: string;
}

/**
 * 開設状況
 */
export interface OperationStatus {
  isOpen?: boolean;
  lastUpdated?: string;
  notes?: string;
}

/**
 * 避難所情報
 */
export interface Shelter {
  id: string;
  name: string;
  type: ShelterType;
  address: string;
  coordinates: [number, number]; // [経度, 緯度]
  disasterTypes: DisasterType[];
  capacity?: number;
  contact?: string;
  source: string;
  updatedAt: string;
  // 地域情報（隣接地域対応）
  regionId?: string; // 地域ID（'naruto', 'aizumi', 'kitajima', 'matsushige', 'itano'）
  regionName?: string; // 地域名（表示用）
  // 拡張情報（Phase 8.3）
  facilities?: Facilities;
  accessibility?: Accessibility;
  pets?: PetPolicy;
  operationStatus?: OperationStatus;
  photos?: string[];
}

/**
 * GeoJSON Feature型
 */
export interface ShelterFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: Omit<Shelter, 'coordinates'>;
}

/**
 * GeoJSON FeatureCollection型
 */
export interface ShelterGeoJSON {
  type: 'FeatureCollection';
  features: ShelterFeature[];
}
