#!/usr/bin/env tsx
/**
 * 避難所データの検証スクリプト
 *
 * 用途:
 * - 座標と住所の整合性チェック
 * - 対応地域の範囲外の座標を検出
 * - 住所に「徳島市」が含まれているデータを検出
 * - データの品質チェック
 *
 * 使用方法:
 *   pnpm tsx scripts/validate-shelters.ts [GeoJSONファイルパス]
 *
 * デフォルト: public/data/shelters.geojson
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { detectRegionFromAddress, REGIONS } from '../src/config/regions';

/**
 * 徳島市の大まかな範囲（緯度・経度）
 * 参考: 徳島市の境界座標
 */
const TOKUSHIMA_CITY_BOUNDS = {
  minLng: 134.5, // 西端
  maxLng: 134.6, // 東端
  minLat: 34.0, // 南端
  maxLat: 34.1, // 北端
} as const;

interface ShelterFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    name: string;
    address: string;
    [key: string]: unknown;
  };
}

interface ValidationResult {
  total: number;
  errors: Array<{
    id: string;
    name: string;
    type:
      | 'invalid_address'
      | 'out_of_bounds'
      | 'tokushima_city_in_address'
      | 'coordinates_in_tokushima_city';
    message: string;
    coordinates: [number, number];
    address: string;
  }>;
  warnings: Array<{
    id: string;
    name: string;
    type: 'near_boundary' | 'missing_data';
    message: string;
  }>;
}

/**
 * 座標が対応地域の範囲内かチェック
 */
function isWithinRegions(coordinates: [number, number]): {
  valid: boolean;
  reason?: string;
  region?: string;
} {
  const [lng, lat] = coordinates;

  // 対応地域の範囲をチェック
  for (const region of REGIONS) {
    const { bounds } = region;
    if (
      lng >= bounds.minLng &&
      lng <= bounds.maxLng &&
      lat >= bounds.minLat &&
      lat <= bounds.maxLat
    ) {
      return { valid: true, region: region.name };
    }
  }

  // すべての地域の範囲を計算（最小/最大値）
  const allRegionsBounds = {
    minLng: Math.min(...REGIONS.map((r) => r.bounds.minLng)),
    maxLng: Math.max(...REGIONS.map((r) => r.bounds.maxLng)),
    minLat: Math.min(...REGIONS.map((r) => r.bounds.minLat)),
    maxLat: Math.max(...REGIONS.map((r) => r.bounds.maxLat)),
  };

  return {
    valid: false,
    reason: `座標が対応地域の範囲外: [${lng}, ${lat}] (範囲: 経度 ${allRegionsBounds.minLng} - ${allRegionsBounds.maxLng}, 緯度 ${allRegionsBounds.minLat} - ${allRegionsBounds.maxLat})`,
  };
}

/**
 * 住所に「徳島市」が含まれているかチェック
 */
function containsTokushimaCity(address: string): boolean {
  return address.includes('徳島市') && !address.includes('徳島県');
}

/**
 * 座標が徳島市の範囲内かチェック
 */
function isWithinTokushimaCity(coordinates: [number, number]): boolean {
  const [lng, lat] = coordinates;
  return (
    lng >= TOKUSHIMA_CITY_BOUNDS.minLng &&
    lng <= TOKUSHIMA_CITY_BOUNDS.maxLng &&
    lat >= TOKUSHIMA_CITY_BOUNDS.minLat &&
    lat <= TOKUSHIMA_CITY_BOUNDS.maxLat
  );
}

/**
 * 座標が境界付近かチェック（警告用）
 */
function isNearBoundary(coordinates: [number, number]): {
  near: boolean;
  reason?: string;
} {
  const [lng, lat] = coordinates;
  const threshold = 0.05; // 約5km

  // すべての地域の境界をチェック
  for (const region of REGIONS) {
    const { bounds } = region;
    if (
      Math.abs(lng - bounds.minLng) < threshold ||
      Math.abs(lng - bounds.maxLng) < threshold ||
      Math.abs(lat - bounds.minLat) < threshold ||
      Math.abs(lat - bounds.maxLat) < threshold
    ) {
      return {
        near: true,
        reason: `${region.name}の境界付近に位置しています。座標を確認してください。`,
      };
    }
  }

  return { near: false };
}

/**
 * 避難所データを検証
 */
function validateShelters(features: ShelterFeature[]): ValidationResult {
  const result: ValidationResult = {
    total: features.length,
    errors: [],
    warnings: [],
  };

  for (const feature of features) {
    const { id, name, address } = feature.properties;
    const coordinates = feature.geometry.coordinates;

    // エラーチェック

    // 1. 住所に「徳島市」が含まれている
    if (containsTokushimaCity(address)) {
      result.errors.push({
        id,
        name,
        type: 'tokushima_city_in_address',
        message: `住所に「徳島市」が含まれています: ${address}`,
        coordinates,
        address,
      });
    }

    // 2. 座標が対応地域の範囲外
    const boundsCheck = isWithinRegions(coordinates);
    if (!boundsCheck.valid) {
      result.errors.push({
        id,
        name,
        type: 'out_of_bounds',
        message: boundsCheck.reason || '座標が対応地域の範囲外です',
        coordinates,
        address,
      });
    }

    // 3. 住所が対応地域名を含んでいない
    const regionFromAddress = detectRegionFromAddress(address);
    if (!regionFromAddress) {
      const regionNames = REGIONS.map((r) => r.searchName).join('、');
      result.errors.push({
        id,
        name,
        type: 'invalid_address',
        message: `住所に対応地域名（${regionNames}）が含まれていません: ${address}`,
        coordinates,
        address,
      });
    }

    // 4. 座標が徳島市の範囲内（鳴門市の避難所なのに座標が徳島市にある）
    if (isWithinTokushimaCity(coordinates)) {
      result.errors.push({
        id,
        name,
        type: 'coordinates_in_tokushima_city',
        message: `座標が徳島市の範囲内にあります: [${coordinates[0]}, ${coordinates[1]}]`,
        coordinates,
        address,
      });
    }

    // 警告チェック

    // 1. 境界付近
    const boundaryCheck = isNearBoundary(coordinates);
    if (boundaryCheck.near) {
      result.warnings.push({
        id,
        name,
        type: 'near_boundary',
        message: boundaryCheck.reason || '境界付近に位置しています',
      });
    }

    // 2. 必須データの欠損
    if (!name || !address) {
      result.warnings.push({
        id,
        name: name || '(名前なし)',
        type: 'missing_data',
        message: '必須データが欠損しています',
      });
    }
  }

  return result;
}

/**
 * 検証結果を表示
 */
function displayResults(result: ValidationResult): void {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 避難所データ検証結果');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`総件数: ${result.total}件`);
  console.log(`❌ エラー: ${result.errors.length}件`);
  console.log(`⚠️  警告: ${result.warnings.length}件`);
  console.log('');

  if (result.errors.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ エラー一覧');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    for (const error of result.errors) {
      console.log(`[${error.type}] ${error.name} (${error.id})`);
      console.log(`  住所: ${error.address}`);
      console.log(`  座標: [${error.coordinates[0]}, ${error.coordinates[1]}]`);
      console.log(`  問題: ${error.message}`);
      console.log('');
    }
  }

  if (result.warnings.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  警告一覧');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    for (const warning of result.warnings) {
      console.log(`[${warning.type}] ${warning.name} (${warning.id})`);
      console.log(`  内容: ${warning.message}`);
      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log('✅ すべてのデータが正常です！');
  } else if (result.errors.length === 0) {
    console.log('✅ エラーはありませんが、警告があります。確認してください。');
  } else {
    console.log('❌ エラーが見つかりました。データを修正してください。');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    const filePath =
      args[0] || join(process.cwd(), 'public/data/shelters.geojson');

    console.log('🚀 避難所データ検証スクリプトを開始');
    console.log(`📁 ファイル: ${filePath}`);
    console.log('');

    // データ読み込み
    const fileContent = await readFile(filePath, 'utf-8');
    const geoJSON = JSON.parse(fileContent) as {
      type: string;
      features: ShelterFeature[];
    };

    if (
      geoJSON.type !== 'FeatureCollection' ||
      !Array.isArray(geoJSON.features)
    ) {
      throw new Error('Invalid GeoJSON format');
    }

    // 検証実行
    const result = validateShelters(geoJSON.features);

    // 結果表示
    displayResults(result);

    // エラーがある場合は終了コード1で終了
    if (result.errors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
