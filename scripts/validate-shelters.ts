#!/usr/bin/env tsx
/**
 * 避難所データの検証スクリプト
 *
 * 用途:
 * - 座標と住所の整合性チェック
 * - 鳴門市の範囲外の座標を検出
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

/**
 * 鳴門市の大まかな範囲（緯度・経度）
 * 参考: 鳴門市の境界座標
 */
const NARUTO_CITY_BOUNDS = {
  minLng: 134.45, // 西端
  maxLng: 134.75, // 東端
  minLat: 34.0, // 南端
  maxLat: 34.3, // 北端
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
    type: 'invalid_address' | 'out_of_bounds' | 'tokushima_city_in_address';
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
 * 座標が鳴門市の範囲内かチェック
 */
function isWithinNarutoCity(coordinates: [number, number]): {
  valid: boolean;
  reason?: string;
} {
  const [lng, lat] = coordinates;

  if (lng < NARUTO_CITY_BOUNDS.minLng || lng > NARUTO_CITY_BOUNDS.maxLng) {
    return {
      valid: false,
      reason: `経度が範囲外: ${lng} (範囲: ${NARUTO_CITY_BOUNDS.minLng} - ${NARUTO_CITY_BOUNDS.maxLng})`,
    };
  }

  if (lat < NARUTO_CITY_BOUNDS.minLat || lat > NARUTO_CITY_BOUNDS.maxLat) {
    return {
      valid: false,
      reason: `緯度が範囲外: ${lat} (範囲: ${NARUTO_CITY_BOUNDS.minLat} - ${NARUTO_CITY_BOUNDS.maxLat})`,
    };
  }

  return { valid: true };
}

/**
 * 住所に「徳島市」が含まれているかチェック
 */
function containsTokushimaCity(address: string): boolean {
  return address.includes('徳島市') && !address.includes('徳島県');
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

  if (
    Math.abs(lng - NARUTO_CITY_BOUNDS.minLng) < threshold ||
    Math.abs(lng - NARUTO_CITY_BOUNDS.maxLng) < threshold ||
    Math.abs(lat - NARUTO_CITY_BOUNDS.minLat) < threshold ||
    Math.abs(lat - NARUTO_CITY_BOUNDS.maxLat) < threshold
  ) {
    return {
      near: true,
      reason: '鳴門市の境界付近に位置しています。座標を確認してください。',
    };
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

    // 2. 座標が鳴門市の範囲外
    const boundsCheck = isWithinNarutoCity(coordinates);
    if (!boundsCheck.valid) {
      result.errors.push({
        id,
        name,
        type: 'out_of_bounds',
        message: boundsCheck.reason || '座標が鳴門市の範囲外です',
        coordinates,
        address,
      });
    }

    // 3. 住所が「鳴門市」を含んでいない
    if (!address.includes('鳴門市')) {
      result.errors.push({
        id,
        name,
        type: 'invalid_address',
        message: `住所に「鳴門市」が含まれていません: ${address}`,
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
