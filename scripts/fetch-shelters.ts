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
import type { ShelterGeoJSON, ShelterFeature, DisasterType, ShelterType } from '../src/types/shelter';

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
const NARUTO_CITY_CODE = '36202';

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
function filterNarutoCity(data: unknown): ShelterFeature[] {
  console.log('🔍 鳴門市のデータを抽出中...');

  // TODO: GeoJSONデータから鳴門市のフィーチャーを抽出
  // 行政コード or 住所で判定

  return [];
}

/**
 * データを正規化してShelterFeature形式に変換
 */
function normalizeData(features: unknown[]): ShelterFeature[] {
  console.log('🔄 データを正規化中...');

  // TODO: 国土地理院のデータ形式から本プロジェクトの形式に変換

  return [];
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
      console.error('❌ 使用方法: pnpm tsx scripts/fetch-shelters.ts <GeoJSONファイルパス>');
      console.error('');
      console.error('例: pnpm tsx scripts/fetch-shelters.ts ./downloads/naruto-shelters.geojson');
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
