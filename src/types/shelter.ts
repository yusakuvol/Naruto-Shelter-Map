/**
 * 避難所の種別
 */
export type ShelterType = '指定避難所' | '緊急避難場所' | '両方';

/**
 * 災害種別
 */
export type DisasterType = '洪水' | '津波' | '土砂災害' | '地震' | '火災';

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
  source: string;
  updatedAt: string;
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
