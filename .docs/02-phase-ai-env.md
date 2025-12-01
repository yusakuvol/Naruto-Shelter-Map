# Phase 2: AI環境整備

> **Phase:** 2/5
> **難易度:** ⭐️⭐️ Medium
> **期間:** 1日（約8時間）
> **前提条件:** Phase 1完了推奨（必須ではない）

---

## 🎯 Phase 2 のゴール

AI駆動開発を加速させるための**規約・ドキュメント**を整備し、以下を達成する：

1. **AGENTS.md**: AI Coding Agent（Claude, Cursor, etc.）が読む標準規格ファイルを作成
2. **CLAUDE.md**: Claude Code専用の設定ファイルを作成
3. **`.docs/` 駆動開発**: 詳細なドキュメント体系を構築

### なぜAI環境整備が重要か？

- 🤖 **AIの精度向上**: 明確な規約により、AIが適切なコードを生成
- ⚡ **開発速度UP**: AIが文脈を理解し、ボイラープレート自動生成
- 📚 **知識の蓄積**: ドキュメントが「プロジェクトの脳」となる
- 🔄 **一貫性の保持**: チーム（AI含む）全員が同じ基準でコーディング

---

## 📋 実装チェックリスト

### Part 1: AGENTS.md 作成 ⭐️ 最優先

- [ ] AGENTS.md ファイル作成
- [ ] プロジェクト概要セクション
- [ ] ディレクトリ構造セクション
- [ ] コーディング規約セクション
- [ ] 命名規則セクション
- [ ] テスト戦略セクション
- [ ] AI向けガイドラインセクション

### Part 2: CLAUDE.md 作成

- [ ] CLAUDE.md ファイル作成
- [ ] AGENTS.md への参照設定
- [ ] 開発ワークフロー記載
- [ ] コミット規約記載
- [ ] Claude Code専用の注意事項

### Part 3: .docs/system/ ドキュメント

- [ ] `.docs/system/project-structure.md` 作成
- [ ] `.docs/system/tech-stack.md` 作成
- [ ] `.docs/system/data-schema.md` 作成

### Part 4: .docs/architecture/ ADR

- [ ] `.docs/architecture/adr-001-pwa-framework.md` 作成
- [ ] `.docs/architecture/adr-002-map-library.md` 作成
- [ ] `.docs/architecture/design-principles.md` 作成

### Part 5: .docs/sop/ 手順書

- [ ] `.docs/sop/development-workflow.md` 作成
- [ ] `.docs/sop/deployment.md` 作成
- [ ] `.docs/sop/troubleshooting.md` 作成

---

## 📝 Part 1: AGENTS.md 完全仕様

### AGENTS.md とは？

2025年8月に策定された **AI Coding Agent の標準規格**。

従来は Claude用に `CLAUDE.md`、Cursor用に `.cursorrules`、Windsurf用に `.windsurfrules` など、ツールごとにバラバラだったファイルを統一。

**AGENTS.md** があれば、すべてのAI Agentがこのファイルを読んでプロジェクトを理解する。

### ファイル構成

```markdown
# AGENTS.md

# 鳴門市避難所マップ - AI Agent Instructions

> このファイルは AI Coding Agents（Claude, Cursor, Windsurf など）向けの規約です。
> 人間の開発者も参照できますが、主な対象は AI です。

---

## 📌 プロジェクト概要

**プロジェクト名:** Naruto Shelter Map (鳴門市避難所マップ)

**目的:** 徳島県鳴門市の避難所を地図上に可視化し、オフラインでも利用できるPWAアプリを提供

**技術スタック（2025年最新版）:**
- Package Manager: **pnpm 9.x**
- Frontend: Next.js 15 (App Router + Turbopack), React **19**, TypeScript 5
- Styling: Tailwind CSS **v4** (Lightning CSS統合)
- Map: MapLibre GL JS **5.9**
- PWA: next-pwa 5
- State: SWR (データフェッチ), Zustand (グローバル状態、optional)
- Testing: なし（テストは実装しない）
- Linting/Formatting: **Biome** (ESLint+Prettier置き換え)
- Hosting: Cloudflare Pages
- CI/CD: GitHub Actions

**重要な制約:**
- Node.js 20.x 以上
- **pnpm 9.x 以上**必須（npmは使用しない）
- TypeScript Strict Mode 必須
- **Biome** による厳格なコード品質管理
- 完全な型安全性を保証すること

---

## 📂 ディレクトリ構造

このプロジェクトは以下の構造に従う：

```
naruto-shelter-map/
├── .docs/                      # ドキュメント（AI駆動開発）
│   ├── system/                 # システム仕様
│   ├── architecture/           # アーキテクチャ決定記録
│   └── sop/                    # 標準作業手順
│
├── .github/
│   └── workflows/
│       └── etl.yml             # データ更新自動化
│
├── public/
│   ├── data/
│   │   └── shelters.geojson    # 避難所データ
│   └── icons/                  # PWAアイコン
│
├── scripts/
│   └── fetch_shelters.ts       # データ取得ETLスクリプト
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/             # Reactコンポーネント
│   │   ├── map/
│   │   │   ├── Map.tsx
│   │   │   └── MarkerCluster.tsx
│   │   ├── shelter/
│   │   │   ├── ShelterList.tsx
│   │   │   └── ShelterDetail.tsx
│   │   └── ui/                 # 汎用UIコンポーネント
│   │
│   ├── hooks/                  # カスタムフック
│   │   ├── useShelters.ts
│   │   └── useGeolocation.ts
│   │
│   ├── lib/                    # ユーティリティ
│   │   ├── geojson.ts
│   │   └── maplibre.ts
│   │
│   └── types/                  # TypeScript型定義
│       └── shelter.ts
│
├── AGENTS.md                   # このファイル
├── CLAUDE.md                   # Claude Code設定
└── README.md
```

**ファイル配置ルール:**

1. **`src/app/`**: Next.js App Router のページとレイアウト
2. **`src/components/`**: 再利用可能なReactコンポーネント
   - 機能ごとにフォルダ分割（`map/`, `shelter/`, `ui/`）
3. **`src/hooks/`**: カスタムフック（`use` プレフィックス必須）
4. **`src/lib/`**: ユーティリティ関数、設定ファイル
5. **`src/types/`**: TypeScript型定義（`.ts`ファイル）
6. **`public/data/`**: 静的データファイル（GeoJSON）

---

## 🎨 コーディング規約

### TypeScript

**必須事項:**
- すべてのファイルは `.ts` または `.tsx`
- `any` 型は **禁止**（`unknown` を使用）
- `tsconfig.json` の `strict: true` を遵守
- 明示的な型注釈を推奨（推論に頼りすぎない）

**推奨事項:**
- 関数の戻り値には型を明示
- オブジェクトは `interface` または `type` で定義
- Enum より Union Types を優先

**例:**

```typescript
// ✅ Good
interface Shelter {
  name: string;
  type: '指定避難所' | '緊急避難場所';
  coordinates: [number, number];
}

function getShelters(): Promise<Shelter[]> {
  // ...
}

// ❌ Bad
function getShelters(): any {
  // ...
}
```

---

### React / Next.js

**コンポーネント規約:**

- **関数コンポーネント**のみ使用（クラスコンポーネント禁止）
- **Server Components** をデフォルトとし、必要な場合のみ `'use client'`
- Props は `interface` で型定義
- コンポーネント名は PascalCase
- ファイル名もコンポーネント名と一致（`Map.tsx`, `ShelterList.tsx`）

**例:**

```typescript
// src/components/shelter/ShelterList.tsx
'use client';

import { Shelter } from '@/types/shelter';

interface ShelterListProps {
  shelters: Shelter[];
  onSelectShelter: (shelter: Shelter) => void;
}

export function ShelterList({ shelters, onSelectShelter }: ShelterListProps) {
  return (
    <ul>
      {shelters.map((shelter) => (
        <li key={shelter.id} onClick={() => onSelectShelter(shelter)}>
          {shelter.name}
        </li>
      ))}
    </ul>
  );
}
```

**フック規約:**

- カスタムフックは `use` プレフィックス
- `src/hooks/` に配置
- 1ファイル1フック

**例:**

```typescript
// src/hooks/useShelters.ts
import useSWR from 'swr';
import { Shelter } from '@/types/shelter';

export function useShelters() {
  const { data, error, isLoading } = useSWR<Shelter[]>(
    '/data/shelters.geojson',
    fetcher
  );

  return {
    shelters: data,
    isLoading,
    isError: error,
  };
}
```

---

### Styling

**Tailwind CSS 規約:**

- インラインクラスで記述
- `@apply` は避ける（特別な理由がない限り）
- レスポンシブは `sm:`, `md:`, `lg:` プレフィックス
- ダークモード対応は `dark:` プレフィックス

**例:**

```tsx
<div className="flex flex-col gap-4 p-6 md:flex-row md:gap-6">
  <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500">
    Click
  </button>
</div>
```

---

### 命名規則

| 種類 | 規則 | 例 |
|------|------|------|
| コンポーネント | PascalCase | `Map`, `ShelterList` |
| 関数 | camelCase | `fetchShelters`, `calculateDistance` |
| 変数 | camelCase | `shelterData`, `isLoading` |
| 定数 | UPPER_SNAKE_CASE | `API_ENDPOINT`, `MAX_SHELTERS` |
| 型/Interface | PascalCase | `Shelter`, `GeoJSONFeature` |
| ファイル（コンポーネント） | PascalCase | `Map.tsx` |
| ファイル（ユーティリティ） | kebab-case | `geojson-utils.ts` |

---

### Import順序

```typescript
// 1. React / Next.js
import { useState, useEffect } from 'react';
import Image from 'next/image';

// 2. 外部ライブラリ
import maplibregl from 'maplibre-gl';
import useSWR from 'swr';

// 3. 内部モジュール（絶対パス @/ 使用）
import { Shelter } from '@/types/shelter';
import { useShelters } from '@/hooks/useShelters';
import { Map } from '@/components/map/Map';

// 4. 相対パス（同じディレクトリ）
import './styles.css';
```

---

## 🧪 テスト戦略

**注記:** このプロジェクトではテストは実装しません。手動テストとLighthouse監査で品質を担保します。

**コマンド:**
```bash
pnpm run e2e
pnpm run e2e:ui
```

---

## 🤖 AI Agent向けガイドライン

### コード生成時の注意事項

1. **型安全性を最優先**
   - 推論に頼らず、明示的に型を書く
   - `any` は絶対に使わない

2. **コンポーネント分割**
   - 1コンポーネント = 1責務
   - 100行を超えたら分割を検討

3. **エラーハンドリング**
   - 非同期処理は必ず `try-catch` または `.catch()`
   - ユーザーにエラーメッセージを表示

4. **パフォーマンス**
   - 不要な再レンダリングを避ける（`useMemo`, `useCallback`）
   - 大きなリストは仮想スクロール（react-window）

5. **アクセシビリティ**
   - `aria-label` などの属性を追加
   - キーボード操作対応

### よくある質問

**Q: コンポーネントをServer ComponentとClient Componentのどちらにすべきか？**
A: デフォルトはServer Component。以下の場合のみClient Component：
- `useState`, `useEffect` などのフックを使う
- ブラウザAPIを使う（`window`, `document`）
- インタラクティブな要素（`onClick` など）

**Q: MapLibre GL JSはClient ComponentかServer Componentか?**
A: Client Component（`'use client'` 必須）。MapLibreはブラウザAPIに依存。

**Q: SWRとZustandの使い分けは？**
A:
- SWR: サーバーデータのフェッチ・キャッシング
- Zustand: クライアント側のグローバル状態（フィルタ、選択中の避難所など）

---

## 📚 参考ドキュメント

必要に応じて以下のドキュメントを参照：

- [.docs/system/project-structure.md](/.docs/system/project-structure.md)
- [.docs/system/tech-stack.md](/.docs/system/tech-stack.md)
- [.docs/architecture/design-principles.md](/.docs/architecture/design-principles.md)

---

**重要:** このファイルは生きたドキュメントです。プロジェクトが進化したら更新してください。
```

---

## 📝 Part 2: CLAUDE.md 完全仕様

### CLAUDE.md とは？

Claude Code が**会話開始時に自動的に読み込む**設定ファイル。

AGENTS.md よりもClaude特有の設定を記述する。

### ファイル構成

```markdown
# CLAUDE.md

# Claude Code - Project Configuration

> このファイルは Claude Code 専用の設定ファイルです。
> Claude Code が会話開始時に自動的にこのファイルを読み込みます。

---

## 📖 基本方針

### AGENTS.md を最優先で参照

すべてのコーディング規約とプロジェクト構造は **AGENTS.md** に記載されています。

**Claude Code は AGENTS.md のルールに厳密に従ってください。**

[AGENTS.md を確認する](./AGENTS.md)

---

## 🚀 開発ワークフロー

### 1. タスク開始時

Claude Code がタスクを受け取ったら、以下を実行：

1. **関連ドキュメントを確認**
   - `.docs/` 配下のドキュメントを読む
   - 特に `architecture/` と `sop/` を参照

2. **既存コードを理解**
   - 類似コンポーネントを検索
   - 命名規則とパターンを踏襲

3. **TDD推奨**
   - 実装 → 手動テスト → リファクタリング

### 2. コード生成時

- **型安全性を最優先**
  - `any` 型は絶対に使わない
  - すべての関数に戻り値の型を明示

- **コンポーネント分割**
  - 1ファイル100行以内を推奨
  - 責務が複数ある場合は分割

- **エラーハンドリング**
  - 非同期処理には必ず `try-catch`
  - ユーザーフレンドリーなエラーメッセージ

### 3. コミット前

- [ ] ESLint エラー 0件
- [ ] Prettier でフォーマット済み
- [ ] TypeScript 型エラー 0件
- [ ] テスト合格

---

## 💬 コミットメッセージ規約

### Conventional Commits に従う

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット（コード動作に影響なし）
- `refactor`: リファクタリング
- `chore`: その他の変更
- `chore`: ビルド、設定変更

**例:**

```
feat(map): Add MapLibre cluster support

- Implemented marker clustering for better performance
- Added zoom controls
- Fixed marker icon size on mobile

Closes #42
```

---

## 🛠️ Claude Code特有の注意事項

### ファイル作成・編集時

- **既存ファイルは必ず先に読む**
  - Edit tool を使う前に Read tool でファイル内容を確認

- **インポートパスは絶対パス**
  - `@/` エイリアスを使用（`tsconfig.json` で設定済み）
  - 例: `import { Shelter } from '@/types/shelter';`

- **大きなファイルは分割して提案**
  - 1度に大量のコードを生成せず、段階的に実装

### デバッグ時

- **エラーメッセージを丁寧に読む**
  - TypeScript エラーは型定義の問題が多い
  - ESLint エラーは規約違反

- **console.log は開発時のみ**
  - 本番コードには残さない
  - デバッグ後は削除

---

## 📂 重要なドキュメント

タスクに応じて以下を参照：

### システム仕様
- [.docs/system/project-structure.md](./.docs/system/project-structure.md)
- [.docs/system/tech-stack.md](./.docs/system/tech-stack.md)
- [.docs/system/data-schema.md](./.docs/system/data-schema.md)

### アーキテクチャ
- [.docs/architecture/adr-001-pwa-framework.md](./.docs/architecture/adr-001-pwa-framework.md)
- [.docs/architecture/adr-002-map-library.md](./.docs/architecture/adr-002-map-library.md)
- [.docs/architecture/design-principles.md](./.docs/architecture/design-principles.md)

### 作業手順
- [.docs/sop/development-workflow.md](./.docs/sop/development-workflow.md)
- [.docs/sop/deployment.md](./.docs/sop/deployment.md)
- [.docs/sop/troubleshooting.md](./.docs/sop/troubleshooting.md)

---

## ✨ Claude Code のベストプラクティス

1. **質問を恐れない**
   - 曖昧な指示があれば、ユーザーに確認

2. **段階的に実装**
   - MVP → 機能追加 → リファクタリング

3. **ドキュメント更新**
   - コード変更時は `.docs/` も更新

4. **手動テスト**
   - 実装後は必ず手動で動作確認を行う

---

**最後に:** このプロジェクトの目的は「電波がなくても避難所がわかる」こと。
コードの品質だけでなく、**ユーザー体験**を最優先に考えてください。
```

---

## 📂 Part 3-5: .docs/ 配下のドキュメント構成

### Part 3: .docs/system/

#### `project-structure.md`
- ディレクトリツリーの完全版
- 各フォルダの役割説明
- ファイル配置ルール

#### `tech-stack.md`
- 各技術の詳細説明
- バージョン情報
- なぜその技術を選んだか

#### `data-schema.md`
- GeoJSON スキーマ定義
- TypeScript型定義
- データ検証ルール

---

### Part 4: .docs/architecture/

#### `adr-001-pwa-framework.md`（ADR = Architecture Decision Record）
```markdown
# ADR 001: PWAフレームワークの選定

## ステータス
承認済み

## コンテキスト
オフライン対応のPWAを構築する必要がある。

## 決定
Next.js + next-pwa を採用。

## 理由
- Next.js 15 の App Router が安定
- next-pwa が Service Worker を自動生成
- Cloudflare Pages が Next.js をサポート

## 結果
- 開発速度が向上
- オフライン対応が容易
```

#### `adr-002-map-library.md`
MapLibre GL JS を選んだ理由（Mapbox GL JSではなく）

#### `design-principles.md`
設計思想・原則

---

### Part 5: .docs/sop/

#### `development-workflow.md`
- ブランチ戦略
- PR作成手順
- レビュープロセス

#### `deployment.md`
- Cloudflare Pages 設定
- 環境変数設定
- デプロイ手順

#### `troubleshooting.md`
- よくある問題と解決策
- デバッグ方法

---

## 🎯 実装の優先順位

### 最優先（必須）

1. ✅ `AGENTS.md` 作成
2. ✅ `CLAUDE.md` 作成

### 高優先（推奨）

3. `.docs/system/project-structure.md`
4. `.docs/system/data-schema.md`
5. `.docs/architecture/design-principles.md`

### 中優先（あると良い）

6. `.docs/system/tech-stack.md`
7. `.docs/architecture/adr-001-pwa-framework.md`
8. `.docs/architecture/adr-002-map-library.md`

### 低優先（後回し可）

9. `.docs/sop/development-workflow.md`
10. `.docs/sop/deployment.md`
11. `.docs/sop/troubleshooting.md`

---

## 🚀 Phase 2 完了後

### 次のステップ

- [ ] AGENTS.md と CLAUDE.md が正しく機能するか確認
- [ ] Claude Code を再起動して、CLAUDE.md が自動読み込みされるか確認
- [ ] `.docs/` 配下のドキュメントを必要に応じて追加
- [ ] **Phase 3: 開発環境整備** に進む

### 確認項目

- [ ] AGENTS.md が存在し、AI Agentが読み取り可能
- [ ] CLAUDE.md が存在し、Claude Code が自動読み込み
- [ ] `.docs/` フォルダ構造が整備されている
- [ ] 各ドキュメントが相互リンクされている

---

## 📚 参考リンク

### AGENTS.md

- [Builder.io - AGENTS.md Best Practices](https://www.builder.io/blog/agents-md)
- [Medium - AGENTS.md: The New README for AI](https://medium.com/@algorythmos/agents-md-the-new-readme-for-ai-coding-agents-713828c5c63b)

### Architecture Decision Records

- [ADR GitHub](https://adr.github.io/)
- [ADR Template](https://github.com/joelparkerhenderson/architecture-decision-record)

### Docs-Driven Development

- [Documentation-Driven Development](https://medium.com/lifefunk/documentation-driven-development-how-good-docs-become-your-ai-pair-programming-superpower-e0e574db2f3b)

---

**Next:** [Phase 3: 開発環境整備](./03-phase-dev-env.md)
**Back:** [Phase 1: README更新](./01-phase-readme.md)
