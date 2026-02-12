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
| **Next.js** | 16.x | App Router、Turbopack（開発）、本番は Webpack。MCP 対応。 |
| **React** | 19.x | Server Components、Actions、`use` hook。 |
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
| **next-pwa** (@ducanh2912/next-pwa) | Service Worker・Manifest 自動生成。 |
| **public/sw.js** | 地図タイル等のオフラインキャッシュ。 |

---

## UI・状態

| 技術 | 用途・理由 |
|------|------------|
| **framer-motion** | アニメーション（ボトムシート等）。 |
| **@tanstack/react-virtual** | 仮想スクロール（避難所リスト）。 |
| **clsx / tailwind-merge** | 条件付きクラス・クラス結合。 |
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
