#!/usr/bin/env tsx

/**
 * 避難所データ自動更新スクリプト
 *
 * 国土地理院の避難所データを取得し、鳴門市のデータのみを抽出して
 * public/data/shelters.geojson を更新します。
 *
 * 実行方法:
 *   pnpm tsx scripts/fetch-shelters.ts
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  DisasterType,
  Shelter,
  ShelterFeature,
  ShelterGeoJSON,
  ShelterType,
} from '../src/types/shelter';

// 国土地理院 避難所ダウンロードサイト
// NOTE: 国土地理院は直接APIを提供していないため、以下のサイトから手動ダウンロードが必要
// https://hinanmap.gsi.go.jp/index.html
//
// ダウンロード手順:
// 1. 上記サイトにアクセス
// 2. 徳島県 > 鳴門市を選択
// 3. GeoJSON形式でダウンロード
// 4. ダウンロードしたファイルをスクリプトで処理
//
// データソース候補:
// - 国土地理院 避難所マップ: https://hinanmap.gsi.go.jp/
// - 国土数値情報 P20: https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-P20.html (2012年データ、古い)
//
const GSI_SHELTER_DOWNLOAD_SITE = 'https://hinanmap.gsi.go.jp/index.html';

// 鳴門市の行政コード（徳島県鳴門市）
// NOTE: 現在は住所フィルタリングを使用しているため未使用
// const NARUTO_CITY_CODE = '36202';

/**
 * 国土地理院からダウンロードした避難所データを読み込む
 *
 * NOTE: 現状、国土地理院は避難所データの直接APIを提供していないため、
 * 手動でダウンロードしたGeoJSONファイルを読み込む方式を採用
 *
 * @param filePath ダウンロードしたGeoJSONファイルのパス
 */
async function loadGSIData(filePath: string): Promise<unknown> {
  console.log('📡 国土地理院データを読み込み中...');

  try {
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
 * 鳴門市のデータのみをフィルタリング
 */
function filterNarutoCity(data: unknown): unknown[] {
  console.log('🔍 鳴門市のデータを抽出中...');

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

  // 鳴門市のデータを抽出（住所に「鳴門市」を含むもの）
  const narutoFeatures = geoJSON.features.filter((feature: unknown) => {
    if (!feature || typeof feature !== 'object') return false;

    const f = feature as { properties?: { address?: string; 住所?: string } };
    const address = f.properties?.address || f.properties?.住所 || '';

    return address.includes('鳴門市');
  });

  console.log(`✅ 鳴門市のデータ: ${narutoFeatures.length}件`);

  return narutoFeatures;
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
      const name = String(props.name || props.名称 || props.施設名 || '');
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

    if (!inputFilePath) {
      console.error(
        '❌ 使用方法: pnpm tsx scripts/fetch-shelters.ts <GeoJSONファイルパス>'
      );
      console.error('');
      console.error(
        '例: pnpm tsx scripts/fetch-shelters.ts ./downloads/naruto-shelters.geojson'
      );
      console.error('');
      console.error('国土地理院からのダウンロード手順:');
      console.error(`1. ${GSI_SHELTER_DOWNLOAD_SITE} にアクセス`);
      console.error('2. 徳島県 > 鳴門市を選択');
      console.error('3. GeoJSON形式でダウンロード');
      console.error('4. ダウンロードしたファイルをこのスクリプトで処理');
      process.exit(1);
    }

    // 1. データ読み込み
    const rawData = await loadGSIData(inputFilePath);

    // 2. 鳴門市データ抽出
    const narutoFeatures = filterNarutoCity(rawData);

    // 3. データ正規化
    const normalizedFeatures = normalizeData(narutoFeatures);

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
