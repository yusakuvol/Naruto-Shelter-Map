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

3. **実装 → 手動テスト → リファクタリング**

### 2. コード生成時

- **型安全性を最優先**
  - `any` 型は絶対に使わない
  - すべての関数に戻り値の型を明示

- **コンポーネント分割**
  - 1 ファイル 100 行以内を目安
  - 責務が複数ある場合は分割

- **エラーハンドリング**
  - 非同期処理には必ず `try-catch`
  - ユーザーフレンドリーなエラーメッセージ

### 3. コミット前

- [ ] `pnpm lint` エラー 0 件（Biome）
- [ ] `pnpm format` でフォーマット済み（または `pnpm lint:fix`）
- [ ] `pnpm type-check` 型エラー 0 件
- [ ] 必要に応じて `pnpm build` でビルド確認

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
- `chore`: ビルド・設定・その他

**例:**

```
feat(map): Add MapLibre cluster support

- Implemented marker clustering for better performance
- Added zoom controls

Closes #42
```

---

## 🛠️ Claude Code 特有の注意事項

### ファイル作成・編集時

- **既存ファイルは必ず先に読む**
  - 編集前に Read でファイル内容を確認

- **インポートパスは絶対パス**
  - `@/` エイリアスを使用（`tsconfig.json` で設定済み）
  - 例: `import { Shelter } from '@/types/shelter';`

- **大きな変更は段階的に**
  - 1 度に大量のコードを生成せず、段階的に実装

### デバッグ時

- **エラーメッセージを丁寧に読む**
  - TypeScript エラーは型定義の問題が多い
  - Biome エラーは規約違反

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

1. **質問を恐れない** - 曖昧な指示があれば、ユーザーに確認
2. **段階的に実装** - MVP → 機能追加 → リファクタリング
3. **ドキュメント更新** - コード変更時は `.docs/` も更新
4. **手動テスト** - 実装後は必ず手動で動作確認を行う

---

**最後に:** このプロジェクトの目的は「電波がなくても避難所がわかる」こと。
コードの品質だけでなく、**ユーザー体験**を最優先に考えてください。
