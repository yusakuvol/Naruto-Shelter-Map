# Cloudflare Pages デプロイ設定ガイド

> **鳴門市避難所マップ** を Cloudflare Pages にデプロイする手順

**最終更新:** 2025-10-18

---

## 📋 目次

- [なぜCloudflare Pagesなのか？](#なぜcloudflare-pagesなのか)
- [前提条件](#前提条件)
- [デプロイ手順](#デプロイ手順)
- [ビルド設定](#ビルド設定)
- [カスタムドメイン設定](#カスタムドメイン設定)
- [トラブルシューティング](#トラブルシューティング)

---

## なぜCloudflare Pagesなのか？

他のホスティングサービス（Vercel、Netlify）と比較した際の優位性：

| 項目 | Cloudflare Pages | Vercel | Netlify |
|------|------------------|--------|---------|
| **無料プラン商用利用** | ✅ 可能 | ❌ 禁止 | ✅ 可能 |
| **帯域幅制限** | ♾️ 無制限 | 100GB/月 | 100GB/月 |
| **サイト数制限** | ♾️ 無制限 | 制限あり | 制限あり |
| **日本CDN** | ✅ あり（高速） | ✅ あり | ❌ なし（遅い） |
| **カスタムドメイン** | ✅ 無料 | ✅ 無料 | ✅ 無料 |
| **SSL証明書** | ✅ 自動 | ✅ 自動 | ✅ 自動 |
| **UI言語** | 🇯🇵 日本語 | 英語のみ | 英語のみ |

**選定理由:**
1. ✅ **商用利用可能** - 広告収入やスポンサーを考える場合も安心
2. ✅ **帯域幅無制限** - 災害時のアクセス急増にも対応可能
3. ✅ **日本CDN対応** - 高速表示（Netlifyは日本未対応で遅い）
4. ✅ **完全無料** - MVPから本番運用まで追加コストなし

---

## 前提条件

### 必須
- ✅ GitHubアカウント
- ✅ Cloudflareアカウント（無料）
- ✅ GitHubリポジトリが `public` または `private`（どちらでも可）

### プロジェクト要件（すでに満たしている）
- ✅ `next.config.js` に `output: 'export'` 設定済み
- ✅ `package.json` に `pnpm` 指定済み
- ✅ PWA設定（Service Worker、manifest.webmanifest）完備

---

## デプロイ手順

### 1. Cloudflare Pagesにアクセス

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. 左サイドバーから **「Workers & Pages」** を選択
3. **「Create application」** ボタンをクリック
4. **「Pages」** タブを選択
5. **「Connect to Git」** をクリック

### 2. GitHubリポジトリを接続

1. **「Connect GitHub」** をクリック（初回のみ）
2. Cloudflareにリポジトリへのアクセス権限を付与
3. リポジトリ一覧から **`Naruto-Shelter-Map`** を選択
4. **「Begin setup」** をクリック

### 3. プロジェクト設定

以下の設定を入力：

| 項目 | 値 |
|------|-----|
| **Project name** | `naruto-shelter-map`（任意） |
| **Production branch** | `main` |
| **Framework preset** | `Next.js (Static HTML Export)` |

### 4. ビルド設定

**重要:** pnpmを使用するため、ビルドコマンドをカスタマイズします。

#### 推奨設定（方法1: pnpmグローバルインストール）

```bash
# Build command
npm i -g pnpm && pnpm install && pnpm build

# Build output directory
out

# Root Directory (optional)
(空欄)
```

#### 代替設定（方法2: npx pnpm）

```bash
# Build command
npx pnpm install && npx pnpm build

# Build output directory
out
```

#### 環境変数（オプション）

「Environment variables」セクションで以下を設定（推奨）：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `NODE_VERSION` | `20` | Node.jsバージョン指定 |
| `NEXT_PUBLIC_APP_NAME` | `Naruto Shelter Map` | アプリ名（next.config.jsで設定済みのため省略可） |

### 5. デプロイ実行

1. **「Save and Deploy」** をクリック
2. 初回ビルドが開始されます（約2〜5分）
3. ビルドログをリアルタイムで確認可能

### 6. デプロイ完了確認

ビルド成功後、以下のURLが生成されます：

```
https://naruto-shelter-map.pages.dev
```

または

```
https://[プロジェクト名].pages.dev
```

ブラウザでアクセスして、以下を確認：

- ✅ 地図が正常に表示される
- ✅ 避難所リストが表示される
- ✅ 検索機能が動作する
- ✅ PWAインストールプロンプトが表示される（iOS/Android）
- ✅ Service Workerが登録される（DevTools → Application）

---

## ビルド設定

### ビルド設定の詳細

Cloudflare Pagesは以下のプロセスでビルドを実行します：

```bash
# 1. pnpmをグローバルインストール
npm i -g pnpm

# 2. 依存関係インストール
pnpm install

# 3. Next.jsビルド（静的エクスポート）
pnpm build
# → next.config.jsの `output: 'export'` により、out/ ディレクトリに静的ファイルが生成される

# 4. out/ ディレクトリをCloudflare Pages CDNにデプロイ
```

### 生成されるファイル

`out/` ディレクトリには以下が含まれます：

```
out/
├── index.html                 # トップページ
├── 404.html                   # 404エラーページ
├── manifest.webmanifest       # PWA manifest
├── sw.js                      # Service Worker
├── workbox-*.js               # Workbox（SW用ライブラリ）
├── favicon.ico                # ファビコン
├── icon.svg                   # ソースアイコン
├── icons/                     # PWAアイコン
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-192-maskable.png
│   └── icon-512-maskable.png
├── data/
│   └── shelters.geojson       # 避難所データ
└── _next/
    ├── static/                # 静的アセット
    └── ...
```

---

## カスタムドメイン設定

### パターンA: サブドメイン（推奨・簡単）

既存のドメインがある場合、サブドメインを使うのが最も簡単です。

#### 例: `naruto-shelter.example.com`

1. Cloudflare Pagesダッシュボードで **「Custom domains」** タブを選択
2. **「Set up a custom domain」** をクリック
3. サブドメイン名を入力: `naruto-shelter.example.com`
4. **「Continue」** をクリック
5. 表示されるCNAMEレコードをメモ：
   ```
   CNAME naruto-shelter.example.com → naruto-shelter-map.pages.dev
   ```
6. **既存のドメインのDNS設定**（例: お名前.com、ムームードメインなど）で：
   - レコードタイプ: `CNAME`
   - ホスト名: `naruto-shelter`
   - 値: `naruto-shelter-map.pages.dev`
   - TTL: `3600`（1時間）
7. Cloudflare Pagesに戻り、**「Activate domain」** をクリック
8. DNS伝播を待つ（最大48時間、通常は数分〜数時間）

#### メリット
- ✅ 既存ドメインのネームサーバー変更不要
- ✅ 設定が簡単（CNAMEレコード1つだけ）
- ✅ SSL証明書が自動発行される

---

### パターンB: トップレベルドメイン

新規ドメインを取得する場合、またはCloudflareで一元管理したい場合。

#### 例: `naruto-shelter-map.com`

1. ドメインを取得（お名前.com、ムームードメイン、Cloudflare Registrarなど）
2. Cloudflareダッシュボードで **「Websites」** → **「Add a site」**
3. ドメイン名を入力: `naruto-shelter-map.com`
4. Cloudflareのネームサーバー（NS）が表示される：
   ```
   sue.ns.cloudflare.com
   will.ns.cloudflare.com
   ```
5. **ドメイン管理画面**（お名前.comなど）でネームサーバーを変更：
   - 既存NS: `ns1.example.com` → 削除
   - 新NS1: `sue.ns.cloudflare.com`
   - 新NS2: `will.ns.cloudflare.com`
6. DNS伝播を待つ（最大48時間）
7. Cloudflare Pages → **「Custom domains」** → ドメイン追加
8. DNS設定（Cloudflare DNSで自動）：
   ```
   A    naruto-shelter-map.com → [Cloudflare Pages IP]
   AAAA naruto-shelter-map.com → [Cloudflare Pages IPv6]
   ```

#### メリット
- ✅ Cloudflareで全て管理（DNS、CDN、セキュリティ）
- ✅ DDoS防御、WAF、Bot Management などの高度な機能が使える
- ✅ Cloudflare Analyticsでアクセス解析可能

#### デメリット
- ❌ ネームサーバー変更が必要（既存サイトがある場合は移行作業が発生）

---

## トラブルシューティング

### ビルドエラー: `pnpm: command not found`

**原因:** ビルドコマンドで pnpm がインストールされていない

**解決策:**
ビルドコマンドを以下に変更：
```bash
npm i -g pnpm && pnpm install && pnpm build
```

---

### ビルドエラー: `Error: Cannot find module 'next'`

**原因:** 依存関係がインストールされていない

**解決策:**
ビルドコマンドに `pnpm install` が含まれているか確認：
```bash
npm i -g pnpm && pnpm install && pnpm build
```

---

### ビルドエラー: `Error: Export encountered errors on following paths`

**原因:** Next.jsの動的ルーティングやAPIルートが残っている

**解決策:**
1. `src/app/api/` ディレクトリがないことを確認（静的エクスポートではAPIルート不可）
2. 動的ルーティング（`[id]`）を使っていないことを確認
3. `next.config.js` で `output: 'export'` が設定されているか確認

---

### デプロイ後、ページが真っ白

**原因:** アセットパスが正しくない、またはJavaScriptエラー

**解決策:**
1. ブラウザのDevToolsでコンソールエラーを確認
2. `next.config.js` で `basePath` や `assetPrefix` が設定されていないか確認（不要）
3. `pnpm build` をローカルで実行し、`out/` の内容を確認

---

### Service Workerが登録されない

**原因:** HTTPSでアクセスしていない、またはService Worker設定エラー

**解決策:**
1. `https://` でアクセスしているか確認（`http://` では動作しない）
2. Cloudflare PagesのURLは自動的にHTTPSなので、カスタムドメインでアクセスしている場合はSSL証明書を確認
3. DevTools → Application → Service Workers で登録状態を確認
4. `next.config.js` の `withPWA` 設定を確認：
   ```javascript
   disable: process.env.NODE_ENV === 'development',
   ```
   → 開発環境では無効、本番環境では有効

---

### カスタムドメインが反映されない

**原因:** DNS伝播に時間がかかっている

**解決策:**
1. DNSレコードが正しく設定されているか確認：
   ```bash
   dig naruto-shelter.example.com
   # または
   nslookup naruto-shelter.example.com
   ```
2. TTLの期間（通常1時間〜24時間）を待つ
3. ブラウザのDNSキャッシュをクリア（`chrome://net-internals/#dns`）

---

### PWAがインストールできない

**原因:** manifest.webmanifestのエラー、またはHTTPS未対応

**チェックリスト:**
- ✅ HTTPSでアクセスしているか？
- ✅ manifest.webmanifestが200で返ってくるか？
  ```bash
  curl https://naruto-shelter-map.pages.dev/manifest.webmanifest
  ```
- ✅ manifest.webmanifestにアイコンが定義されているか？
- ✅ Service Workerが登録されているか？

**解決策:**
DevTools → Application → Manifest で警告を確認

---

## 次のステップ

デプロイが完了したら：

1. ✅ **Issue #7** をクローズ
2. ✅ **Issue #8** - README.mdにデモサイトURLを追加
3. ✅ **Issue #11** - GitHub Actionsで自動デプロイ設定
4. ✅ **Issue #12** - GitHub Actionsでデータ自動更新設定

---

## 参考リンク

- [Cloudflare Pages 公式ドキュメント](https://developers.cloudflare.com/pages/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site)
- [pnpm 公式ドキュメント](https://pnpm.io/)

---

**質問や問題がある場合:**
GitHubのIssueで報告してください → [Issues](https://github.com/yusakuvol/Naruto-Shelter-Map/issues)
