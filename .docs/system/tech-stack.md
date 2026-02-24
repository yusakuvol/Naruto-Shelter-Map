# 技術スタック

> 鳴門市避難所マップで採用している技術と選定理由です。

---

## パッケージマネージャー

| 技術 | バージョン | 用途・理由 |
|------|------------|------------|
| **pnpm** | 9.x 以上 | 高速・ディスク効率・厳密な依存関係管理。npm/yarn は使用しない。 |

---

## フロントエンド

| 技術 | バージョン | 用途・理由 |
|------|------------|------------|
| **Vite** | 6.x | ビルドツール（開発サーバー・本番ビルドは Rollup）。 |
| **React** | 19.x | UI ライブラリ。`use` hook、ref as props 等。 |
| **TypeScript** | 5.x | 型安全。strict 必須。 |
| **Tailwind CSS** | v4 | Lightning CSS 統合、CSS-First 設定。システムフォント使用。 |

---

## 地図・データ

| 技術 | バージョン | 用途・理由 |
|------|------------|------------|
| **MapLibre GL JS** | 5.x | オープンソース、Globe 表示対応。Mapbox GL の OSS 系。 |
| **react-map-gl** | 8.x | MapLibre の React ラッパー（必要に応じて利用）。 |
| **GeoJSON** | - | 避難所データの標準フォーマット。 |

---

## PWA・オフライン

| 技術 | 用途・理由 |
|------|------------|
| **vite-plugin-pwa** | Service Worker・Manifest（Workbox）。runtimeCaching で地図タイル等をキャッシュ。 |
| **dist/sw.js** | ビルド時に生成。地図タイル等のオフラインキャッシュ。 |

---

## UI・状態

| 技術 | 用途・理由 |
|------|------------|
| **shadcn/ui** | Radix UI ベースのコンポーネント集（Dialog, Drawer, Button, Badge, Toggle 等）。コピー&カスタマイズ方式。 |
| **lucide-react** | アイコンライブラリ。ツリーシェイク可能な個別インポート。 |
| **@tanstack/react-virtual** | 仮想スクロール（避難所リスト）。 |
| **clsx / tailwind-merge** | `cn()` ユーティリティでクラス結合。`src/lib/utils.ts` で定義。 |
| **Context API** | フィルタ等のグローバルに近い状態。 |

---

## 開発ツール

| ツール | 用途・理由 |
|--------|------------|
| **Biome** | Lint + フォーマット統一。ESLint+Prettier 代替。 |
| **Vitest** | ユニットテスト。jsdom / Testing Library 利用。 |
| **tsx** | スクリプトの TypeScript 直接実行（fetch/validate 等）。 |

---

## インフラ・CI/CD

| サービス | 用途 |
|----------|------|
| **Cloudflare Pages** | 静的ホスティング・CDN。 |
| **GitHub Actions** | CI（lint/type-check/test）、リリース、データ自動更新。 |

---

## 選定の原則

- **オープンソース・オープンデータ** - 地図・データともに利用しやすいライセンスを優先。
- **オフラインファースト** - PWA・Service Worker で電波がなくても利用可能に。
- **型安全・品質** - TypeScript strict、Biome で一貫したコード品質。
- **ダークモード非対応** - 災害時の視認性のため、ライトテーマのみ提供（設計方針で決定）。

---

## 関連ドキュメント

- [プロジェクト構造](./project-structure.md)
- [データスキーマ](./data-schema.md)
- [ADR 001: PWA フレームワーク](../architecture/adr-001-pwa-framework.md)
- [ADR 002: 地図ライブラリ](../architecture/adr-002-map-library.md)
- [ADR 003: フレームワーク Vite 移行](../architecture/adr-003-framework-vite.md)
