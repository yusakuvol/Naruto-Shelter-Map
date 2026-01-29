import { describe, expect, it } from 'vitest';
import {
  calculateBearing,
  calculateDistance,
  formatDistance,
  getCompassDirection,
  getJapaneseDirection,
  toCoordinates,
} from './geo';

describe('calculateDistance', () => {
  it('鳴門市から徳島市への距離を計算（約12km）', () => {
    const naruto = { latitude: 34.173, longitude: 134.609 };
    const tokushima = { latitude: 34.065, longitude: 134.559 };
    const distance = calculateDistance(naruto, tokushima);
    // 約12.5km（±1km の許容誤差）
    expect(distance).toBeGreaterThan(11);
    expect(distance).toBeLessThan(14);
  });

  it('同じ地点の距離は0', () => {
    const point = { latitude: 34.173, longitude: 134.609 };
    expect(calculateDistance(point, point)).toBe(0);
  });

  it('東京から大阪への距離を計算（約400km）', () => {
    const tokyo = { latitude: 35.6762, longitude: 139.6503 };
    const osaka = { latitude: 34.6937, longitude: 135.5023 };
    const distance = calculateDistance(tokyo, osaka);
    // 約395km（±20km の許容誤差）
    expect(distance).toBeGreaterThan(375);
    expect(distance).toBeLessThan(415);
  });

  it('赤道上の距離計算', () => {
    const pointA = { latitude: 0, longitude: 0 };
    const pointB = { latitude: 0, longitude: 1 };
    const distance = calculateDistance(pointA, pointB);
    // 赤道上の経度1度は約111km
    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(120);
  });

  it('極端な緯度での計算', () => {
    const north = { latitude: 89, longitude: 0 };
    const south = { latitude: -89, longitude: 0 };
    const distance = calculateDistance(north, south);
    // 約20,000km（地球の半周）
    expect(distance).toBeGreaterThan(19000);
    expect(distance).toBeLessThan(21000);
  });
});

describe('formatDistance', () => {
  it('1km未満はメートル表示', () => {
    expect(formatDistance(0.5)).toBe('500m');
    expect(formatDistance(0.1)).toBe('100m');
    expect(formatDistance(0.85)).toBe('850m');
  });

  it('1-10kmは小数点1桁表示', () => {
    expect(formatDistance(1.234)).toBe('1.2km');
    expect(formatDistance(5.678)).toBe('5.7km');
    expect(formatDistance(9.999)).toBe('10.0km');
  });

  it('10km以上は整数表示', () => {
    expect(formatDistance(10.5)).toBe('11km');
    expect(formatDistance(25.3)).toBe('25km');
    expect(formatDistance(100.9)).toBe('101km');
  });

  it('0kmの場合', () => {
    expect(formatDistance(0)).toBe('0m');
  });
});

describe('toCoordinates', () => {
  it('GeoJSON座標をCoordinatesに変換', () => {
    const geojsonCoords: [number, number] = [134.609, 34.173]; // [lng, lat]
    const result = toCoordinates(geojsonCoords);
    expect(result.longitude).toBe(134.609);
    expect(result.latitude).toBe(34.173);
  });

  it('負の座標も正しく変換', () => {
    const geojsonCoords: [number, number] = [-122.4194, 37.7749]; // サンフランシスコ
    const result = toCoordinates(geojsonCoords);
    expect(result.longitude).toBe(-122.4194);
    expect(result.latitude).toBe(37.7749);
  });
});

describe('calculateBearing', () => {
  it('真北への方位は0度', () => {
    const from = { latitude: 34.0, longitude: 134.0 };
    const to = { latitude: 35.0, longitude: 134.0 };
    const bearing = calculateBearing(from, to);
    expect(bearing).toBeCloseTo(0, 0);
  });

  it('真東への方位は約90度', () => {
    const from = { latitude: 34.0, longitude: 134.0 };
    const to = { latitude: 34.0, longitude: 135.0 };
    const bearing = calculateBearing(from, to);
    expect(bearing).toBeGreaterThan(85);
    expect(bearing).toBeLessThan(95);
  });

  it('真南への方位は180度', () => {
    const from = { latitude: 35.0, longitude: 134.0 };
    const to = { latitude: 34.0, longitude: 134.0 };
    const bearing = calculateBearing(from, to);
    expect(bearing).toBeCloseTo(180, 0);
  });

  it('真西への方位は約270度', () => {
    const from = { latitude: 34.0, longitude: 135.0 };
    const to = { latitude: 34.0, longitude: 134.0 };
    const bearing = calculateBearing(from, to);
    expect(bearing).toBeGreaterThan(265);
    expect(bearing).toBeLessThan(275);
  });

  it('結果は0-360度の範囲', () => {
    const from = { latitude: 34.173, longitude: 134.609 };
    const to = { latitude: 34.065, longitude: 134.559 };
    const bearing = calculateBearing(from, to);
    expect(bearing).toBeGreaterThanOrEqual(0);
    expect(bearing).toBeLessThan(360);
  });
});

describe('getCompassDirection', () => {
  it('0度は北（N）', () => {
    expect(getCompassDirection(0)).toBe('N');
  });

  it('45度は北東（NE）', () => {
    expect(getCompassDirection(45)).toBe('NE');
  });

  it('90度は東（E）', () => {
    expect(getCompassDirection(90)).toBe('E');
  });

  it('135度は南東（SE）', () => {
    expect(getCompassDirection(135)).toBe('SE');
  });

  it('180度は南（S）', () => {
    expect(getCompassDirection(180)).toBe('S');
  });

  it('225度は南西（SW）', () => {
    expect(getCompassDirection(225)).toBe('SW');
  });

  it('270度は西（W）', () => {
    expect(getCompassDirection(270)).toBe('W');
  });

  it('315度は北西（NW）', () => {
    expect(getCompassDirection(315)).toBe('NW');
  });

  it('360度は北（N）に戻る', () => {
    expect(getCompassDirection(360)).toBe('N');
  });

  it('境界値のテスト（22.5度付近）', () => {
    expect(getCompassDirection(22)).toBe('N');
    expect(getCompassDirection(23)).toBe('NE');
  });
});

describe('getJapaneseDirection', () => {
  it('各方位を日本語に変換', () => {
    expect(getJapaneseDirection('N')).toBe('北');
    expect(getJapaneseDirection('NE')).toBe('北東');
    expect(getJapaneseDirection('E')).toBe('東');
    expect(getJapaneseDirection('SE')).toBe('南東');
    expect(getJapaneseDirection('S')).toBe('南');
    expect(getJapaneseDirection('SW')).toBe('南西');
    expect(getJapaneseDirection('W')).toBe('西');
    expect(getJapaneseDirection('NW')).toBe('北西');
  });

  it('未知の方位はそのまま返す', () => {
    expect(getJapaneseDirection('UNKNOWN')).toBe('UNKNOWN');
    expect(getJapaneseDirection('')).toBe('');
  });
});
