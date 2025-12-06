# AGENTS.md

> **AI Agent Standard Specification for Naruto Shelter Map**
>
> このドキュメントは、AI Coding Agents（Claude, Cursor, GitHub Copilot, etc.）がプロジェクトを理解し、適切なコードを生成するための標準規格です。

**Last Updated:** 2025-11-14
**Project Version:** 1.0.0
**AI Agent Compatibility:** Claude Code, Cursor, GitHub Copilot, Windsurf

---

## 📋 プロジェクト概要

### プロジェクト名
**鳴門市避難所マップ (Naruto Shelter Map)**

### 説明
徳島県鳴門市の公的避難所を地図上に可視化し、**オフライン環境でも避難情報を確認できる** Progressive Web App (PWA)。

国土地理院・国土交通省のオープンデータを活用し、地図上に避難所の位置・種別・災害対応情報を表示します。スマートフォンにインストールしておけば、電波がない状況でも最後に閲覧した地図範囲と避難所情報を保持できます。

### 主要機能
- 📍 避難所の位置表示（鳴門市内の指定避難所・緊急避難場所）
- 🌐 オンライン/オフライン対応
- 📶 完全オフライン動作（Service Worker による地図タイルキャッシュ）
- 🔍 避難所検索（名前・住所・災害種別）
- 📱 PWA対応（ホーム画面に追加可能）
- ♿ アクセシビリティ対応

### リポジトリ
- **GitHub:** https://github.com/[your-username]/naruto-shelter-map
- **ライセンス:** MIT
- **オーナー:** Yusaku Matsukawa

---

## 🏗️ 技術スタック（2025年最新版）

### パッケージマネージャー
| 技術 | バージョン | 特徴 |
|------|-----------|------|
| **pnpm** | 9.x | npmより3倍高速、ディスク効率的、厳密な依存関係管理 |

**重要:** このプロジェクトでは **pnpm 9.x 以上**を必須とします。npmやyarnは使用しません。

### フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Next.js** | 16.x | React フレームワーク（App Router + Turbopack + MCP対応、本番ビルドはWebpack） |
| **React** | 19.x | UI ライブラリ（Server Components, Actions対応） |
| **TypeScript** | 5.x | 型安全性 |
| **Tailwind CSS** | v4 | スタイリング（Lightning CSS統合、システムフォント使用） |

### 地図・データ
| 技術 | バージョン | 用途 |
|------|-----------|------|
| **MapLibre GL JS** | 5.14.x | オープンソース地図ライブラリ（Globe rendering対応） |
| **GeoJSON** | - | 避難所データフォーマット |

### 開発ツール（2025最新）
| ツール | 用途 | 従来比 |
|--------|------|--------|
| **Biome** | Lint + フォーマット（統一ツール） | ESLint+Prettierより20倍高速 |

### インフラ
| サービス | 用途 |
|---------|------|
| **Cloudflare Pages** | 静的ホスティング + CDN |
| **GitHub Actions** | CI/CD + データ自動更新（毎週月曜 3:00 JST） |

---

## 📂 ディレクトリ構造

```
naruto-shelter-map/
├── .docs/                        # プロジェクトドキュメント（AI駆動開発用）
│   ├── 00-MASTER-PLAN.md         # プロジェクト全体計画
│   ├── 01-phase-readme.md        # Phase 1: README更新
│   ├── 02-phase-ai-env.md        # Phase 2: AI環境整備
│   ├── 03-phase-dev-env.md       # Phase 3: 開発環境整備
│   ├── tech-updates-2025.md      # 2025年技術スタック更新ガイド
│   ├── pnpm-guide.md             # pnpm完全ガイド
│   └── README.md                 # ドキュメントインデックス
├── .github/
│   └── workflows/
│       └── update-shelters.yml   # データ自動更新ワークフロー
├── public/
│   ├── data/
│   │   └── shelters.geojson      # 避難所データ（自動更新）
│   ├── icons/                    # PWAアイコン
│   ├── manifest.json             # PWA Manifest
│   └── sw.js                     # Service Worker
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── page.tsx              # トップページ（地図画面）
│   │   └── globals.css           # グローバルスタイル（Tailwind v4）
│   ├── components/               # Reactコンポーネント
│   │   ├── map/
│   │   │   ├── Map.tsx           # MapLibre地図コンポーネント
│   │   │   ├── ShelterMarker.tsx # 避難所マーカー
│   │   │   └── MapControls.tsx   # 地図コントロール
│   │   ├── search/
│   │   │   ├── SearchBar.tsx     # 検索バー
│   │   │   └── SearchResults.tsx # 検索結果
│   │   └── ui/                   # 共通UIコンポーネント
│   ├── lib/                      # ユーティリティ・ヘルパー
│   │   ├── geojson.ts            # GeoJSON処理
│   │   ├── offline.ts            # オフライン対応
│   │   └── utils.ts              # 汎用ユーティリティ
│   ├── types/                    # TypeScript型定義
│   │   ├── shelter.ts            # 避難所データ型
│   │   └── map.ts                # 地図関連型
│   └── hooks/                    # カスタムフック
│       ├── useMap.ts             # 地図操作
│       ├── useShelters.ts        # 避難所データ取得
│       └── useOffline.ts         # オフライン状態検出
├── scripts/                      # ビルド・データ処理スクリプト
│   └── fetch_shelters.ts         # 国土地理院APIから避難所データ取得
├── biome.json                    # Biome設定（Lint + Format）
├── next.config.js                # Next.js設定
├── package.json                  # パッケージ定義（pnpm）
├── pnpm-lock.yaml                # pnpm ロックファイル
├── .npmrc                        # pnpm設定
├── tsconfig.json                 # TypeScript設定
├── AGENTS.md                     # このファイル（AI Agent規格）
└── README.md                     # プロジェクトREADME
```

---

## 🎯 コーディング規約

### 一般原則
- **TypeScript 必須**: すべての`.ts`, `.tsx`ファイルで型定義を明示
- **厳密モード**: `strict: true` を遵守
- **`any`禁止**: `unknown`または適切な型を使用
- **関数型プログラミング優先**: 純粋関数、イミュータブルなデータ構造
- **コンポーネント分割**: 1ファイル100行以下を目安に適切に分割

### TypeScript
```typescript
// ✅ Good
interface ShelterProperties {
  name: string;
  type: 'designated' | 'emergency';
  address: string;
  disaster_types: string[];
  capacity: number;
  source: string;
  updated_at: string;
}

type ShelterFeature = {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: ShelterProperties;
};

// ❌ Bad
const shelter: any = { ... }; // any 使用禁止
```

### React / Next.js
```typescript
// ✅ Good - Server Component（デフォルト）
async function ShelterList() {
  const shelters = await fetch('/api/shelters').then(r => r.json());
  return <ul>{shelters.map(s => <li key={s.id}>{s.name}</li>)}</ul>;
}

// ✅ Good - Client Component（インタラクティブ時）
'use client';

import { useState } from 'react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}

// ✅ Good - ref as props（React 19）
function MapContainer({ ref }: { ref: React.Ref<HTMLDivElement> }) {
  return <div ref={ref} className="h-screen w-full" />;
}

// ❌ Bad - 不要な forwardRef（React 19では不要）
const MapContainer = forwardRef((props, ref) => { ... });
```

### Tailwind CSS v4
```css
/* ✅ Good - CSS-First設定 */
/* src/app/globals.css */
@import "tailwindcss";

@layer base {
  html {
    @apply antialiased;
  }
}

@theme {
  --color-primary-500: oklch(0.5 0.2 200);
  --color-primary-600: oklch(0.45 0.25 200);
}
```

```tsx
// ✅ Good - ユーティリティクラス
<div className="flex items-center justify-between p-4 bg-white shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">避難所マップ</h1>
</div>

// ❌ Bad - インラインスタイル（Tailwindあるのに使わない）
<div style={{ display: 'flex', padding: '16px' }}>...</div>
```

---

## 🔤 命名規則

### ファイル・ディレクトリ
```
components/
  map/
    Map.tsx              # PascalCase（React コンポーネント）
    ShelterMarker.tsx
lib/
  geojson.ts           # camelCase（ユーティリティ）
  offline.ts
types/
  shelter.ts           # camelCase（型定義）
hooks/
  useMap.ts            # camelCase + 'use' prefix（フック）
  useShelters.ts
```

### 変数・関数
```typescript
// ✅ Good
const shelterData = []; // camelCase（変数）
function fetchShelters() {} // camelCase（関数）
const MAPLIBRE_API_KEY = '...'; // UPPER_SNAKE_CASE（定数）

interface ShelterProperties {} // PascalCase（型・インターフェース）
type ShelterFeature = {}; // PascalCase

export function Map() {} // PascalCase（React コンポーネント）
export const useMap = () => {}; // camelCase + 'use' prefix（フック）

// ❌ Bad
const shelter_data = []; // snake_case禁止（JavaScriptでは非推奨）
function FetchShelters() {} // PascalCaseは関数では使わない（コンポーネント以外）
```

---

## 📦 Import順序

```typescript
// 1. 外部ライブラリ
import { useState } from 'react';
import maplibregl from 'maplibre-gl';

// 2. 内部モジュール（@/* エイリアス使用）
import { ShelterMarker } from '@/components/map/ShelterMarker';
import { fetchShelters } from '@/lib/geojson';
import type { ShelterFeature } from '@/types/shelter';

// 3. スタイル
import 'maplibre-gl/dist/maplibre-gl.css';
```

---
## 🤖 AI Agent向けガイドライン

### コード生成時の注意点

1. **Server Components優先**
   - Next.js 16では、デフォルトでServer Componentを使用
   - インタラクティブな要素が必要な場合のみ`'use client'`を追加

2. **React 19新機能の活用**
   - `use` hook: Promiseの読み取り
   - `useActionState`: フォーム状態管理（旧useFormState）
   - `ref as props`: forwardRef不要
   - Actions: 非同期トランジション

3. **Tailwind v4 CSS-First設定**
   - `tailwind.config.ts`は不要（削除済み）
   - `globals.css`に`@import "tailwindcss"`を記述
   - テーマ変数は`@theme`ブロックで定義

4. **Biomeによる厳格なコード品質**
   - すべてのコードはBiomeのルールに準拠
   - `pnpm lint`でチェック、`pnpm lint:fix`で自動修正
   - `pnpm format`でフォーマット

5. **pnpm専用コマンド**
   - `npm install` → `pnpm add`
   - `npm run dev` → `pnpm dev`
   - `npm uninstall` → `pnpm remove`

6. **Next.js MCP活用（Next.js 16+）**
   - Next.js 16では、開発サーバーが自動的にMCPエンドポイントを提供
   - `/_next/mcp`でリアルタイムエラー監視、ルート情報取得などが可能
   - AI Agentは`nextjs_runtime`ツールを活用して開発効率を向上

### 生成するコードの品質基準

- ✅ TypeScriptで型安全
- ✅ `any`を使わない
- ✅ アクセシビリティ対応（ARIA属性、セマンティックHTML）
- ✅ レスポンシブデザイン（Tailwindのモバイルファースト）
- ✅ パフォーマンス最適化（React.memo、useMemo、useCallback適切に使用）
- ✅ エラーハンドリング（try-catch、Error Boundary）
- ✅ テスト可能な設計（純粋関数、依存注入）

### コミットメッセージ

**Conventional Commits** 形式を使用:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: コードスタイル（フォーマット）
- `refactor`: リファクタリング
- `perf`: パフォーマンス改善
- `chore`: ビルドプロセス・ツール変更

**例:**
```
feat(map): Add globe rendering mode for MapLibre

- Enable Globe projection in MapLibre config
- Add zoom level threshold for smooth transition
- Update Map component with new projection prop

Closes #123
```

### Git ワークフロー（必須）

#### ⚠️ CRITICAL: mainブランチ保護

**mainブランチは保護されており、直接コミットは禁止されています。**

すべての変更は以下のワークフローに従ってください：

**1. 作業ブランチの作成**
```bash
# 機能追加の場合
git checkout -b feature/shelter-filter

# バグ修正の場合
git checkout -b fix/map-rendering-issue

# ドキュメント更新の場合
git checkout -b docs/api-documentation
```

**2. 変更のコミット**

⚠️ **CRITICAL: コミット前の必須チェック**

CIの失敗を防ぐため、**コミット前に必ず以下のチェックを実行**してください。すべてのチェックが成功してからコミットします。

```bash
# 1. Lintチェック（フォーマットとリント）
pnpm lint

# エラーがある場合は自動修正を試みる
pnpm lint:fix

# 2. 型チェック
pnpm type-check

# 3. ビルドチェック（オプションだが推奨）
pnpm build
```

**チェック手順:**
1. `pnpm lint`を実行 → エラーがあれば`pnpm lint:fix`で自動修正
2. `pnpm type-check`を実行 → TypeScriptエラーがないことを確認
3. すべてのチェックが成功したことを確認してからコミット

**チェックが失敗した場合:**
- ❌ エラーを修正せずにコミットしない
- ❌ CIに任せて後で修正しない
- ✅ ローカルでエラーを修正してからコミット

**コミット例:**
```bash
# チェック実行
pnpm lint && pnpm type-check

# すべて成功したらコミット
git add .
git commit -m "feat(filter): Add disaster type filter component

- Implement filter UI with checkboxes
- Add filter logic to useShelters hook
- Update Map component to reflect filters


Co-Authored-By: Claude <noreply@anthropic.com>"
```

**3. リモートへのプッシュ**
```bash
git push -u origin feature/shelter-filter
```

**4. Pull Request作成**
```bash
gh pr create --title "feat(filter): Add disaster type filter" --body "$(cat <<'EOF'
## Summary
- Add disaster type filter component
- Users can filter shelters by disaster type (flood, tsunami, earthquake, etc.)

## Changes
- New component: \`src/components/filter/DisasterTypeFilter.tsx\`
- Updated: \`src/hooks/useShelters.ts\`
- Updated: \`src/app/page.tsx\`

## Test Plan
- [ ] Filter UI displays correctly
- [ ] Filters work for each disaster type
- [ ] No console errors

EOF
)"
```

**5. マージ後のクリーンアップ**
```bash
# mainブランチに戻る
git checkout main

# 最新の状態を取得
git pull

# 作業ブランチを削除
git branch -d feature/shelter-filter
```

#### ブランチ命名規則

| プレフィックス | 用途 | 例 |
|--------------|------|-----|
| `feature/*` | 新機能追加 | `feature/disaster-filter` |
| `fix/*` | バグ修正 | `fix/map-marker-position` |
| `docs/*` | ドキュメント | `docs/update-readme` |
| `refactor/*` | リファクタリング | `refactor/extract-map-utils` |
| `chore/*` | その他（依存関係更新など） | `chore/update-dependencies` |

#### ⚠️ 絶対にやってはいけないこと

- ❌ mainブランチに直接コミット
- ❌ force push (`git push -f`)
- ❌ 他人のブランチを勝手に書き換え
- ❌ コミット履歴の改変（`git rebase -i`など）
- ❌ Lint/型チェックを通さずにPush

#### ✅ 推奨事項

- ✅ 小さく頻繁にコミット
- ✅ わかりやすいコミットメッセージ
- ✅ **コミット前に必ず`pnpm lint`と`pnpm type-check`を実行**（CI失敗を防ぐ）
- ✅ PR作成前に`pnpm build`で確認
- ✅ 変更内容をPR descriptionに明記

---

## 📚 参考リンク

### 公式ドキュメント
- [pnpm](https://pnpm.io/)
- [React 19](https://react.dev/)
- [Next.js 16](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Biome](https://biomejs.dev/)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)

### プロジェクト内ドキュメント
- `.docs/00-MASTER-PLAN.md` - プロジェクト全体計画
- `.docs/tech-updates-2025.md` - 2025年技術スタック更新ガイド
- `.docs/pnpm-guide.md` - pnpm完全ガイド

---

## 🔄 更新履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.2.0 | 2025-12-06 | ビルド設定改善（Webpack明示指定）、UI改善完了、システムフォント採用 |
| 1.1.0 | 2025-11-14 | Next.js 16へのアップグレード、Next.js MCP対応、CLAUDE.md統合 |
| 1.0.0 | 2025-10-16 | 初版作成（2025年最新技術スタック対応） |

---

**このドキュメントは、AIとの協働開発を最大化するために設計されています。**
**プロジェクトの進化とともに、このファイルも更新してください。**
