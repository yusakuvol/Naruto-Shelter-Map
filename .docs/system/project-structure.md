# プロジェクト構造

> 鳴門市避難所マップのディレクトリ構成とファイル配置ルールです。

---

## 📂 ディレクトリツリー（主要部分）

```
naruto-shelter-map/
├── .docs/                          # プロジェクトドキュメント（AI駆動開発）
│   ├── system/                     # システム仕様（本ファイル含む）
│   ├── architecture/               # アーキテクチャ決定記録（ADR）
│   ├── sop/                        # 標準作業手順
│   ├── 00-MASTER-PLAN.md
│   ├── cloudflare-pages-setup.md
│   └── ...
│
├── .github/workflows/
│   ├── ci.yml                      # Lint / 型チェック / テスト
│   ├── release.yml                 # リリース自動化
│   └── update-data.yml             # 避難所データ自動更新（毎週月曜 3:00 JST）
│
├── public/
│   ├── data/shelters.geojson       # 避難所データ（自動更新）
│   ├── icons/                      # PWA アイコン
│   ├── manifest.json
│   └── sw.js                       # Service Worker
│
├── scripts/
│   ├── fetch_shelters.ts           # 国土地理院APIからデータ取得
│   ├── geocode-shelters.ts         # ジオコーディング
│   └── validate-shelters.ts        # データ検証
│
├── src/
│   ├── App.tsx                     # ルートコンポーネント（layout + ページ）
│   ├── main.tsx                    # エントリ（createRoot）
│   ├── globals.css                 # グローバルスタイル（Tailwind v4）
│   ├── vite-env.d.ts               # Vite クライアント型
│   │
│   ├── components/
│   │   ├── a11y/                   # アクセシビリティ
│   │   ├── error/                  # エラー表示
│   │   ├── filter/                 # 災害種別フィルタ
│   │   ├── icons/
│   │   ├── map/                    # 地図・マーカー・コントロール
│   │   ├── mobile/                 # ボトムシート等
│   │   ├── pwa/                    # PWA インストール・オフライン表示
│   │   └── shelter/                # 避難所リスト・カード・詳細モーダル
│   │
│   ├── config/                     # アプリ設定（地域など）
│   ├── contexts/                   # React Context（フィルタ等）
│   ├── hooks/                      # カスタムフック
│   ├── lib/                        # ユーティリティ・ヘルパー
│   └── types/                      # TypeScript 型定義
│
├── index.html                      # エントリ HTML（Vite）
├── vite.config.ts                  # Vite 設定（PWA 含む）
├── AGENTS.md                       # AI Agent 規格
├── CLAUDE.md                       # Claude Code 設定
├── biome.json                     # Lint + フォーマット
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 📋 各フォルダの役割

| パス | 役割 |
|------|------|
| **.docs/** | 計画・仕様・手順書。AI 駆動開発とオンボーディング用。 |
| **.github/workflows/** | CI（lint/type-check/test）、リリース、データ更新。 |
| **public/** | 静的アセット。GeoJSON、PWA アイコン、Service Worker。 |
| **scripts/** | データ取得・検証・ジオコーディング（Node で実行）。 |
| **src/App.tsx, main.tsx** | ルートコンポーネントとエントリ。単一ページ SPA。 |
| **src/components/** | 再利用可能な React コンポーネント。機能別サブフォルダ。 |
| **src/config/** | 地域 ID などアプリ設定定数。 |
| **src/contexts/** | グローバルに近い React 状態（フィルタ等）。 |
| **src/hooks/** | カスタムフック（`use` プレフィックス）。 |
| **src/lib/** | 純粋関数・ヘルパー・テスト可能なユーティリティ。 |
| **src/types/** | 型定義（`.ts`）。コンポーネント以外から参照。 |

---

## 📐 ファイル配置ルール

1. **src/App.tsx, main.tsx**  
   - エントリは `main.tsx` → `App.tsx`。レイアウト・ページ内容は App.tsx に集約。manifest は `public/manifest.json` を静的配置。

2. **src/components/**  
   - 機能ごとにサブフォルダ（`map/`, `shelter/`, `filter/`, `pwa/` など）。  
   - 共通 UI は `ui/` を検討（現状は各所に分散可）。

3. **src/hooks/**  
   - 1 ファイル 1 フックを推奨。`use` プレフィックス必須。

4. **src/lib/**  
   - ビジネスロジック・計算・フォーマット。可能な限り純粋関数でテストしやすい形に。

5. **src/types/**  
   - アプリ全体で使う型。`shelter.ts`, `map.ts` などドメイン別。

6. **public/data/**  
   - 静的 GeoJSON など。ビルド時にそのままコピーされる。

7. **.docs/**  
   - 仕様・ADR・手順書。`system/`, `architecture/`, `sop/` の構成を維持。

---

## 🔗 関連ドキュメント

- [技術スタック](./tech-stack.md)
- [データスキーマ](./data-schema.md)
- [設計原則](../architecture/design-principles.md)
