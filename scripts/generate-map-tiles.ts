#!/usr/bin/env tsx

/**
 * オフライン地図タイル（PMTiles）生成スクリプト
 *
 * Protomaps の日次ベースマップビルド（OpenStreetMap 由来）から、
 * 対象5市町（鳴門市・藍住町・北島町・松茂町・板野町）を含む範囲を
 * `pmtiles extract` で切り出し、public/map/basemap.pmtiles に出力します。
 *
 * 生成されたファイルはアプリに同梱され、Service Worker の precache 対象と
 * なることで、初回インストール直後から完全オフラインで地図を表示できます。
 *
 * 実行方法:
 *   pnpm tsx scripts/generate-map-tiles.ts
 *
 * 環境変数:
 *   TILES_MAXZOOM  最大ズームレベル（デフォルト: 15。protomaps ビルドの最大値）
 *   PMTILES_BIN    使用する pmtiles CLI のパス（未指定なら PATH → 自動ダウンロード）
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chmod, mkdir, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { REGIONS } from '../src/config/regions';

/** Protomaps 日次ビルドの一覧 API */
const BUILDS_INDEX_URL = 'https://build-metadata.protomaps.dev/builds.json';
/** Protomaps 日次ビルドの配信ベース URL */
const BUILDS_BASE_URL = 'https://build.protomaps.com';
/** go-pmtiles CLI のバージョン（自動ダウンロード時に使用） */
const PMTILES_CLI_VERSION = '1.30.3';
/** 出力先 */
const OUTPUT_PATH = join(import.meta.dirname, '../public/map/basemap.pmtiles');
/** bbox に持たせる余白（度） */
const BBOX_MARGIN = 0.03;
/**
 * Cloudflare Pages の 1 ファイルあたりの上限は 25 MiB。
 * 余裕を持って 24 MiB を超えたら失敗させる。
 */
const MAX_FILE_SIZE_BYTES = 24 * 1024 * 1024;

interface BuildEntry {
  key: string;
  size: number;
  uploaded: string;
  version: string;
}

/** 対象5市町の bounds の合併 + 余白から bbox を計算する */
function computeBbox(): string {
  const minLng = Math.min(...REGIONS.map((r) => r.bounds.minLng)) - BBOX_MARGIN;
  const maxLng = Math.max(...REGIONS.map((r) => r.bounds.maxLng)) + BBOX_MARGIN;
  const minLat = Math.min(...REGIONS.map((r) => r.bounds.minLat)) - BBOX_MARGIN;
  const maxLat = Math.max(...REGIONS.map((r) => r.bounds.maxLat)) + BBOX_MARGIN;
  return `${minLng},${minLat},${maxLng},${maxLat}`;
}

/** pmtiles CLI のパスを解決する（PATH → キャッシュ → 自動ダウンロード） */
async function resolvePmtilesCli(): Promise<string> {
  const fromEnv = process.env.PMTILES_BIN;
  if (fromEnv) {
    return fromEnv;
  }

  // PATH 上にあればそれを使う
  const which = spawnSync('pmtiles', ['version'], { stdio: 'ignore' });
  if (which.status === 0) {
    return 'pmtiles';
  }

  const cacheDir = join(
    import.meta.dirname,
    '../node_modules/.cache/go-pmtiles'
  );
  const binPath = join(cacheDir, 'pmtiles');
  if (existsSync(binPath)) {
    return binPath;
  }

  console.log(`⬇️  go-pmtiles CLI v${PMTILES_CLI_VERSION} をダウンロード中...`);
  const { assetName, isZip } = cliAssetForPlatform();
  const url = `https://github.com/protomaps/go-pmtiles/releases/download/v${PMTILES_CLI_VERSION}/${assetName}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `go-pmtiles のダウンロードに失敗しました: ${res.status} ${url}`
    );
  }
  const archivePath = join(tmpdir(), assetName);
  await writeFile(archivePath, Buffer.from(await res.arrayBuffer()));

  await mkdir(cacheDir, { recursive: true });
  if (isZip) {
    execFileSync('unzip', ['-o', archivePath, 'pmtiles', '-d', cacheDir]);
  } else {
    execFileSync('tar', ['-xzf', archivePath, '-C', cacheDir, 'pmtiles']);
  }
  await chmod(binPath, 0o755);
  return binPath;
}

/** 実行環境に対応する go-pmtiles リリースアセット名を返す */
function cliAssetForPlatform(): { assetName: string; isZip: boolean } {
  const arch = process.arch === 'arm64' ? 'arm64' : 'x86_64';
  switch (process.platform) {
    case 'darwin':
      // Darwin はハイフン区切りの zip、Linux はアンダースコア区切りの tar.gz
      return {
        assetName: `go-pmtiles-${PMTILES_CLI_VERSION}_Darwin_${arch}.zip`,
        isZip: true,
      };
    case 'linux':
      return {
        assetName: `go-pmtiles_${PMTILES_CLI_VERSION}_Linux_${arch}.tar.gz`,
        isZip: false,
      };
    default:
      throw new Error(`未対応のプラットフォームです: ${process.platform}`);
  }
}

/** 最新の日次ビルドのファイル名を取得する */
async function fetchLatestBuildKey(): Promise<string> {
  const res = await fetch(BUILDS_INDEX_URL);
  if (!res.ok) {
    throw new Error(`ビルド一覧の取得に失敗しました: ${res.status}`);
  }
  const builds = (await res.json()) as BuildEntry[];
  const latest = builds.at(-1);
  if (!latest) {
    throw new Error('ビルド一覧が空です');
  }
  console.log(
    `📦 最新ビルド: ${latest.key}（tileset v${latest.version}, ${(latest.size / 1e9).toFixed(1)} GB）`
  );
  return latest.key;
}

async function main(): Promise<void> {
  const maxzoom = process.env.TILES_MAXZOOM ?? '15';
  const bbox = computeBbox();
  console.log(`🗺️  対象範囲 bbox: ${bbox} / maxzoom: ${maxzoom}`);

  const cli = await resolvePmtilesCli();
  const buildKey = await fetchLatestBuildKey();

  await mkdir(join(OUTPUT_PATH, '..'), { recursive: true });

  console.log(
    '✂️  pmtiles extract を実行中（必要な範囲のみダウンロードします）...'
  );
  execFileSync(
    cli,
    [
      'extract',
      `${BUILDS_BASE_URL}/${buildKey}`,
      OUTPUT_PATH,
      `--bbox=${bbox}`,
      `--maxzoom=${maxzoom}`,
    ],
    { stdio: 'inherit' }
  );

  const { size } = await stat(OUTPUT_PATH);
  const sizeMb = (size / 1024 / 1024).toFixed(1);
  console.log(`✅ 生成完了: public/map/basemap.pmtiles (${sizeMb} MB)`);

  if (size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `生成ファイルが ${sizeMb} MB あり、Cloudflare Pages の上限（25 MiB）に近すぎます。` +
        ' TILES_MAXZOOM を下げて再生成してください。'
    );
  }
}

main().catch((error: unknown) => {
  console.error('❌ タイル生成に失敗しました:', error);
  process.exit(1);
});
