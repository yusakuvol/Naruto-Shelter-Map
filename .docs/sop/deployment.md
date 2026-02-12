# デプロイ手順

> 本番環境（Cloudflare Pages）へのデプロイの考え方と設定の参照先です。

---

## 概要

- **ホスティング:** Cloudflare Pages
- **本番 URL:** https://naruto-shelter-map.pages.dev（例）
- **デプロイ方式:** GitHub の **main** ブランチへの push（またはマージ）に連動した **自動ビルド・デプロイ**

---

## 通常のデプロイ

1. 作業ブランチで開発・コミット
2. Pull Request を作成し、main にマージ
3. Cloudflare Pages が main の更新を検知し、ビルド（`pnpm build` 等）を実行
4. ビルド成功後、自動的に本番サイトに反映

**手動でデプロイする必要は基本的にありません。**

---

## ビルド設定（Cloudflare Pages）

- **ビルドコマンド:** `pnpm build`（または `pnpm install && pnpm build`）
- **ビルド出力ディレクトリ:** `dist`（Vite のデフォルト）。Cloudflare で「Build output directory」を **dist** に設定すること。
- **環境変数:** 必要に応じて Cloudflare ダッシュボードの「Settings → Environment variables」で設定
- **Node バージョン:** `engines.node`（例: >=22）に合わせて設定

---

## 詳細設定

**フルな手順・ビルド設定・カスタムドメイン・トラブルシューティング** は以下を参照してください。

- [.docs/cloudflare-pages-setup.md](../cloudflare-pages-setup.md)

---

## 関連

- [開発ワークフロー](./development-workflow.md)
- [ADR 001: PWA フレームワーク](../architecture/adr-001-pwa-framework.md)
