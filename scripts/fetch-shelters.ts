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

// 国土地理院 避難所データのURL
const GSI_SHELTER_DATA_URL = 'https://www.gsi.go.jp/bousaichiri/hinanbasho.html';

// 鳴門市の行政コード（徳島県鳴門市）
const NARUTO_CITY_CODE = '36202';

/**
 * 国土地理院APIから避難所データを取得
 */
async function fetchGSIData(): Promise<unknown> {
  console.log('📡 国土地理院からデータを取得中...');

  try {
    // TODO: 実際のAPIエンドポイントを調査して実装
    // 現在は国土地理院のダウンロードサイトからの取得方法を調査中
    throw new Error('API endpoint not yet implemented');
  } catch (error) {
    console.error('❌ データ取得エラー:', error);
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

    // 1. データ取得
    const rawData = await fetchGSIData();

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
