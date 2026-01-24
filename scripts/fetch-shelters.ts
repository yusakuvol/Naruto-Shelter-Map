#!/usr/bin/env tsx

/**
 * 避難所データ自動更新スクリプト
 *
 * 国土地理院の避難所データを取得し、鳴門市とその隣接地域のデータを抽出して
 * public/data/shelters.geojson を更新します。
 *
 * 対応地域:
 * - 鳴門市（メイン）
 * - 藍住町（隣接）
 * - 北島町（隣接）
 * - 松茂町（隣接）
 * - 板野町（隣接）
 *
 * 実行方法:
 *   pnpm tsx scripts/fetch-shelters.ts [GeoJSONファイルパスまたはURL|auto]
 *
 * 引数なし、または 'auto' を指定した場合:
 *   - 地理院タイルAPIから自動取得します
 *
 * ファイルパスまたはURLを指定した場合:
 *   - 指定されたファイルまたはURLからデータを読み込みます
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { detectRegionFromAddress, REGIONS } from '../src/config/regions';
import type {
  DisasterType,
  Shelter,
  ShelterFeature,
  ShelterGeoJSON,
  ShelterType,
} from '../src/types/shelter';

// 地理院タイルAPI ベースURL
// skhb01～skhb08: 指定緊急避難場所データ（災害種別別）
// すべてのデータセットを取得してマージ
const GSI_TILE_BASE_URL = 'https://cyberjapandata.gsi.go.jp/xyz';
const GSI_TILE_DATASETS = [
  'skhb01', // 洪水
  'skhb02', // 津波
  'skhb03', // 土砂災害
  'skhb04', // 地震
  'skhb05', // 大規模な火事
  'skhb06', // 内水氾濫
  'skhb07', // 火山現象
  'skhb08', // その他
] as const;

// タイル取得用のズームレベル（10が適切な粒度）
const TILE_ZOOM_LEVEL = 10;

/**
 * 緯度経度からタイル座標を計算
 * 地理院タイルの座標系を使用
 *
 * @param lng 経度
 * @param lat 緯度
 * @param zoom ズームレベル
 * @returns タイル座標 [x, y]
 */
function latLngToTile(
  lng: number,
  lat: number,
  zoom: number
): [number, number] {
  const n = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return [x, y];
}

/**
 * 範囲内のすべてのタイル座標を取得
 *
 * @param minLng 最小経度
 * @param maxLng 最大経度
 * @param minLat 最小緯度
 * @param maxLat 最大緯度
 * @param zoom ズームレベル
 * @returns タイル座標の配列
 */
function getTilesInBounds(
  minLng: number,
  maxLng: number,
  minLat: number,
  maxLat: number,
  zoom: number
): Array<[number, number]> {
  const [minX, minY] = latLngToTile(minLng, maxLat, zoom); // 北西角（最小X、最小Y）
  const [maxX, maxY] = latLngToTile(maxLng, minLat, zoom); // 南東角（最大X、最大Y）

  const tiles: Array<[number, number]> = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push([x, y]);
    }
  }
  return tiles;
}

/**
 * 地理院タイルから避難所データを取得
 *
 * @returns マージされたGeoJSONデータ
 */
async function fetchFromGSITiles(): Promise<unknown> {
  console.log('📡 地理院タイルAPIから避難所データを取得中...');

  // 対応地域の範囲を計算（すべての地域を含む）
  const allBounds = {
    minLng: Math.min(...REGIONS.map((r) => r.bounds.minLng)),
    maxLng: Math.max(...REGIONS.map((r) => r.bounds.maxLng)),
    minLat: Math.min(...REGIONS.map((r) => r.bounds.minLat)),
    maxLat: Math.max(...REGIONS.map((r) => r.bounds.maxLat)),
  };

  // 範囲を少し広げる（余裕を持たせる）
  const padding = 0.05;
  const bounds = {
    minLng: allBounds.minLng - padding,
    maxLng: allBounds.maxLng + padding,
    minLat: allBounds.minLat - padding,
    maxLat: allBounds.maxLat + padding,
  };

  // タイル座標を取得
  const tiles = getTilesInBounds(
    bounds.minLng,
    bounds.maxLng,
    bounds.minLat,
    bounds.maxLat,
    TILE_ZOOM_LEVEL
  );

  console.log(
    `  範囲: [${bounds.minLng}, ${bounds.minLat}] - [${bounds.maxLng}, ${bounds.maxLat}]`
  );
  console.log(
    `  タイル数: ${tiles.length}枚 × ${GSI_TILE_DATASETS.length}データセット`
  );

  // すべてのデータセットとタイルからデータを取得
  const allFeatures: unknown[] = [];
  const featureIds = new Set<string>(); // 重複排除用

  for (const dataset of GSI_TILE_DATASETS) {
    console.log(`  📦 データセット: ${dataset} を取得中...`);
    let datasetCount = 0;

    for (const [x, y] of tiles) {
      const url = `${GSI_TILE_BASE_URL}/${dataset}/${TILE_ZOOM_LEVEL}/${x}/${y}.geojson`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          // 404はタイルが存在しない場合（正常）
          if (response.status === 404) {
            continue;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as {
          type?: string;
          features?: unknown[];
        };

        if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
          for (const feature of data.features) {
            if (!feature || typeof feature !== 'object') continue;

            const f = feature as {
              id?: string;
              properties?: Record<string, unknown>;
            };
            // 重複排除（IDまたは座標+名前で判定）
            const featureId =
              f.id ||
              JSON.stringify(
                (feature as { geometry?: { coordinates?: unknown } }).geometry
                  ?.coordinates
              );

            if (featureId && !featureIds.has(featureId)) {
              featureIds.add(featureId);
              allFeatures.push(feature);
              datasetCount++;
            }
          }
        }

        // レート制限対策（少し待機）
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      } catch (error) {
        // 個別のタイル取得エラーは無視（404などは正常）
        if (error instanceof Error && !error.message.includes('HTTP')) {
          console.warn(
            `    ⚠️  タイル [${x}, ${y}] の取得に失敗: ${error.message}`
          );
        }
      }
    }

    console.log(`    ✅ ${dataset}: ${datasetCount}件の避難所を取得`);
  }

  console.log(`✅ 合計 ${allFeatures.length}件の避難所データを取得完了`);

  return {
    type: 'FeatureCollection',
    features: allFeatures,
  };
}

/**
 * URLからGeoJSONデータをダウンロード
 *
 * @param url GeoJSONファイルのURL
 */
async function downloadGeoJSON(url: string): Promise<unknown> {
  console.log(`📡 GeoJSONデータをダウンロード中: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`ダウンロードに失敗しました (HTTP ${response.status})`);
    }

    const json = (await response.json()) as unknown;
    console.log(`✅ データダウンロード完了`);
    return json;
  } catch (error) {
    console.error('❌ データダウンロードエラー:', error);
    throw error;
  }
}

/**
 * 国土地理院から避難所データを読み込む
 *
 * @param filePath ダウンロードしたGeoJSONファイルのパス、またはURL、または 'auto'（自動取得）
 */
async function loadGSIData(filePath: string | undefined): Promise<unknown> {
  console.log('📡 国土地理院データを読み込み中...');

  try {
    // 引数がない、または 'auto' の場合は地理院タイルAPIから自動取得
    if (!filePath || filePath === 'auto') {
      return await fetchFromGSITiles();
    }

    // URLの場合はダウンロード
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return await downloadGeoJSON(filePath);
    }

    // ファイルパスの場合は読み込み
    const { readFile } = await import('node:fs/promises');
    const data = await readFile(filePath, 'utf-8');
    const json = JSON.parse(data);

    console.log(`✅ データ読み込み完了`);
    return json;
  } catch (error) {
    console.error('❌ データ読み込みエラー:', error);
    throw error;
  }
}

/**
 * 対応地域のデータをフィルタリング
 * 鳴門市とその隣接地域（藍住町、北島町、松茂町、板野町）を含む
 */
function filterRegions(data: unknown): unknown[] {
  console.log('🔍 対応地域のデータを抽出中...');

  // GeoJSON形式のバリデーション
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid GeoJSON data');
  }

  const geoJSON = data as { type?: string; features?: unknown[] };

  if (
    geoJSON.type !== 'FeatureCollection' ||
    !Array.isArray(geoJSON.features)
  ) {
    throw new Error('Not a valid GeoJSON FeatureCollection');
  }

  // 対応地域の検索名リストを作成
  const regionSearchNames = REGIONS.map((region) => region.searchName);

  // 対応地域のデータを抽出（住所に対応地域名が含まれるもの）
  const regionFeatures = geoJSON.features.filter((feature: unknown) => {
    if (!feature || typeof feature !== 'object') return false;

    const f = feature as { properties?: { address?: string; 住所?: string } };
    const address = f.properties?.address || f.properties?.住所 || '';

    // いずれかの対応地域名が住所に含まれているかチェック
    return regionSearchNames.some((searchName) => address.includes(searchName));
  });

  // 地域別の集計
  const regionCounts: Record<string, number> = {};
  for (const feature of regionFeatures) {
    if (!feature || typeof feature !== 'object') continue;
    const f = feature as { properties?: { address?: string; 住所?: string } };
    const address = f.properties?.address || f.properties?.住所 || '';
    const region = detectRegionFromAddress(address);
    if (region) {
      regionCounts[region.name] = (regionCounts[region.name] || 0) + 1;
    }
  }

  console.log(`✅ 対応地域のデータ: ${regionFeatures.length}件`);
  for (const [regionName, count] of Object.entries(regionCounts)) {
    console.log(`   - ${regionName}: ${count}件`);
  }

  return regionFeatures;
}

/**
 * 災害種別を正規化
 */
function normalizeDisasterType(type: string): DisasterType | null {
  const mapping: Record<string, DisasterType> = {
    洪水: '洪水',
    津波: '津波',
    土砂災害: '土砂災害',
    土石流: '土砂災害',
    がけ崩れ: '土砂災害',
    地滑り: '土砂災害',
    地震: '地震',
    大規模な火事: '火災',
    火災: '火災',
  };

  return mapping[type] || null;
}

/**
 * 避難所種別を正規化
 */
function normalizeShelterType(type: string): ShelterType {
  if (type.includes('指定避難所') && type.includes('指定緊急避難場所')) {
    return '両方';
  }
  if (type.includes('指定避難所')) {
    return '指定避難所';
  }
  if (type.includes('指定緊急避難場所') || type.includes('緊急避難場所')) {
    return '緊急避難場所';
  }
  return '両方'; // デフォルト
}

/**
 * データを正規化してShelterFeature形式に変換
 */
function normalizeData(features: unknown[]): ShelterFeature[] {
  console.log('🔄 データを正規化中...');

  const today: string = new Date().toISOString().split('T')[0] as string; // YYYY-MM-DD

  const normalized = features
    .map((feature, index): ShelterFeature | null => {
      if (!feature || typeof feature !== 'object') return null;

      const f = feature as {
        type?: string;
        geometry?: { type?: string; coordinates?: unknown };
        properties?: Record<string, unknown>;
      };

      // 基本バリデーション
      if (f.type !== 'Feature' || !f.geometry || !f.properties) return null;

      const props = f.properties;
      const geometry = f.geometry as {
        type: string;
        coordinates: [number, number];
      };

      // 座標の取得
      if (geometry.type !== 'Point' || !Array.isArray(geometry.coordinates)) {
        return null;
      }

      // プロパティの抽出（国土地理院の形式に対応）
      const name = String(
        props.name || props.名称 || props.施設名 || props['施設・場所名'] || ''
      );
      const address = String(props.address || props.住所 || props.所在地 || '');
      const type = (props.type ||
        props.種別 ||
        props.施設種別 ||
        '両方') as string;
      const contact = (props.contact ||
        props.連絡先 ||
        props.電話番号 ||
        undefined) as string | undefined;
      const capacity = (props.capacity || props.収容人数 || undefined) as
        | number
        | undefined;

      // 地域情報の判定
      const region = detectRegionFromAddress(address);

      // 災害種別の抽出と正規化
      let disasterTypes: DisasterType[] = [];
      if (Array.isArray(props.disasterTypes)) {
        disasterTypes = props.disasterTypes
          .map((t) => normalizeDisasterType(String(t)))
          .filter((t): t is DisasterType => t !== null);
      } else if (Array.isArray(props.災害種別)) {
        disasterTypes = props.災害種別
          .map((t) => normalizeDisasterType(String(t)))
          .filter((t): t is DisasterType => t !== null);
      }

      // 災害種別が空の場合はスキップ
      if (disasterTypes.length === 0) {
        disasterTypes = ['地震']; // デフォルトで地震を設定
      }

      // オプショナルフィールドの処理（exactOptionalPropertyTypes対応）
      const properties: Omit<Shelter, 'coordinates'> = {
        id: `shelter-${String(index + 1).padStart(3, '0')}`,
        name,
        type: normalizeShelterType(type),
        address,
        disasterTypes,
        source: '国土地理院',
        updatedAt: today,
      };

      // オプショナルフィールドは値がある場合のみ設定
      if (capacity !== undefined) {
        properties.capacity = capacity;
      }
      if (contact !== undefined) {
        properties.contact = contact;
      }
      // 地域情報を追加
      if (region) {
        properties.regionId = region.id;
        properties.regionName = region.name;
      }

      // 拡張情報（設備、バリアフリー、ペット、開設状況）
      // 国土地理院のデータに含まれている場合は保持
      const facilities = props.facilities;
      if (facilities && typeof facilities === 'object') {
        (properties as { facilities?: Shelter['facilities'] }).facilities =
          facilities as Shelter['facilities'];
      }
      const accessibility = props.accessibility;
      if (accessibility && typeof accessibility === 'object') {
        (
          properties as { accessibility?: Shelter['accessibility'] }
        ).accessibility = accessibility as Shelter['accessibility'];
      }
      const pets = props.pets;
      if (pets && typeof pets === 'object') {
        (properties as { pets?: Shelter['pets'] }).pets =
          pets as Shelter['pets'];
      }
      const operationStatus = props.operationStatus;
      if (operationStatus && typeof operationStatus === 'object') {
        (
          properties as { operationStatus?: Shelter['operationStatus'] }
        ).operationStatus = operationStatus as Shelter['operationStatus'];
      }

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: geometry.coordinates,
        },
        properties,
      };
    })
    .filter((f): f is ShelterFeature => f !== null);

  console.log(`✅ 正規化完了: ${normalized.length}件`);

  return normalized;
}

/**
 * GeoJSONファイルを保存
 */
async function saveGeoJSON(data: ShelterGeoJSON): Promise<void> {
  const outputPath = join(process.cwd(), 'public', 'data', 'shelters.geojson');

  console.log(`💾 データを保存中: ${outputPath}`);

  const json = JSON.stringify(data, null, 2);
  await writeFile(outputPath, json, 'utf-8');

  console.log(`✅ 保存完了: ${data.features.length}件の避難所`);
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 避難所データ更新スクリプトを開始');
    console.log('---');

    // コマンドライン引数からファイルパスを取得
    const args = process.argv.slice(2);
    const inputFilePath = args[0];

    // 引数がない場合は自動取得モード
    // 1. データ読み込み（自動取得または指定ファイル）
    const rawData = await loadGSIData(inputFilePath);

    // 2. 対応地域データ抽出（鳴門市 + 隣接地域）
    const regionFeatures = filterRegions(rawData);

    // 3. データ正規化
    const normalizedFeatures = normalizeData(regionFeatures);

    // 4. GeoJSON形式で保存
    const geoJSON: ShelterGeoJSON = {
      type: 'FeatureCollection',
      features: normalizedFeatures,
    };

    await saveGeoJSON(geoJSON);

    console.log('---');
    console.log('🎉 完了');
  } catch (error) {
    console.error('---');
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
main();
