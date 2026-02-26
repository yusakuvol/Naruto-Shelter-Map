/**
 * 経路案内URLを生成するユーティリティ関数
 *
 * Google MapsとApple Mapsへのディープリンクを生成します
 */

export interface NavigationCoordinates {
  latitude: number;
  longitude: number;
}

export type MapProvider = 'google' | 'apple';

/**
 * デバイスのプラットフォームを判定
 */
export function detectPlatform(): MapProvider {
  if (typeof window === 'undefined') {
    return 'google';
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS =
    /iphone|ipad|ipod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  return isIOS ? 'apple' : 'google';
}

/**
 * Google MapsのURL生成
 *
 * @param destination 目的地の座標
 * @param travelMode 移動手段（walking: 徒歩, driving: 車）
 * @returns Google Maps URL
 */
export function generateGoogleMapsURL(
  destination: NavigationCoordinates,
  travelMode: 'walking' | 'driving' = 'walking'
): string {
  const { latitude, longitude } = destination;
  const baseURL = 'https://www.google.com/maps/dir/?api=1';
  const params = new URLSearchParams({
    destination: `${latitude},${longitude}`,
    travelmode: travelMode,
  });

  return `${baseURL}&${params.toString()}`;
}

/**
 * Apple MapsのURL生成
 *
 * @param destination 目的地の座標
 * @returns Apple Maps URL
 */
export function generateAppleMapsURL(
  destination: NavigationCoordinates
): string {
  const { latitude, longitude } = destination;
  return `maps://?daddr=${latitude},${longitude}`;
}

/**
 * プラットフォームに応じた経路案内URLを生成
 *
 * @param destination 目的地の座標
 * @param provider マッププロバイダー（省略時は自動判定）
 * @param travelMode 移動手段（Google Mapsのみ有効）
 * @returns 経路案内URL
 */
export function generateNavigationURL(
  destination: NavigationCoordinates,
  provider?: MapProvider,
  travelMode: 'walking' | 'driving' = 'walking'
): string {
  const mapProvider = provider ?? detectPlatform();

  if (mapProvider === 'apple') {
    return generateAppleMapsURL(destination);
  }

  return generateGoogleMapsURL(destination, travelMode);
}

/**
 * 距離（メートル）から徒歩での所要時間を推定
 *
 * @param distanceInMeters 距離（メートル）
 * @returns 所要時間（分）
 */
export function estimateWalkingTime(distanceInMeters: number): number {
  const WALKING_SPEED_KM_PER_HOUR = 4; // 徒歩速度: 4km/h
  const distanceInKm = distanceInMeters / 1000;
  const timeInHours = distanceInKm / WALKING_SPEED_KM_PER_HOUR;
  return Math.round(timeInHours * 60); // 分単位に変換
}

/**
 * 距離（メートル）から車での所要時間を推定
 *
 * @param distanceInMeters 距離（メートル）
 * @returns 所要時間（分）
 */
export function estimateDrivingTime(distanceInMeters: number): number {
  const DRIVING_SPEED_KM_PER_HOUR = 30; // 市街地平均速度: 30km/h
  const distanceInKm = distanceInMeters / 1000;
  const timeInHours = distanceInKm / DRIVING_SPEED_KM_PER_HOUR;
  return Math.round(timeInHours * 60); // 分単位に変換
}

/**
 * 所要時間を読みやすい形式でフォーマット
 *
 * @param minutes 所要時間（分）
 * @returns フォーマットされた文字列（例: "15分", "1時間30分"）
 */
export function formatTravelTime(minutes: number): string {
  if (minutes <= 0) {
    return '1分未満';
  }

  if (minutes < 60) {
    return `${minutes}分`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}時間`;
  }

  return `${hours}時間${remainingMinutes}分`;
}
