/**
 * 災害情報関連の型定義
 */

/**
 * 気象警報・注意報の種類
 */
export type WeatherWarningType =
  | '大雨'
  | '洪水'
  | '暴風'
  | '高潮'
  | '波浪'
  | '大雪'
  | '暴風雪'
  | '雷'
  | '濃霧'
  | '乾燥'
  | 'なだれ'
  | '低温'
  | '霜'
  | '着氷'
  | '着雪'
  | '融雪'
  | '少雨'
  | '日照不足'
  | '霜注意報';

/**
 * 警報レベル
 */
export type WarningLevel = 'warning' | 'advisory' | 'none';

/**
 * 気象警報・注意報
 */
export interface WeatherWarning {
  code: string;
  name: WeatherWarningType;
  level: WarningLevel;
  status: '発表' | '継続' | '解除';
  publishedAt: string;
}

/**
 * 地域の気象情報
 */
export interface WeatherInfo {
  areaCode: string;
  areaName: string;
  warnings: WeatherWarning[];
  updatedAt: string;
}

/**
 * 避難レベル
 */
export type EvacuationLevel = 1 | 2 | 3 | 4 | 5;

/**
 * 避難情報の種類
 */
export interface EvacuationInfo {
  level: EvacuationLevel;
  name: string;
  description: string;
  areaCode: string;
  areaName: string;
  publishedAt: string;
  updatedAt: string;
  geometry?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
}

/**
 * 避難レベルと色のマッピング
 */
export const EVACUATION_LEVEL_COLORS: Record<EvacuationLevel, string> = {
  1: '#6B7280', // グレー: 準備情報
  2: '#3B82F6', // 青: 避難準備・高齢者等避難開始
  3: '#EF4444', // 赤: 高齢者等避難
  4: '#9333EA', // 紫: 避難指示
  5: '#000000', // 黒: 緊急安全確保
};

/**
 * 避難レベルの説明
 */
export const EVACUATION_LEVEL_DESCRIPTIONS: Record<EvacuationLevel, string> = {
  1: '準備情報',
  2: '避難準備・高齢者等避難開始',
  3: '高齢者等避難',
  4: '避難指示',
  5: '緊急安全確保',
};

/**
 * 河川水位レベル
 */
export type RiverWaterLevel = 1 | 2 | 3 | 4;

/**
 * 河川水位情報
 */
export interface RiverWaterLevelInfo {
  riverName: string;
  observationPoint: string;
  currentLevel: number; // 現在の水位（m）
  warningLevel: number; // 氾濫注意水位（m）
  dangerLevel: number; // 氾濫危険水位（m）
  level: RiverWaterLevel; // 水位レベル（1-4）
  updatedAt: string;
  coordinates?: [number, number]; // [経度, 緯度]
  geometry?: {
    type: 'LineString' | 'MultiLineString';
    coordinates: number[][] | number[][][];
  };
}

/**
 * 河川水位レベルと色のマッピング
 */
export const RIVER_WATER_LEVEL_COLORS: Record<RiverWaterLevel, string> = {
  1: '#6B7280', // グレー: 通常（水防団待機水位）
  2: '#FCD34D', // 黄色: 氾濫注意水位
  3: '#FB923C', // オレンジ: 避難判断水位
  4: '#EF4444', // 赤: 氾濫危険水位
};

/**
 * 河川水位レベルの説明
 */
export const RIVER_WATER_LEVEL_DESCRIPTIONS: Record<RiverWaterLevel, string> = {
  1: '通常（水防団待機水位）',
  2: '氾濫注意水位',
  3: '避難判断水位',
  4: '氾濫危険水位',
};
