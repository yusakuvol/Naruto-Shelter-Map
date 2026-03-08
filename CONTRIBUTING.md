# Contributing

鳴門避難マップへのコントリビューションをご検討いただきありがとうございます。

## セットアップ

### 必要な環境

- **Node.js** >= 24.0.0
- **pnpm** >= 9.0.0（npm / yarn は使用しません）

### 手順

```bash
# リポジトリをクローン
git clone https://github.com/yusakuvol/Naruto-Shelter-Map.git
cd Naruto-Shelter-Map

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev
```

`http://localhost:5173` でアプリが表示されます。

## ブランチ戦略

`main` ブランチは保護されており、直接コミットできません。作業ブランチを作成して PR を出してください。

### ブランチ命名規則

| プレフィックス | 用途 | 例 |
|---|---|---|
| `feature/*` | 新機能 | `feature/disaster-filter` |
| `fix/*` | バグ修正 | `fix/map-marker-position` |
| `docs/*` | ドキュメント | `docs/update-readme` |
| `refactor/*` | リファクタリング | `refactor/extract-map-utils` |
| `chore/*` | その他 | `chore/update-dependencies` |

### PR の出し方

```bash
# 1. main から作業ブランチを作成
git checkout main && git pull
git checkout -b feature/my-feature

# 2. 変更をコミット（後述のコミット規約に従う）
git add <files>
git commit -m "feat(scope): 変更内容"

# 3. プッシュして PR を作成
git push -u origin feature/my-feature
gh pr create --title "feat(scope): 変更内容" --body "## Summary\n- 変更の説明"
```

## コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/ja/) に従います。

```
<type>(<scope>): <subject>
```

### Type 一覧

| Type | 用途 |
|---|---|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメント |
| `style` | フォーマット（動作に影響なし） |
| `refactor` | リファクタリング |
| `perf` | パフォーマンス改善 |
| `chore` | ビルド・設定変更 |

### 例

```
feat(map): MapLibre のクラスタリング表示を追加
fix(filter): 津波フィルタが反映されない問題を修正
docs(readme): Architecture セクションを追加
```

## コード品質チェック

コミット前に以下を必ず実行してください。CI でも同じチェックが走ります。

```bash
# Lint（Biome）
pnpm lint

# Lint エラーの自動修正
pnpm lint:fix

# 型チェック（TypeScript）
pnpm type-check

# テスト
pnpm test:run

# ビルド確認（推奨）
pnpm build
```

すべてのチェックが通ってからコミットしてください。

## データ更新スクリプト

避難所データは `scripts/` 配下のスクリプトで管理しています。通常は GitHub Actions が毎週自動実行しますが、手動でも実行できます。

| スクリプト | コマンド | 説明 |
|---|---|---|
| `fetch-shelters.ts` | `pnpm tsx scripts/fetch-shelters.ts` | 国土地理院 API から避難所データを取得し `public/data/shelters.geojson` を更新 |
| `validate-shelters.ts` | `pnpm validate:shelters` | 座標・住所の整合性チェック、対象地域の範囲外データを検出 |
| `geocode-shelters.ts` | `pnpm geocode:shelters` | Nominatim API で住所→座標の整合性を検証（レート制限あり、約 2.5 分） |
