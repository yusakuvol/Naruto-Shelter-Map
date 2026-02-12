# トラブルシューティング

> 開発・ビルド・デプロイでよくある問題と対処法です。

---

## 開発環境

### `pnpm install` が失敗する

- **Node バージョン:** `package.json` の `engines.node`（例: >=22）を満たしているか確認。`nvm use` や `.nvmrc` を利用。
- **pnpm バージョン:** `engines.pnpm`（>=9）を満たしているか。`pnpm -v` で確認し、足りなければ `npm install -g pnpm` で更新。
- **キャッシュ:** `pnpm store prune` の後に再度 `pnpm install` を試す。

### `pnpm dev` で起動しない・ポート競合

- ポート 3000 が使用中の場合、`pnpm dev -- -p 3001` で別ポートを指定。
- Turbopack の不具合が疑われる場合は、一時的に `next dev`（Turbopack なし）で起動して確認。

### TypeScript エラーが多発する

- `pnpm type-check` でエラー箇所を確認。
- `any` を使わず、`unknown` や適切な型を定義。
- 型定義は `src/types/` を参照し、既存の型を流用する。

### Biome のエラー・フォーマットが合わない

- `pnpm lint:fix` で自動修正できるものが多い。
- `pnpm format` でフォーマットを統一。
- ルールを変えたい場合は `biome.json` を編集（チームで方針を合わせる）。

---

## ビルド

### `pnpm build` が失敗する

- **メモリ不足:** Node のメモリ制限を上げる（例: `NODE_OPTIONS=--max-old-space-size=4096 pnpm build`）。
- **依存関係:** `pnpm install` をやり直し、`pnpm-lock.yaml` をコミットした上で再ビルド。
- **Next.js / Webpack エラー:** エラーメッセージのファイル名・行番号を確認。型エラーや存在しない import がないか確認。

### 本番ビルドだけ失敗する（開発は動く）

- 環境差（Node バージョン・NODE_ENV）を確認。
- `next.config.js` の `output: 'export'` 等、本番用設定を確認。
- Cloudflare のビルドログで失敗ステップを特定する。

---

## デプロイ（Cloudflare Pages）

### デプロイが完了しない・ビルドが落ちる

- Cloudflare の「Deployments」で失敗したビルドのログを確認。
- **ビルドコマンド:** `pnpm build` が正しく設定されているか。
- **Node バージョン:** Cloudflare の設定で 22 以上を指定しているか。
- ローカルで `pnpm build` が成功するか再確認。

### サイトは出るが地図やデータが表示されない

- **CORS / アセットパス:** 静的エクスポートの場合、`basePath` やアセットのパスが正しいか確認。
- **Service Worker:** キャッシュが古い場合、ブラウザの開発者ツールで「Application → Service Workers」から更新やアン登録を試す。
- **GeoJSON:** `public/data/shelters.geojson` がビルドに含まれ、正しい URL で取得されているか確認。

---

## データ更新（GitHub Actions）

### データ更新ワークフローが失敗する

- `.github/workflows/update-data.yml` のログを確認。
- 国土地理院 API の仕様変更・障害の有無を確認。
- `scripts/fetch_shelters.ts` をローカルで実行し、エラー再現する（`tsx scripts/fetch_shelters.ts` 等）。

### 検証スクリプトでエラーになる

- `pnpm validate:shelters` の出力を確認。
- 座標・住所・地域 ID がスキーマや `src/config/regions.ts` と一致しているか確認。
- 境界付近の座標は警告になることがある（意図したデータなら無視してよい場合あり）。

---

## 関連

- [開発ワークフロー](./development-workflow.md)
- [デプロイ](./deployment.md)
- [.docs/cloudflare-pages-setup.md](../cloudflare-pages-setup.md)（デプロイ詳細）
