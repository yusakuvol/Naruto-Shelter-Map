# 開発ワークフロー

> 日常の開発・PR・マージの手順です。AGENTS.md の Git ワークフローに準拠します。

---

## ブランチ戦略

- **main** は保護ブランチ。直接コミット・push は行わない。
- 機能・修正・ドキュメントはすべて **作業ブランチ** で行い、**Pull Request** で main にマージする。

### ブランチ命名

| プレフィックス | 用途 | 例 |
|----------------|------|-----|
| `feature/*` | 新機能 | `feature/disaster-filter` |
| `fix/*` | バグ修正 | `fix/map-marker-position` |
| `docs/*` | ドキュメント | `docs/update-readme` |
| `refactor/*` | リファクタリング | `refactor/extract-map-utils` |
| `chore/*` | 依存関係・設定など | `chore/update-dependencies` |

---

## 作業の流れ

### 1. 作業ブランチを作成

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. 開発・コミット

- 変更を加えたら、**コミット前に必ず** 以下を実行する：
  - `pnpm lint`（必要なら `pnpm lint:fix`）
  - `pnpm type-check`
  - （任意）`pnpm build`

- コミットメッセージは **Conventional Commits** に従う：
  - `feat(scope): 説明`
  - `fix(scope): 説明`
  - `docs: 説明` など

```bash
git add .
git commit -m "feat(filter): Add disaster type filter"
```

### 3. リモートに push

```bash
git push -u origin feature/your-feature-name
```

### 4. Pull Request 作成

- GitHub で「Compare & pull request」から PR を作成する。
- タイトルも Conventional Commits 形式を推奨。
- 本文に変更内容・テスト方法を簡潔に書く。

### 5. マージ後

- main にマージされたら、ローカルの main を更新し、作業ブランチを削除する。

```bash
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

---

## 禁止事項

- main への直接コミット・force push
- Lint / 型チェックを通さないままの push
- 他人のブランチの履歴改変（rebase 等）

---

## 関連

- [AGENTS.md](../../AGENTS.md)（Git ワークフロー・コミット規約）
- [デプロイ](./deployment.md)
- [トラブルシューティング](./troubleshooting.md)
