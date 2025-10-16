# 鳴門市避難所マップ - マスタープラン

> **Document Version:** 2.0
> **Last Updated:** 2025-10-16
> **Author:** Yusaku Matsukawa
> **Tech Stack Update:** 2025年最新版（pnpm, React 19, Tailwind v4, Biome, Vitest）

---

## 📌 プロジェクト概要

### 目的

徳島県鳴門市の公的避難所を地図上に可視化し、**オフライン環境でも避難情報を確認できる** Progressive Web App (PWA) を構築する。

地方 × 防災 × Web技術 の実験的プロジェクトとして、誰でも使える形で公開し、技術的な学びと社会貢献を両立させる。

### コアバリュー

1. **オフラインファースト**: 電波がなくても避難所情報にアクセス可能
2. **オープンデータ活用**: 国土地理院・国土交通省の公開データを利用
3. **最新Web技術**: Next.js 15, React 19, Tailwind CSS v4, TypeScript, MapLibre GL JS
4. **自動更新**: GitHub Actions で毎日データを自動更新
5. **オープンソース**: MIT License で誰でも利用・改変可能

---

## 🎯 プロジェクトゴール

### MVP (Minimum Viable Product)

- [ ] 鳴門市内の避難所を地図上に表示
- [ ] 避難所の基本情報（名称、住所、災害種別）を表示
- [ ] オフライン動作（Service Worker + Cache API）
- [ ] PWAとしてインストール可能
- [ ] レスポンシブデザイン（スマホ対応）

### Future Enhancements

- [ ] 災害種別フィルタ（洪水/津波/土砂災害）
- [ ] 現在地からの距離順ソート
- [ ] ルート案内（Google Maps連携）
- [ ] MapLibre Vector Tiles 対応（完全オフライン）
- [ ] 多言語対応（英語/やさしい日本語）
- [ ] 他市町村対応（徳島県全域など）

---

## 🏗️ 技術スタック（2025年最新版）

### パッケージマネージャー

| 技術 | バージョン | 特徴 |
|------|-----------|------|
| **pnpm** | 9.x | npmより3倍高速、ディスク効率的、厳密な依存関係管理 |

### フロントエンド

| 技術 | バージョン | 用途 | 2025更新内容 |
|------|-----------|------|-------------|
| Next.js | 15.x | React フレームワーク (App Router) | Turbopack標準、キャッシュ戦略明示化 |
| React | **19.x** | UIライブラリ | `use` hook, Server Components, Actions |
| TypeScript | 5.x | 型安全な開発 | Strict Mode必須 |
| Tailwind CSS | **v4** | ユーティリティファーストCSS | Lightning CSS統合、CSS-First設定 |
| MapLibre GL JS | **5.9.x** | オープンソース地図ライブラリ | Globe rendering mode対応 |

### PWA & 状態管理

| 技術 | 用途 |
|------|------|
| next-pwa | Service Worker + Manifest 自動生成 |
| SWR | データフェッチング & キャッシング |
| Zustand (optional) | グローバル状態管理 |

### 開発ツール（2025最新）

| ツール | 用途 | 従来比 |
|--------|------|--------|
| **Biome** | Lint + フォーマット（統一ツール） | ESLint+Prettierより20倍高速 |
| **Vitest** | ユニットテスト | Jestより10倍高速 |
| **Playwright MCP** | E2Eテスト（AI駆動） | アクセシビリティツリーベース |
| TypeScript Strict Mode | 厳格な型チェック | - |
| Husky + lint-staged | Git hooks（コミット前チェック） | - |

### インフラ & CI/CD

| サービス | 用途 |
|----------|------|
| Cloudflare Pages | 静的ホスティング & CDN |
| GitHub Actions | データ自動更新 & デプロイ |
| GitHub | ソースコード管理 |

---

## 📂 プロジェクト構造（最終形）

```
naruto-shelter-map/
├── .docs/                      # プロジェクトドキュメント（AI駆動開発）
│   ├── 00-MASTER-PLAN.md       # このファイル
│   ├── 01-phase-readme.md      # Phase 1 詳細
│   ├── 02-phase-ai-env.md      # Phase 2 詳細
│   ├── 03-phase-dev-env.md     # Phase 3 詳細
│   ├── system/                 # システム仕様
│   ├── architecture/           # アーキテクチャ決定記録
│   ├── sop/                    # 標準作業手順
│   └── README.md               # ドキュメントインデックス
│
├── .github/
│   └── workflows/
│       └── etl.yml             # データ更新自動化
│
├── public/
│   ├── data/
│   │   └── shelters.geojson    # 避難所データ
│   ├── icons/                  # PWAアイコン
│   └── manifest.json           # PWA Manifest
│
├── scripts/
│   └── fetch_shelters.ts       # データ取得ETLスクリプト
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # ルートレイアウト
│   │   ├── page.tsx            # トップページ
│   │   └── globals.css         # グローバルCSS
│   │
│   ├── components/             # Reactコンポーネント
│   │   ├── map/
│   │   │   ├── Map.tsx         # MapLibre地図コンポーネント
│   │   │   └── MarkerCluster.tsx
│   │   ├── shelter/
│   │   │   ├── ShelterList.tsx # 避難所リスト
│   │   │   └── ShelterDetail.tsx
│   │   └── ui/                 # 汎用UIコンポーネント
│   │
│   ├── hooks/                  # カスタムフック
│   │   ├── useShelters.ts      # 避難所データ取得
│   │   └── useGeolocation.ts   # 位置情報
│   │
│   ├── lib/                    # ユーティリティ
│   │   ├── geojson.ts          # GeoJSON処理
│   │   └── maplibre.ts         # MapLibre設定
│   │
│   └── types/                  # TypeScript型定義
│       └── shelter.ts          # 避難所型定義
│
├── AGENTS.md                   # AI Coding Agent 設定
├── CLAUDE.md                   # Claude Code 設定
├── README.md                   # プロジェクト説明
├── package.json                # 依存関係（pnpm）
├── pnpm-lock.yaml              # pnpm lockfile
├── .npmrc                      # pnpm設定
├── next.config.js              # Next.js設定
├── tsconfig.json               # TypeScript設定
├── biome.json                  # Biome設定（Lint + Format）
├── vitest.config.mts           # Vitest設定
├── playwright.config.ts        # Playwright MCP設定
├── .env.example                # 環境変数サンプル
└── .gitignore                  # Git除外設定
```

---

## 🚀 実装フェーズ

### Phase 0: 環境整備（このドキュメント群の実装）

**期間:** 1日
**ゴール:** 開発に必要なドキュメント・設定ファイルを整備

- [x] `.docs/` フォルダ作成
- [ ] プランドキュメント作成（5ファイル）
- [ ] 各フェーズの実行準備完了

---

### Phase 1: README更新 ⭐️ **最優先**

**期間:** 0.5日
**難易度:** ⭐️ (Easy)
**ゴール:** プロジェクトの顔となるREADMEを整備

#### タスク

- [ ] 現在の `README.md` を提供されたアイデア文書ベースに更新
- [ ] プロジェクトバッジ追加（React 19, Tailwind v4, pnpmなど）
- [ ] 目次追加
- [ ] スクリーンショット枠追加

#### 成果物

- `README.md` (更新)

#### 詳細計画

→ [.docs/01-phase-readme.md](./.01-phase-readme.md)

---

### Phase 2: AI環境整備 ⭐️⭐️

**期間:** 1日
**難易度:** ⭐️⭐️ (Medium)
**ゴール:** AI駆動開発のための規約・ドキュメント整備

#### タスク

- [ ] `AGENTS.md` 作成（AI Agent標準規格2025）
- [ ] `CLAUDE.md` 作成（Claude Code設定）
- [ ] `.docs/system/` ドキュメント作成
- [ ] `.docs/architecture/` ADR作成
- [ ] `.docs/sop/` 作業手順書作成

#### 成果物

- `AGENTS.md`
- `CLAUDE.md`
- `.docs/system/` (3ファイル)
- `.docs/architecture/` (3ファイル)
- `.docs/sop/` (3ファイル)

#### 詳細計画

→ [.docs/02-phase-ai-env.md](./.02-phase-ai-env.md)

---

### Phase 3: 開発環境整備 ⭐️⭐️⭐️

**期間:** 1-2日
**難易度:** ⭐️⭐️⭐️ (Hard)
**ゴール:** ローカルで `pnpm dev` が動作する状態にする

#### タスク

- [ ] `package.json` 作成（pnpm対応、最新依存関係）
- [ ] `.npmrc` 作成（pnpm設定）
- [ ] `next.config.js` 作成（Turbopack設定）
- [ ] `tsconfig.json` 作成
- [ ] `biome.json` 作成（ESLint/Prettier置き換え）
- [ ] `vitest.config.mts` 作成
- [ ] `playwright.config.ts` 作成（MCP統合）
- [ ] `src/` ディレクトリ構造作成
- [ ] Tailwind CSS v4設定（CSS-First）
- [ ] `.env.example` 作成
- [ ] `.gitignore` 作成
- [ ] `pnpm install` 実行確認
- [ ] `pnpm dev` 起動確認

#### 成果物

- `package.json` (pnpm + React 19 + Tailwind v4)
- `.npmrc`
- `next.config.js` (Turbopack)
- `tsconfig.json`
- `biome.json`
- `vitest.config.mts`
- `playwright.config.ts`
- `.env.example`
- `.gitignore`
- `src/` (基本構造 + Tailwind v4設定)
- `public/` (基本構造)

#### 詳細計画

→ [.docs/03-phase-dev-env.md](./.03-phase-dev-env.md)

---

### Phase 4: MVP実装（Phase 3完了後）

**期間:** 1週間
**難易度:** ⭐️⭐️⭐️⭐️
**ゴール:** 動作するMVPをデプロイ

#### タスク

- [ ] MapLibre地図コンポーネント実装
- [ ] 避難所データ表示機能
- [ ] PWA設定（Service Worker, Manifest）
- [ ] オフライン動作確認
- [ ] レスポンシブデザイン
- [ ] Cloudflare Pages デプロイ

#### 詳細計画

→ Phase 3完了後に `.docs/04-phase-mvp.md` として作成

---

### Phase 5: データ自動更新（MVP完了後）

**期間:** 3日
**難易度:** ⭐️⭐️⭐️
**ゴール:** GitHub Actionsで毎日自動更新

#### タスク

- [ ] `scripts/fetch_shelters.ts` 実装
- [ ] GitHub Actions ワークフロー作成
- [ ] 自動デプロイ設定

#### 詳細計画

→ MVP完了後に `.docs/05-phase-automation.md` として作成

---

## 📊 データフロー

```mermaid
graph LR
    A[国土地理院API] -->|毎日3:00 JST| B[GitHub Actions]
    B -->|ETLスクリプト実行| C[鳴門市データ抽出]
    C -->|GeoJSON生成| D[public/data/shelters.geojson]
    D -->|Git Commit & Push| E[GitHub Repository]
    E -->|自動デプロイ| F[Cloudflare Pages]
    F -->|CDN配信| G[ユーザー]
    G -->|Service Worker| H[オフラインキャッシュ]
```

---

## 🧪 テスト戦略（2025年最新）

### ユニットテスト

- **対象:** `lib/`, `hooks/`
- **ツール:** **Vitest** + React Testing Library
- **理由:** Jestより10倍高速、Vite駆動、Next.js公式サポート
- **カバレッジ目標:** 80%以上
- **コマンド:** `pnpm test`

### E2Eテスト

- **対象:** 主要ユーザーフロー
- **ツール:** **Playwright MCP** (Model Context Protocol)
- **特徴:** AI駆動テスト、アクセシビリティツリーベース
- **シナリオ:**
  - 地図表示
  - 避難所検索
  - オフライン動作
- **コマンド:** `pnpm run e2e`

### PWAテスト

- **ツール:** Lighthouse CI
- **目標スコア:**
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 95+
  - PWA: 100

---

## 🔐 セキュリティ & プライバシー

### データ

- **個人情報:** 一切収集しない
- **位置情報:** ブラウザAPIのみ使用（サーバー送信なし）
- **分析:** 不要（プライバシーファースト）

### 依存関係

- Dependabot による自動更新
- 定期的な脆弱性スキャン

---

## 📈 成功指標（KPI）

### 技術指標

- [ ] Lighthouse PWA スコア 100
- [ ] Core Web Vitals 全項目 Good
- [ ] オフライン動作率 100%
- [ ] TypeScript エラー 0件

---

## 🔗 参考リンク

### 技術ドキュメント（2025年最新）

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [Biome](https://biomejs.dev/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [pnpm](https://pnpm.io/)
- [next-pwa](https://github.com/shadowwalker/next-pwa)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)

### データソース

- [国土地理院 指定緊急避難場所データ](https://www.gsi.go.jp/bousaichiri/hinanbasho.html)
- [国土数値情報（避難施設データ）](https://nlftp.mlit.go.jp/ksj/)

### AI開発

- [AGENTS.md Best Practices](https://www.builder.io/blog/agents-md)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)

---

## 📝 ライセンス

MIT License - 誰でも自由に使用・改変・配布可能

詳細は `LICENSE` ファイルを参照してください。

---

**Next Step:** [Phase 1: README更新](./.01-phase-readme.md) に進む
