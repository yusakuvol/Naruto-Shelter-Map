#!/usr/bin/env tsx
/**
 * 避難所データのジオコーディングスクリプト
 *
 * OpenStreetMap Nominatim APIを使用して、住所から座標を取得します。
 * 既存の座標と比較し、距離が一定以上離れている場合は修正を提案します。
 *
 * 使用方法:
 *   pnpm tsx scripts/geocode-shelters.ts [GeoJSONファイルパス]
 *
 * デフォルト: public/data/shelters.geojson
 *
 * 注意:
 * - OpenStreetMap Nominatim APIのレート制限: 1秒に1リクエスト（推奨）
 * - 150件の避難所を更新する場合、約2.5分かかります
 * - User-Agentヘッダーを設定する必要があります（利用規約）
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * 鳴門市の大まかな範囲（緯度・経度）
 */
const NARUTO_CITY_BOUNDS = {
  minLng: 134.45,
  maxLng: 134.75,
  minLat: 34.0,
  maxLat: 34.3,
} as const;

/**
 * 徳島市の大まかな範囲（緯度・経度）
 */
const TOKUSHIMA_CITY_BOUNDS = {
  minLng: 134.5,
  maxLng: 134.6,
  minLat: 34.0,
  maxLat: 34.1,
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

interface GeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface GeocodeStats {
  total: number;
  success: number;
  failed: number;
  updated: number;
  skipped: number;
}

/**
 * 2点間の距離を計算（ハーバーサイン公式）
 * 単位: キロメートル
 */
function calculateDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  const R = 6371; // 地球の半径（km）

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
 * 座標が鳴門市の範囲内かチェック
 */
function isWithinNarutoCity(coordinates: [number, number]): boolean {
  const [lng, lat] = coordinates;
  return (
    lng >= NARUTO_CITY_BOUNDS.minLng &&
    lng <= NARUTO_CITY_BOUNDS.maxLng &&
    lat >= NARUTO_CITY_BOUNDS.minLat &&
    lat <= NARUTO_CITY_BOUNDS.maxLat
  );
}

/**
 * 住所から座標を取得（ジオコーディング）
 */
async function geocodeAddress(
  address: string
): Promise<[number, number] | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', address);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'jp'); // 日本に限定
  url.searchParams.set('addressdetails', '1');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent':
          'Naruto-Shelter-Map/1.0 (https://github.com/yusakuvol/Naruto-Shelter-Map)',
      },
    });

    if (!response.ok) {
      console.error(`❌ HTTP error: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as GeocodeResult[];

    if (data.length === 0) {
      return null;
    }

    const result = data[0];
    if (!result) {
      return null;
    }

    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return null;
    }

    return [lon, lat]; // [lng, lat]
  } catch (error) {
    console.error(`❌ Geocoding error for "${address}":`, error);
    return null;
  }
}

/**
 * 1秒待機（レート制限対応）
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    const filePath =
      args[0] || join(process.cwd(), 'public/data/shelters.geojson');

    console.log('🚀 避難所データジオコーディングスクリプトを開始');
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

    const stats: GeocodeStats = {
      total: geoJSON.features.length,
      success: 0,
      failed: 0,
      updated: 0,
      skipped: 0,
    };

    console.log(`📊 総件数: ${stats.total}件`);
    console.log('');

    // 各避難所を処理
    for (let i = 0; i < geoJSON.features.length; i++) {
      const feature = geoJSON.features[i];
      if (!feature) {
        continue;
      }

      const { id, name, address } = feature.properties;
      const currentCoords = feature.geometry.coordinates;

      // 座標が徳島市の範囲内にある場合のみ処理
      if (!isWithinTokushimaCity(currentCoords)) {
        stats.skipped++;
        continue;
      }

      console.log(`[${i + 1}/${stats.total}] ${name} (${id})`);
      console.log(`  住所: ${address}`);
      console.log(`  現在の座標: [${currentCoords[0]}, ${currentCoords[1]}]`);

      // ジオコーディング実行
      const geocodedCoords = await geocodeAddress(address);

      if (!geocodedCoords) {
        console.log('  ❌ ジオコーディング失敗');
        stats.failed++;
        await sleep(1000); // レート制限対応
        continue;
      }

      stats.success++;

      // 座標が鳴門市の範囲内かチェック
      if (!isWithinNarutoCity(geocodedCoords)) {
        console.log(
          `  ⚠️  ジオコーディング結果が鳴門市の範囲外: [${geocodedCoords[0]}, ${geocodedCoords[1]}]`
        );
        await sleep(1000);
        continue;
      }

      // 距離を計算
      const distance = calculateDistance(currentCoords, geocodedCoords);
      console.log(
        `  📍 ジオコーディング結果: [${geocodedCoords[0]}, ${geocodedCoords[1]}]`
      );
      console.log(`  📏 距離: ${distance.toFixed(2)}km`);

      // 距離が500m以上離れている場合は更新
      if (distance > 0.5) {
        feature.geometry.coordinates = geocodedCoords;
        stats.updated++;
        console.log('  ✅ 座標を更新しました');
      } else {
        console.log('  ℹ️  距離が近いためスキップ');
      }

      // レート制限対応（1秒に1リクエスト）
      await sleep(1000);
      console.log('');
    }

    // 結果表示
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ジオコーディング結果');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`総件数: ${stats.total}件`);
    console.log(`✅ 成功: ${stats.success}件`);
    console.log(`❌ 失敗: ${stats.failed}件`);
    console.log(`🔄 更新: ${stats.updated}件`);
    console.log(`⏭️  スキップ: ${stats.skipped}件`);
    console.log('');

    // 更新があった場合は保存
    if (stats.updated > 0) {
      const output = JSON.stringify(geoJSON, null, 2);
      await writeFile(filePath, output, 'utf-8');
      console.log(`✅ ${stats.updated}件の座標を更新して保存しました`);
    } else {
      console.log('ℹ️  更新はありませんでした');
    }
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
