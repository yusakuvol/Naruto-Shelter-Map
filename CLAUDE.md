# CLAUDE.md

> **Claude Code 専用設定ファイル**
>
> このファイルは、Claude Code（Anthropic社のAI Coding Agent）がプロジェクトを理解し、最適なコード生成を行うための設定を定義します。

**Last Updated:** 2025-10-16
**Claude Code Version:** Compatible with Claude Code 0.7+

---

## 📋 プロジェクト情報

**プロジェクト名:** 鳴門市避難所マップ (Naruto Shelter Map)
**プロジェクトタイプ:** Progressive Web App (PWA)
**フレームワーク:** Next.js 15 (App Router + Turbopack)
**パッケージマネージャー:** pnpm 9.x
**言語:** TypeScript 5.x

---

## 🚀 クイックスタート

### 初回セットアップ

```bash
# 1. pnpmインストール（未インストールの場合）
npm install -g pnpm

# 2. 依存関係インストール
pnpm install

# 3. 開発サーバー起動
pnpm dev
```

### 頻繁に使うコマンド

```bash
# 開発サーバー（Turbopack）
pnpm dev

# ビルド
pnpm build

# Lint + Format（Biome）
pnpm lint        # チェックのみ
pnpm lint:fix    # 自動修正

# Format（Biome）
pnpm format       # 自動フォーマット
pnpm format:check # チェックのみ

# 型チェック
pnpm type-check
```

---

## 📚 重要なドキュメント

Claude Codeがコード生成前に参照すべきドキュメント：

### 必須参照（会話開始時に自動読み込み推奨）

1. **AGENTS.md** - AI Agent標準規格
   - プロジェクト概要
   - 技術スタック詳細
   - コーディング規約
   - 命名規則

2. **.docs/00-MASTER-PLAN.md** - プロジェクト全体計画
   - フェーズ概要
   - 実装ロードマップ
   - データフロー

### 技術リファレンス

3. **.docs/tech-updates-2025.md** - 2025年技術スタック更新ガイド
   - React 19新機能（use, useActionState, useOptimistic, ref as props）
   - Tailwind v4 CSS-First設定
   - Biome設定方法

4. **.docs/pnpm-guide.md** - pnpm完全ガイド
   - npmとの対応表
   - トラブルシューティング

### フェーズ別プラン

5. **.docs/01-phase-readme.md** - README更新（完了）
6. **.docs/02-phase-ai-env.md** - AI環境整備（進行中）
7. **.docs/03-phase-dev-env.md** - 開発環境整備（次のフェーズ）

---

## 🎯 Claude Code 動作指針

### 1. コード生成時の優先事項

#### TypeScript厳格性
- `any`は絶対に使わない → `unknown`または適切な型を使用
- すべての関数に明示的な戻り値の型を定義
- `strict: true`を遵守

#### React 19新機能の積極活用
- Server Componentsをデフォルトで使用（`'use client'`は必要最小限）
- `use` hookでPromiseを直接読み取り
- `useActionState`でフォーム状態管理
- `ref as props`（forwardRef不要）

#### Tailwind v4 CSS-First
- `tailwind.config.ts`は存在しない（v4ではCSSベース）
- カスタムテーマは`globals.css`の`@theme`ブロックで定義
- ユーティリティクラス優先、インラインスタイル禁止

#### アクセシビリティ第一
- セマンティックHTML使用（`<div>`より`<nav>`, `<main>`, `<article>`）
- ARIA属性を適切に付与
- キーボード操作対応
- スクリーンリーダー対応

### 2. ファイル作成時のルール

#### 新規コンポーネント作成
```typescript
// ✅ Good - Server Component（デフォルト）
// src/components/map/Map.tsx
import type { FC } from 'react';
import maplibregl from 'maplibre-gl';

interface MapProps {
  center: [number, number];
  zoom: number;
}

export const Map: FC<MapProps> = ({ center, zoom }) => {
  // Server Component実装
  return <div className="h-screen w-full">地図</div>;
};
```

```typescript
// ✅ Good - Client Component（インタラクティブ時のみ）
// src/components/search/SearchBar.tsx
'use client';

import { useState, type FC } from 'react';

export const SearchBar: FC = () => {
  const [query, setQuery] = useState('');

  return (
    <input
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      className="w-full px-4 py-2 border rounded-lg"
      placeholder="避難所を検索"
      aria-label="避難所を検索"
    />
  );
};
```

#### 新規ユーティリティ作成
```typescript
// src/lib/geojson.ts
import type { FeatureCollection, Feature, Point } from 'geojson';
import type { ShelterProperties } from '@/types/shelter';

export function parseGeoJSON(
  data: unknown
): FeatureCollection<Point, ShelterProperties> {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid GeoJSON data');
  }

  // 型ガード実装
  // ...
}
```

### 3. コミットメッセージ生成

**Conventional Commits** 形式を厳守:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**例:**
```
feat(map): Add MapLibre GL JS integration

- Install maplibre-gl ^5.9.0
- Create Map component with Globe projection
- Add basic map controls (zoom, navigation)
- Implement Naruto City center coordinates (134.609, 34.173)

Refs: .docs/03-phase-dev-env.md
```

```
fix(search): Fix shelter search not filtering correctly

- Add null check for shelter.name before filtering
- Update search logic to support partial matches

Fixes #42
```

```
docs(readme): Update data update frequency to weekly

Changed from daily (3:00 JST) to weekly (Monday 3:00 JST)
to match actual data update frequency from government API.
```

### 4. エラーハンドリング戦略

#### フロントエンド
```typescript
// ✅ Good - Error Boundary使用
// src/app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">エラーが発生しました</h2>
      <button
        onClick={reset}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
      >
        再試行
      </button>
    </div>
  );
}
```

#### データ取得
```typescript
// ✅ Good - try-catch + ユーザーフレンドリーなエラーメッセージ
export async function fetchShelters(): Promise<ShelterFeature[]> {
  try {
    const response = await fetch('/data/shelters.geojson');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return parseGeoJSON(data).features;
  } catch (error) {
    console.error('Failed to fetch shelters:', error);
    // オフラインデータをフォールバック
    return loadOfflineShelters();
  }
}
```

---

## 🛠️ 開発ワークフロー

### ブランチ戦略

```
main          - 本番環境（Cloudflare Pages 自動デプロイ）
└─ develop    - 開発環境
   └─ feature/map-component       - 機能開発
   └─ fix/search-bug              - バグ修正
   └─ docs/update-readme          - ドキュメント更新
```

### ⚠️ IMPORTANT: mainブランチ保護ルール（AI Agent必読）

**mainブランチは保護されており、直接コミット禁止です。**

**すべての変更は以下の手順で実施:**

1. **作業ブランチを作成**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **変更をコミット**
   ```bash
   git add .
   git commit -m "feat: your changes"
   ```

3. **リモートにプッシュ**
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Pull Request作成**
   ```bash
   gh pr create --title "feat: Add new feature" --body "Description"
   ```

5. **マージ後、ブランチ削除**
   ```bash
   git checkout main
   git pull
   git branch -d feature/your-feature-name
   ```

**ブランチ命名規則:**
- `feature/*` - 新機能追加
- `fix/*` - バグ修正
- `docs/*` - ドキュメント更新
- `refactor/*` - リファクタリング
- `chore/*` - ビルド・依存関係更新など

**例:**
- `feature/add-disaster-filter`
- `fix/search-bug`
- `docs/update-readme`

### タスク実行順序

1. **機能開発前**
   - 関連する`.docs/`ドキュメントを読む
   - `AGENTS.md`のコーディング規約を確認

2. **コード実装**
   - TypeScript厳格性遵守
   - Biomeルール準拠
   - アクセシビリティ対応

3. **コミット前**
   ```bash
   pnpm lint        # Lint + Formatチェック
   pnpm type-check  # 型チェック
   ```

4. **コミット**
   - Conventional Commits形式
   - 適切なスコープとタイプ

5. **プッシュ前**
   ```bash
   pnpm build       # ビルド確認
   ```

---

## 🧩 Claude Code タスク例

### 例1: 新規コンポーネント作成

**ユーザー:** 「避難所マーカーコンポーネントを作成して」

**Claude Codeの応答:**
1. `AGENTS.md`のコーディング規約を参照
2. Server Componentで作成（デフォルト）
3. TypeScriptで型安全に実装
4. Tailwindでスタイリング
5. `pnpm lint`でチェック

### 例2: バグ修正

**ユーザー:** 「検索機能が動かない」

**Claude Codeの応答:**
1. エラーログ確認
2. 関連ファイル読み込み（`SearchBar.tsx`, `useShelters.ts`）
3. デバッグ
4. 修正コード提案
5. `fix(search): ...` 形式でコミットメッセージ生成

### 例3: ドキュメント更新

**ユーザー:** 「README.mdのインストール手順を更新して」

**Claude Codeの応答:**
1. `README.md`読み込み
2. `.docs/pnpm-guide.md`参照
3. pnpm最新の手順に更新
4. `docs(readme): ...` 形式でコミットメッセージ生成

---

## 📖 よくある質問（FAQ）

### Q1: npmコマンドを使いたい
**A:** このプロジェクトは **pnpm専用** です。npmは使用しないでください。

```bash
# ❌ Bad
npm install react

# ✅ Good
pnpm add react
```

### Q2: ESLintやPrettierの設定ファイルはどこ？
**A:** このプロジェクトは **Biome** を使用しており、ESLint/Prettierは使っていません。

設定ファイル: `biome.json`

### Q3: Tailwind設定ファイル（tailwind.config.ts）が見つからない
**A:** Tailwind v4は **CSS-First設定** のため、`tailwind.config.ts`は不要です。

設定場所: `src/app/globals.css`の`@theme`ブロック

### Q4: forwardRefを使うべき？
**A:** React 19では **ref as props** がサポートされており、forwardRefは不要です。

```typescript
// ❌ Bad（React 18以前）
const MapContainer = forwardRef((props, ref) => {
  return <div ref={ref} />;
});

// ✅ Good（React 19）
function MapContainer({ ref }: { ref: React.Ref<HTMLDivElement> }) {
  return <div ref={ref} />;
}
```

---


---

## 🔗 参考リンク

### プロジェクト内
- [AGENTS.md](./AGENTS.md) - AI Agent標準規格
- [README.md](./README.md) - プロジェクトREADME
- [.docs/](./.docs/) - プロジェクトドキュメント集

### 外部リソース
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [pnpm Documentation](https://pnpm.io/)
- [React 19 Documentation](https://react.dev/)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Biome](https://biomejs.dev/)

---

## 🔄 更新履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-10-16 | 初版作成（2025年最新技術スタック対応） |

---

**Claude Codeへのメッセージ:**

このプロジェクトは、2025年最新の技術スタック（pnpm, React 19, Tailwind v4, Biome）を採用しています。

コード生成時は、必ず`AGENTS.md`のコーディング規約に従い、型安全性・アクセシビリティ・パフォーマンスを重視してください。

不明点があれば、`.docs/`配下のドキュメントを参照してください。

**あなたの生成するコードが、災害時に人々の命を救う可能性があります。**
**品質にこだわり、最高のコードを書いてください。**
