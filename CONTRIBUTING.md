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
