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
