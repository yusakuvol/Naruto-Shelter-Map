/**
 * 地理計算ユーティリティ
 *
 * 2点間の距離計算や座標変換など、地理情報に関する計算を提供します。
 */

/**
 * 座標を表す型
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Haversine公式を使用して2点間の距離を計算します
 *
 * @param from 開始地点の座標
 * @param to 終了地点の座標
 * @returns 距離（キロメートル）
 *
 * @example
 * ```ts
 * const distance = calculateDistance(
 *   { latitude: 34.173, longitude: 134.609 }, // 鳴門市
 *   { latitude: 34.065, longitude: 134.559 }  // 徳島市
 * );
 * console.log(distance); // 約12.5km
 * ```
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371; // 地球の半径 (km)

  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * 度数をラジアンに変換します
 *
 * @param degrees 度数
 * @returns ラジアン
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * ラジアンを度数に変換します
 *
 * @param radians ラジアン
 * @returns 度数
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * 距離を人間が読みやすい形式にフォーマットします
 *
 * @param distanceKm 距離（キロメートル）
 * @returns フォーマットされた距離文字列
 *
 * @example
 * ```ts
 * formatDistance(0.5);   // "500m"
 * formatDistance(1.234); // "1.2km"
 * formatDistance(12.5);  // "13km"
 * ```
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  }

  return `${Math.round(distanceKm)}km`;
}

/**
 * GeoJSON座標配列からCoordinatesオブジェクトに変換します
 *
 * @param coordinates GeoJSON座標配列 [longitude, latitude]
 * @returns Coordinatesオブジェクト
 */
export function toCoordinates(coordinates: [number, number]): Coordinates {
  return {
    longitude: coordinates[0],
    latitude: coordinates[1],
  };
}

/**
 * 2点間の方位角（bearing）を計算します
 *
 * @param from 開始地点の座標
 * @param to 終了地点の座標
 * @returns 方位角（度数、0-360）。北が0度、東が90度、南が180度、西が270度
 *
 * @example
 * ```ts
 * const bearing = calculateBearing(
 *   { latitude: 34.173, longitude: 134.609 }, // 鳴門市
 *   { latitude: 34.065, longitude: 134.559 }  // 徳島市（南西方向）
 * );
 * console.log(bearing); // 約220度（南西）
 * ```
 */
export function calculateBearing(from: Coordinates, to: Coordinates): number {
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const dLon = toRadians(to.longitude - from.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360; // 0-360度に正規化
}

/**
 * 方位角から8方位の名前を取得します
 *
 * @param bearing 方位角（度数、0-360）
 * @returns 8方位の名前（N, NE, E, SE, S, SW, W, NW）
 *
 * @example
 * ```ts
 * getCompassDirection(0);    // "N" (北)
 * getCompassDirection(45);   // "NE" (北東)
 * getCompassDirection(90);   // "E" (東)
 * getCompassDirection(225);  // "SW" (南西)
 * ```
 */
export function getCompassDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
  const index = Math.round(bearing / 45) % 8;
  return directions[index] as string;
}

/**
 * 8方位の英語名から日本語名に変換します
 *
 * @param direction 8方位の英語名（N, NE, E, SE, S, SW, W, NW）
 * @returns 日本語の方位名
 *
 * @example
 * ```ts
 * getJapaneseDirection('N');   // "北"
 * getJapaneseDirection('NE');  // "北東"
 * getJapaneseDirection('SW');  // "南西"
 * ```
 */
export function getJapaneseDirection(direction: string): string {
  const directionMap: Record<string, string> = {
    N: '北',
    NE: '北東',
    E: '東',
    SE: '南東',
    S: '南',
    SW: '南西',
    W: '西',
    NW: '北西',
  };
  return directionMap[direction] || direction;
}
