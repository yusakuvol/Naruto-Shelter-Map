# 📚 プロジェクトドキュメント

> **Naruto Shelter Map** のプロジェクトドキュメント集
>
> このフォルダは **AI駆動開発（Docs-Driven Development）** のために設計されています。
> 人間の開発者とAI Coding Agents（Claude, Cursor, etc.）の両方が参照できます。

---

## 🗂️ ドキュメント構成

### 📋 プラン文書（Phase 0 - 環境整備）

これらの文書は、プロジェクトのセットアップをstep-by-stepで実行するためのガイドです。

| ファイル | 説明 | 優先度 |
|---------|------|--------|
| [00-MASTER-PLAN.md](./00-MASTER-PLAN.md) | プロジェクト全体の俯瞰図・技術スタック・フェーズ概要 | ⭐️⭐️⭐️ |
| [01-phase-readme.md](./01-phase-readme.md) | Phase 1: README.md更新の詳細計画 | ⭐️⭐️⭐️ |
| [02-phase-ai-env.md](./02-phase-ai-env.md) | Phase 2: AI環境整備（AGENTS.md, CLAUDE.md） | ⭐️⭐️⭐️ |
| [03-phase-dev-env.md](./03-phase-dev-env.md) | Phase 3: 開発環境整備（package.json, 設定ファイル） | ⭐️⭐️⭐️ |

---

## 🚀 推奨実行順序

プロジェクトをゼロから構築する場合、以下の順序で実行してください：

### Step 0: プラン理解
```bash
# まずマスタープランを読む
cat .docs/00-MASTER-PLAN.md
```

### Step 1: README更新（所要時間: 約4時間）
```bash
# Phase 1の詳細を確認
cat .docs/01-phase-readme.md

# 実行内容:
# - README.md を整形
# - バッジ、スクリーンショット枠、技術スタック追加
# - セットアップ手順、コントリビューション方法記載
```

**難易度:** ⭐️ Easy
**前提条件:** なし
**成果物:** README.md（更新）

---

### Step 2: AI環境整備（所要時間: 約8時間）
```bash
# Phase 2の詳細を確認
cat .docs/02-phase-ai-env.md

# 実行内容:
# - AGENTS.md 作成（AI Agent標準規格）
# - CLAUDE.md 作成（Claude Code設定）
# - .docs/system/, architecture/, sop/ 作成
```

**難易度:** ⭐️⭐️ Medium
**前提条件:** Phase 1完了推奨（必須ではない）
**成果物:** AGENTS.md, CLAUDE.md, .docs/ 詳細ドキュメント

---

### Step 3: 開発環境整備（所要時間: 約16時間）
```bash
# Phase 3の詳細を確認
cat .docs/03-phase-dev-env.md

# 実行内容:
# - pnpm + package.json 作成（2025最新スタック）
# - Next.js 15 (Turbopack), React 19, Tailwind v4設定
# - Biome設定（Lint + Format統一）
# - ディレクトリ構造作成
# - pnpm dev で起動確認
```

**難易度:** ⭐️⭐️⭐️ Hard
**前提条件:** Phase 1, 2 完了推奨
**成果物:** 完全な開発環境（ローカルで動作可能）

---

### Step 4: MVP実装（所要時間: 約1週間）

**詳細:** Phase 3完了後に `.docs/04-phase-mvp.md` として作成予定

実装内容:
- MapLibre GL JS 地図コンポーネント
- 避難所データ表示
- PWA設定（Service Worker, Manifest）
- オフライン動作
- Cloudflare Pages デプロイ

---

### Step 5: データ自動更新（所要時間: 約3日）

**詳細:** MVP完了後に `.docs/05-phase-automation.md` として作成予定

実装内容:
- `scripts/fetch-shelters.ts` ETLスクリプト
- GitHub Actions ワークフロー
- 自動デプロイ設定

---

## 📂 将来追加予定のドキュメント

以下のドキュメントは、各フェーズ完了後に作成されます：

### system/ - システム仕様

| ファイル | 説明 | ステータス |
|---------|------|----------|
| `system/project-structure.md` | ディレクトリ構造の完全版 | Phase 2で作成 |
| `system/tech-stack.md` | 技術スタック詳細 | Phase 2で作成 |
| `system/data-schema.md` | GeoJSONスキーマ定義 | Phase 2で作成 |

### architecture/ - アーキテクチャ決定記録（ADR）

| ファイル | 説明 | ステータス |
|---------|------|----------|
| `architecture/adr-001-pwa-framework.md` | PWAフレームワーク選定理由 | Phase 2で作成 |
| `architecture/adr-002-map-library.md` | 地図ライブラリ選定理由 | Phase 2で作成 |
| `architecture/design-principles.md` | 設計思想・原則 | Phase 2で作成 |

### sop/ - 標準作業手順（SOP）

| ファイル | 説明 | ステータス |
|---------|------|----------|
| `sop/development-workflow.md` | 開発フロー・ブランチ戦略 | Phase 2で作成 |
| `sop/deployment.md` | デプロイ手順 | Phase 3で作成 |
| `sop/troubleshooting.md` | よくある問題と解決策 | Phase 3で作成 |

### tasks/ - タスク管理

| ファイル | 説明 | ステータス |
|---------|------|----------|
| `tasks/implementation-roadmap.md` | 実装ロードマップ | Phase 4で作成 |
| `tasks/mvp-checklist.md` | MVPチェックリスト | Phase 4で作成 |

---

## 🎯 このドキュメント体系の目的

### 1. **AI駆動開発の加速**
- AI Coding Agents（Claude, Cursor, etc.）がプロジェクトを理解しやすくする
- 明確な規約により、AIが適切なコードを生成
- ボイラープレートの自動生成

### 2. **知識の蓄積**
- プロジェクトの「脳」として機能
- 意思決定の理由を記録（ADR）
- 新メンバーのオンボーディングを効率化

### 3. **一貫性の保持**
- チーム（人間 + AI）全員が同じ基準でコーディング
- コーディング規約、命名規則の明確化
- アーキテクチャ方針の共有

---

## 🤖 AI Agents向けの指示

### Claude Code

1. **会話開始時**
   - `CLAUDE.md` を自動読み込み
   - `AGENTS.md` のルールに従う
   - 必要に応じて `.docs/` 配下を参照

2. **コード生成時**
   - `AGENTS.md` のコーディング規約を遵守
   - `.docs/architecture/` の設計原則に従う
   - テスト駆動開発（TDD）を推奨

3. **タスク実行時**
   - `.docs/sop/` の標準作業手順を参照
   - エラー時は `.docs/sop/troubleshooting.md` を確認

### Cursor / Windsurf / その他

1. **プロジェクト理解**
   - `AGENTS.md` を最初に読む
   - `.docs/00-MASTER-PLAN.md` で全体像を把握

2. **実装前**
   - 該当するフェーズのプラン文書を読む
   - `.docs/architecture/` のADRを確認

---

## 📖 ドキュメント更新ルール

### いつ更新するか

- ✅ 技術スタックを変更したとき
- ✅ 新しいアーキテクチャ決定をしたとき
- ✅ コーディング規約を追加・変更したとき
- ✅ よくある問題の解決策を見つけたとき

### 更新方法

1. 該当するドキュメントを編集
2. 変更理由をコミットメッセージに記載
3. 関連ドキュメントのリンクを更新

例:
```bash
git commit -m "docs: Update AGENTS.md to include MapLibre component guidelines"
```

---

## 🔗 外部リンク

### AI駆動開発

- [AGENTS.md Best Practices](https://www.builder.io/blog/agents-md)
- [Docs-Driven Development](https://medium.com/lifefunk/documentation-driven-development-how-good-docs-become-your-ai-pair-programming-superpower-e0e574db2f3b)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)

### アーキテクチャ決定記録（ADR）

- [ADR GitHub](https://adr.github.io/)
- [ADR Template](https://github.com/joelparkerhenderson/architecture-decision-record)

### プロジェクト管理

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

## 📞 質問・提案

ドキュメントに関する質問や改善提案は、GitHub Issuesまたはプロジェクトオーナーまで。

**Author:** Yusaku Matsukawa
**GitHub:** [Your GitHub Profile]

---

## 📝 バージョン履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0 | 2025-10-16 | 初版作成（Phase 0-3のプラン文書） |

---

**このドキュメント体系は生きています。プロジェクトとともに進化させてください。**
