#!/usr/bin/env tsx

/**
 * オフライン地図用アセット（フォント・スプライト）取得スクリプト
 *
 * Protomaps basemaps スタイルが参照するグリフ（フォント PBF）とスプライトを
 * protomaps/basemaps-assets リポジトリからダウンロードし、public/map/ 配下に
 * 同梱します。これらも precache されるため、オフラインでもラベル・アイコンを
 * 描画できます。
 *
 * 注: 日本語（漢字・かな）は MapLibre の localIdeographFontFamily により
 * 端末のローカルフォントで描画されるため、同梱するのは欧文グリフのみで足ります。
 *
 * 実行方法:
 *   pnpm tsx scripts/fetch-map-assets.ts
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/** basemaps-assets の配信 URL（GitHub Pages） */
const ASSETS_BASE_URL = 'https://protomaps.github.io/basemaps-assets';
/** 出力先 */
const OUTPUT_DIR = join(import.meta.dirname, '../public/map');
/** スタイル（@protomaps/basemaps の light フレーバー）が参照するフォント */
const FONT_STACKS = [
  'Noto Sans Regular',
  'Noto Sans Medium',
  'Noto Sans Italic',
] as const;
/** スプライトのフレーバー */
const SPRITE_FILES = [
  'sprites/v4/light.json',
  'sprites/v4/light.png',
  'sprites/v4/light@2x.json',
  'sprites/v4/light@2x.png',
] as const;
/** 同時ダウンロード数 */
const CONCURRENCY = 16;

/** 1ファイルをダウンロードして保存する */
async function download(relativePath: string): Promise<void> {
  const url = `${ASSETS_BASE_URL}/${encodeURI(relativePath)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`ダウンロードに失敗しました: ${res.status} ${url}`);
  }
  const outPath = join(OUTPUT_DIR, relativePath);
  await mkdir(join(outPath, '..'), { recursive: true });
  await writeFile(outPath, Buffer.from(await res.arrayBuffer()));
}

/** 指定された並列数でタスクを実行する */
async function runWithConcurrency(
  paths: string[],
  worker: (path: string) => Promise<void>
): Promise<void> {
  let index = 0;
  let completed = 0;
  const runners = Array.from(
    { length: Math.min(CONCURRENCY, paths.length) },
    async () => {
      while (index < paths.length) {
        const current = paths[index];
        index += 1;
        if (current === undefined) {
          break;
        }
        await worker(current);
        completed += 1;
        if (completed % 100 === 0) {
          console.log(`  ... ${completed}/${paths.length}`);
        }
      }
    }
  );
  await Promise.all(runners);
}

async function main(): Promise<void> {
  // グリフはユニコード 256 文字単位の固定レンジ（0-255 〜 65280-65535）
  const fontPaths = FONT_STACKS.flatMap((font) =>
    Array.from({ length: 256 }, (_, i) => {
      const start = i * 256;
      return `fonts/${font}/${start}-${start + 255}.pbf`;
    })
  );
  const allPaths = [
    ...fontPaths,
    'fonts/OFL.txt', // Noto Sans のライセンス
    ...SPRITE_FILES,
  ];

  console.log(`⬇️  ${allPaths.length} ファイルをダウンロードします...`);
  await runWithConcurrency(allPaths, download);
  console.log(`✅ 完了: ${OUTPUT_DIR} に保存しました`);
}

main().catch((error: unknown) => {
  console.error('❌ アセット取得に失敗しました:', error);
  process.exit(1);
});
