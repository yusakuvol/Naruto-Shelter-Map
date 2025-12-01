# Phase 4: MVP実装

> **Phase:** 4/5
> **難易度:** ⭐️⭐️⭐️⭐️ Very Hard
> **期間:** 1週間（約40時間）
> **前提条件:** Phase 1, 2, 3 完了
> **実装期間:** 2025-10-16 〜 2025-10-20
> **Status:** ✅ 完了

---

## 🎯 Phase 4 のゴール

動作する **MVP (Minimum Viable Product)** を実装し、以下を達成する：

1. ✅ MapLibre GL JS による地図表示
2. ✅ 避難所データ（GeoJSON）の読み込みと表示
3. ✅ マーカークリックで詳細表示
4. ✅ レスポンシブデザイン（モバイル対応）
5. ✅ PWA設定（Service Worker, Manifest）
6. ✅ オフライン動作対応
7. ✅ Cloudflare Pages デプロイ
8. ✅ Core Web Vitals 最適化（CLS: 0.00）

---

## 📋 実装チェックリスト

### Part 1: MapLibre GL JS 統合

- [x] MapLibre GL JS インストール（v5.9.0）
- [x] react-map-gl インストール（v7.2.5）
- [x] Map コンポーネント作成（`src/components/map/Map.tsx`）
- [x] Globe projection設定（地球儀モード）
- [x] 鳴門市中心座標設定（134.609, 34.173）
- [x] ナビゲーションコントロール追加
- [x] 日本語フォント対応（Noto Sans JP）

### Part 2: 避難所データ表示

- [x] GeoJSONデータ配置（`public/data/shelters.geojson`）
- [x] TypeScript型定義（`src/types/shelter.ts`）
- [x] カスタムフック作成（`src/hooks/useShelters.ts`）
- [x] マーカーコンポーネント実装
- [x] 災害種別による色分け実装
- [x] マーカークリックでポップアップ表示

### Part 3: モバイル対応

- [x] BottomSheet コンポーネント実装
- [x] スワイプジェスチャー対応（Framer Motion）
- [x] 避難所リスト表示（ShelterList）
- [x] レスポンシブレイアウト（Tailwind CSS）
- [x] タッチ操作最適化

### Part 4: PWA設定

- [x] next-pwa インストール
- [x] Service Worker 設定
- [x] Web App Manifest 作成
- [x] PWAアイコン準備（512x512, 192x192）
- [x] オフライン動作確認
- [x] キャッシュ戦略設定

### Part 5: パフォーマンス最適化

- [x] CLS（Cumulative Layout Shift）修正（8.35 → 0.00）
- [x] マーカーのメモ化（useMemo）
- [x] フォント読み込み最適化（display: swap）
- [x] CSS Containment適用
- [x] Lighthouse CI 設定
- [x] Core Web Vitals 達成（LCP: 1.1s, TTFB: 106ms）

### Part 6: CI/CD

- [x] GitHub Actions CI設定（lint, type-check, build）
- [x] Lighthouse CI 自動計測
- [x] Dependabot 設定
- [x] Cloudflare Pages 自動デプロイ

---

## 🏗️ 実装した機能詳細

### 1. MapLibre GL JS 統合

#### 技術選定の理由

| 技術 | 選定理由 |
|------|---------|
| **MapLibre GL JS** | Mapbox GL JS のオープンソースフォーク。商用利用可能、Globe projection対応 |
| **react-map-gl** | React対応のMapLibreラッパー。宣言的なAPI、TypeScript完全対応 |

#### 実装ファイル

- **`src/components/map/Map.tsx`** - メイン地図コンポーネント
- **`src/components/map/MapSkeleton.tsx`** - ローディング時のスケルトンUI（CLS対策）

#### Map.tsx の主要機能

```typescript
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import MapGL, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import { useShelters } from '@/hooks/useShelters';

export function Map(): ReactElement {
  const shelters = useShelters();
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);

  // マーカーをメモ化してレンダリング最適化（CLS削減）
  const markers = useMemo(
    () =>
      shelters.map((shelter) => {
        const [lng, lat] = shelter.geometry.coordinates;
        const color = getShelterColor(shelter.properties.type);

        return (
          <Marker
            key={shelter.properties.id}
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            onClick={() => handleMarkerClick(shelter)}
          >
            {/* マーカーUI */}
          </Marker>
        );
      }),
    [shelters, selectedShelterId, handleMarkerClick]
  );

  return (
    <div className="map-container h-full w-full">
      <MapGL
        initialViewState={{
          longitude: 134.609,
          latitude: 34.173,
          zoom: 13,
        }}
        projection="globe"
        mapStyle="https://demotiles.maplibre.org/style.json"
      >
        {markers}
        <NavigationControl position="top-right" />
      </MapGL>
    </div>
  );
}
```

#### Globe Projection（地球儀モード）

MapLibre GL JS v5.x の新機能「Globe projection」を採用：

- ズームアウト時に地球儀として表示
- 視覚的に美しく、位置関係が直感的
- パフォーマンスへの影響は最小限

---

### 2. 避難所データ表示

#### データ構造

**`public/data/shelters.geojson`**

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [134.609, 34.173]
      },
      "properties": {
        "id": "shelter-001",
        "name": "鳴門市役所",
        "type": "指定避難所",
        "address": "徳島県鳴門市撫養町南浜字東浜170",
        "disaster_types": ["洪水", "津波", "高潮", "地震", "土砂災害"],
        "capacity": 500
      }
    }
  ]
}
```

#### TypeScript型定義

**`src/types/shelter.ts`**

```typescript
import type { Feature, Point } from 'geojson';

export interface ShelterProperties {
  id: string;
  name: string;
  type: '指定避難所' | '指定緊急避難場所' | '福祉避難所';
  address: string;
  disaster_types: DisasterType[];
  capacity?: number;
}

export type DisasterType = '洪水' | '津波' | '高潮' | '地震' | '土砂災害' | '大規模な火事' | '内水氾濫';

export type ShelterFeature = Feature<Point, ShelterProperties>;
```

#### カスタムフック

**`src/hooks/useShelters.ts`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import type { ShelterFeature } from '@/types/shelter';

export function useShelters(): ShelterFeature[] {
  const [shelters, setShelters] = useState<ShelterFeature[]>([]);

  useEffect(() => {
    fetch('/data/shelters.geojson')
      .then((res) => res.json())
      .then((data) => setShelters(data.features))
      .catch((error) => console.error('Failed to load shelters:', error));
  }, []);

  return shelters;
}
```

#### 災害種別による色分け

**`src/lib/shelter-colors.ts`**

```typescript
export function getShelterColor(type: ShelterProperties['type']): string {
  switch (type) {
    case '指定避難所':
      return '#3b82f6'; // blue-500
    case '指定緊急避難場所':
      return '#ef4444'; // red-500
    case '福祉避難所':
      return '#10b981'; // green-500
    default:
      return '#6b7280'; // gray-500
  }
}
```

---

### 3. モバイル対応

#### BottomSheet コンポーネント

**`src/components/mobile/BottomSheet.tsx`**

当初は4状態（closed, peek, half, full）で実装していましたが、**UX改善のため2状態（peek, full）に簡素化**しました（PR #35）。

**主要機能:**
- Framer Motionによるスワイプジェスチャー
- スムーズなアニメーション
- 避難所リスト表示
- タップで詳細表示

**技術的決定:**

| 項目 | 決定内容 | 理由 |
|------|---------|------|
| **状態管理** | 2状態（peek, full） | シンプルで直感的。4状態は複雑すぎた |
| **アニメーション** | Framer Motion | 宣言的なAPI、スワイプジェスチャー簡単 |
| **高さ** | peek: 30vh, full: 90vh | 地図が見えつつリストも見やすい |

#### レスポンシブ戦略

**デスクトップ（≥768px）:**
- サイドバー固定表示
- 地図とリストを並列表示
- ホバー操作対応

**モバイル（<768px）:**
- BottomSheet方式
- スワイプ操作
- タッチ最適化

---

### 4. PWA設定

#### next-pwa 設定

**`next.config.js`**

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // Next.js config
});
```

#### Web App Manifest

**`public/manifest.json`**

```json
{
  "name": "鳴門市避難所マップ",
  "short_name": "避難所マップ",
  "description": "鳴門市の避難所を地図上に表示するPWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

#### Service Worker キャッシュ戦略

**next-pwa のデフォルト戦略:**
- **ナビゲーション:** NetworkFirst（オンライン優先、オフラインでキャッシュ）
- **画像/フォント:** CacheFirst（キャッシュ優先、長期保存）
- **API/データ:** NetworkFirst（常に最新取得、オフライン時のみキャッシュ）

---

### 5. パフォーマンス最適化（CLS修正）

#### 問題: CLS 8.35（非常に悪い）

**原因:**
1. 地図コンテナの高さが未定義（progressive layout calculation）
2. 150個のマーカーを同時レンダリング（メモ化なし）
3. フォント読み込み時のテキストリフロー
4. MapLibre CSSの遅延読み込み

#### 解決策

**1. `src/app/page.tsx` - flexbox高さ修正**

```typescript
// Before: 高さが不定
<div className="flex-1">
  <Map />
</div>

// After: min-h-0 で明示的な高さ
<div className="flex-1 min-h-0">
  <Map />
</div>
```

**2. `src/components/map/Map.tsx` - マーカーメモ化**

```typescript
// useMemoでマーカーをメモ化
const markers = useMemo(
  () => shelters.map((shelter) => <Marker key={shelter.id} ... />),
  [shelters, selectedShelterId, handleMarkerClick]
);
```

**3. `src/app/layout.tsx` - フォント最適化**

```typescript
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  weight: ['400', '700'],
  display: 'swap', // フォント読み込み中のレイアウトシフトを防ぐ
  fallback: ['system-ui', 'sans-serif'],
});
```

**4. `src/app/globals.css` - CSS Containment**

```css
/* 地図コンテナのCLS対策 */
.map-container {
  contain: layout style paint;
  content-visibility: auto;
}
```

#### 結果: CLS 8.35 → 0.00（100%改善）

PR #37で完全修正。Lighthouse CI で継続監視中。

---

### 6. CI/CD設定

#### GitHub Actions ワークフロー

**`.github/workflows/ci.yml`** - コード品質チェック

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm type-check

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

**`.github/workflows/lighthouse.yml`** - パフォーマンス監視

Cloudflare Pages デプロイ完了後、Lighthouse CI で Core Web Vitals を自動計測。

**閾値:**
- Performance: 90+
- Accessibility: 95+
- CLS: 0.1以下
- LCP: 2.5秒以下

**`.github/dependabot.yml`** - 依存関係自動更新

毎週月曜 3:00 JSTに依存関係をチェック、patch/minor更新をグループ化してPR作成。

---

## 🔧 技術的決定（ADR）

### ADR-001: MapLibre GL JS vs Leaflet

**決定:** MapLibre GL JS を採用

**理由:**
- ✅ Globe projection 対応（視覚的に美しい）
- ✅ WebGL ベースで高速レンダリング
- ✅ Vector Tiles 対応（将来の完全オフライン化に有利）
- ✅ TypeScript 完全対応
- ❌ Leaflet は Canvas ベースで重い

---

### ADR-002: react-map-gl vs maplibre-gl 直接利用

**決定:** react-map-gl を採用

**理由:**
- ✅ React宣言的なAPI（`<Map>`, `<Marker>`）
- ✅ TypeScript型定義が充実
- ✅ useMap(), useControl() などのフック提供
- ✅ メンテナンス活発（Uber開発）
- ❌ 直接利用は命令的で複雑

---

### ADR-003: BottomSheet 2状態 vs 4状態

**決定:** 2状態（peek, full）を採用

**理由:**
- ✅ ユーザーにとってシンプルで直感的
- ✅ 実装・メンテナンスが容易
- ✅ バグが少ない
- ❌ 4状態（closed, peek, half, full）は複雑すぎた
- ❌ closedは不要（常に地図が見えるべき）
- ❌ halfとfullの違いが曖昧

**変更履歴:** PR #35で4状態から2状態にリファクタリング

---

### ADR-004: Cloudflare Pages vs Vercel

**決定:** Cloudflare Pages を採用

**理由:**
- ✅ **無料プランで商用利用可能**（Vercelは禁止）
- ✅ **帯域幅無制限**（災害時のアクセス急増に対応）
- ✅ 日本CDN高速
- ✅ Next.js Static Export完全対応
- ❌ Vercel は無料プランが商用禁止

---

### ADR-005: SWR vs TanStack Query (React Query)

**決定:** SWR を**採用せず**、シンプルな `useState + useEffect` を使用

**理由:**
- ✅ MVPでは過剰な機能（キャッシュ、再検証、楽観的更新など）
- ✅ データが静的GeoJSON（頻繁な更新なし）
- ✅ バンドルサイズ削減
- 🔄 Phase 5（データ自動更新）で再検討

---

## 🐛 トラブルシューティング

### Issue 1: CLS スコア 8.35（非常に悪い）

**症状:**
- Lighthouse CIで CLS: 8.35
- 16回のレイアウトシフト（1.1s〜2.7s）
- 地図表示時に画面が激しく揺れる

**原因:**
1. 地図コンテナの高さが未定義（flexboxで計算中）
2. 150個のマーカーを非メモ化でレンダリング
3. フォント読み込み時のテキストリフロー

**解決策:** PR #37
- `min-h-0` で flexbox 高さを明示化
- `useMemo` でマーカーメモ化
- `display: 'swap'` でフォント最適化
- CSS Containment 適用

**結果:** CLS 8.35 → 0.00（100%改善）

---

### Issue 2: Next.js 15 App Router で `<head>` タグエラー

**症状:**
```
Error: You are attempting to export "head" from a component in the app directory...
```

**原因:**
Next.js 15 App Router では `<head>` タグを直接使用できない。

**解決策:**
- `<head>` タグを削除
- CSS/JSの読み込みは `next/script` や `next/link` を使用
- MapLibre CSSは自動バンドルされるため手動読み込み不要

**PR:** #37（e79ee1a）

---

### Issue 3: MapSkeleton で `JSX.Element` 型エラー

**症状:**
```
Type error: Cannot find namespace 'JSX'.
```

**原因:**
React 19 では `JSX.Element` の代わりに `ReactElement` を使用すべき。

**解決策:**
```typescript
// Before
export function MapSkeleton(): JSX.Element {

// After
import type { ReactElement } from 'react';
export function MapSkeleton(): ReactElement {
```

**PR:** #37（0e98332）

---

### Issue 4: pnpm version conflict in GitHub Actions

**症状:**
```
Error: Multiple versions of pnpm specified:
  - version 9 in the GitHub Action config
  - version pnpm@9.0.0 in package.json
```

**原因:**
`pnpm/action-setup@v4` は `package.json` の `packageManager` フィールドから自動的にバージョンを読み取るため、明示的に `version: 9` を指定すると競合する。

**解決策:** PR #39
```yaml
# Before
- uses: pnpm/action-setup@v4
  with:
    version: 9

# After
- uses: pnpm/action-setup@v4
```

---

### Issue 5: BottomSheet スワイプジェスチャーのバグ

**症状:**
- スワイプ後に意図しない状態になる
- 4状態（closed, peek, half, full）の遷移ロジックが複雑でバグが多発

**解決策:** PR #35
- **4状態 → 2状態にリファクタリング**
- シンプルな状態管理で安定性向上
- コード量 30% 削減

---

## 📊 成果指標

### Core Web Vitals（PR #37 後）

| 指標 | 目標 | 達成値 | 状態 |
|------|------|-------|------|
| **LCP** (Largest Contentful Paint) | <2.5s | 1.1s | ✅ Good |
| **CLS** (Cumulative Layout Shift) | <0.1 | 0.00 | ✅ Good |
| **TTFB** (Time to First Byte) | <800ms | 106ms | ✅ Excellent |

### Lighthouse スコア

| カテゴリ | 目標 | 達成値 | 状態 |
|---------|------|-------|------|
| Performance | 90+ | 98 | ✅ |
| Accessibility | 95+ | 100 | ✅ |
| Best Practices | 95+ | 100 | ✅ |
| SEO | 95+ | 100 | ✅ |
| PWA | 100 | 100 | ✅ |

### コード品質

| 指標 | 状態 |
|------|------|
| TypeScript エラー | 0件 ✅ |
| Biome Lint エラー | 0件 ✅ |
| CI/CD | All passing ✅ |

---

## 🚀 デプロイ

### Cloudflare Pages

**デプロイURL:** https://4d4aca8a.naruto-shelter-map.pages.dev/

**自動デプロイ:**
- `main` ブランチへのプッシュで自動デプロイ
- PRごとにプレビュー環境作成
- ビルド時間: 約1分

**設定:**
- Framework: Next.js (Static HTML Export)
- Build command: `pnpm build`
- Build output directory: `out`
- Node version: 20

---

## 📝 既知の問題・制限事項

### 制限事項（2025-12-01時点）

1. **完全オフライン対応（実装中）**
   - ✅ MapLibre Vector Tiles対応を実装中（Issue #188）
   - Vector TilesをService Workerでキャッシュし、完全オフライン環境でも地図を表示可能に

**注記:** 以下の機能は Phase 5-8 で実装済み：
- ✅ 検索機能（避難所名・住所で検索）
- ✅ 災害種別フィルタ機能
- ✅ 現在地表示機能
- ✅ 距離順ソート機能

### 既知のバグ

なし（2025-10-20時点）

---

## 🔄 Next Steps

Phase 4（MVP）完了後、Phase 5-8 で以下の機能拡張を実装済み：

1. ✅ **災害種別フィルタ機能** - 完了
2. ✅ **現在地表示機能** - 完了
3. ✅ **距離順ソート機能** - 完了
4. ✅ **GitHub Actions - データ自動更新** - 完了
5. ✅ **検索機能** - 完了
6. ✅ **ルート案内機能** - 完了
7. ✅ **PWA対応** - 完了
8. ✅ **災害情報統合** - 完了

詳細は `.docs/05-phase-enhancements.md` を参照。

---

## 📚 参考リンク

### プロジェクト内ドキュメント

- [Phase 1: README更新](./.docs/01-phase-readme.md)
- [Phase 2: AI環境整備](./.docs/02-phase-ai-env.md)
- [Phase 3: 開発環境整備](./.docs/03-phase-dev-env.md)
- [MASTER PLAN](./.docs/00-MASTER-PLAN.md)
- [AGENTS.md](../AGENTS.md)
- [CLAUDE.md](../CLAUDE.md)

### Pull Requests

- [PR #35: BottomSheet 4状態→2状態リファクタリング](https://github.com/yusakuvol/Naruto-Shelter-Map/pull/35)
- [PR #37: CLS修正（8.35→0.00）](https://github.com/yusakuvol/Naruto-Shelter-Map/pull/37)
- [PR #38: CI/CD設定](https://github.com/yusakuvol/Naruto-Shelter-Map/pull/38)
- [PR #39: GitHub Actions pnpm修正](https://github.com/yusakuvol/Naruto-Shelter-Map/pull/39)

### 技術ドキュメント

- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [react-map-gl](https://visgl.github.io/react-map-gl/)
- [Next.js 15](https://nextjs.org/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [next-pwa](https://github.com/shadowwalker/next-pwa)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Core Web Vitals](https://web.dev/vitals/)

---

**Phase 4 完了日:** 2025-10-20

**次のフェーズ:** [Phase 5: 機能拡張](./.docs/05-phase-enhancements.md)（作成予定）
