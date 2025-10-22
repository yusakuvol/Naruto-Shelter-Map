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
export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): number {
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
