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
- ✅ Vite ビルド（`pnpm build` で `dist/` に出力）
- ✅ `package.json` に `pnpm` 指定済み
- ✅ PWA設定（vite-plugin-pwa：Service Worker、manifest.json）完備

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
| **Framework preset** | なし（None）または `Vite` |

### 4. ビルド設定

**重要:** Cloudflare Pagesは`package.json`の`packageManager`フィールドからpnpmを自動検出します。**ビルド出力ディレクトリは `dist` に設定してください**（Vite のデフォルト）。

#### 推奨設定

```bash
# Build command
pnpm build

# Build output directory
dist

# Root Directory (optional)
(空欄)
```

**Note:** `pnpm install`はCloudflare Pagesが自動実行するため、ビルドコマンドには不要です。

#### 環境変数（オプション）

「Environment variables」セクションで以下を設定（推奨）：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `NODE_VERSION` | `24` | Node.js バージョン（engines は `>=24`。Cloudflare はメジャー版指定のため 24 を推奨） |

### 5. デプロイ実行

1. **「Save and Deploy」** をクリック
2. 初回ビルドが開始されます（約2〜5分）
3. ビルドログをリアルタイムで確認可能

### 6. デプロイ完了確認

ビルド成功後、以下のURLが生成されます：

```
https://naruto-hinan.com
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

# 3. Viteビルド
pnpm build
# → dist/ ディレクトリに静的ファイルが生成される

# 4. dist/ ディレクトリをCloudflare Pages CDNにデプロイ
```

### 生成されるファイル

`dist/` ディレクトリには以下が含まれます：

```
dist/
├── index.html                 # トップページ
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker（vite-plugin-pwa）
├── workbox-*.js               # Workbox（SW用ライブラリ）
├── registerSW.js              # SW登録スクリプト
├── favicon.ico                # ファビコン
├── icon.svg                   # ソースアイコン
├── icons/                     # PWAアイコン
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-192-maskable.png
│   └── icon-512-maskable.png
├── data/
│   └── shelters.geojson       # 避難所データ
└── assets/                    # JS/CSS（ハッシュ付き）
    ├── index-*.js
    ├── index-*.css
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
   CNAME naruto-shelter.example.com → naruto-hinan.com
   ```
6. **既存のドメインのDNS設定**（例: お名前.com、ムームードメインなど）で：
   - レコードタイプ: `CNAME`
   - ホスト名: `naruto-shelter`
   - 値: `naruto-hinan.com`
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

### ビルド成功後に「Output directory "out" not found」で失敗する

**原因:** プロジェクトが以前 Next.js（静的エクスポート）で作成されており、Cloudflare の「Build output directory」が `out` のままになっている。Vite 移行後は出力が **`dist`** です。

**解決策:**
1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → 対象の Pages プロジェクトを開く
2. **Settings** → **Builds & deployments** → **Build configuration**
3. **Build output directory** を `out` から **`dist`** に変更
4. **Save** 後、**Retry deployment** または新しいデプロイを実行

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

### ビルドエラー（Vite）

**原因:** 型エラーや依存関係の不整合

**解決策:**
1. ローカルで `pnpm install` と `pnpm build` が通るか確認
2. `pnpm type-check` で型エラーがないか確認
3. Node.js バージョンが 22 以上か確認（`.nvmrc` / `package.json` engines）

---

### デプロイ後、ページが真っ白

**原因:** アセットパスが正しくない、またはJavaScriptエラー

**解決策:**
1. ブラウザのDevToolsでコンソールエラーを確認
2. `vite.config.ts` で `base` が設定されていないか確認（通常は不要）
3. `pnpm build` をローカルで実行し、`dist/` の内容を確認

---

### Service Workerが登録されない

**原因:** HTTPSでアクセスしていない、またはService Worker設定エラー

**解決策:**
1. `https://` でアクセスしているか確認（`http://` では動作しない）
2. Cloudflare PagesのURLは自動的にHTTPSなので、カスタムドメインでアクセスしている場合はSSL証明書を確認
3. DevTools → Application → Service Workers で登録状態を確認
4. `vite.config.ts` の VitePWA 設定を確認（本番ビルドでのみ SW が生成・登録される）

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
- ✅ manifest.json が200で返ってくるか？
  ```bash
  curl https://naruto-hinan.com/manifest.json
  ```
- ✅ manifest.json にアイコンが定義されているか？
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
- [Cloudflare Pages - Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Vite - Production build](https://vitejs.dev/guide/build.html)
- [pnpm 公式ドキュメント](https://pnpm.io/)

---

**質問や問題がある場合:**
GitHubのIssueで報告してください → [Issues](https://github.com/yusakuvol/Naruto-Shelter-Map/issues)
