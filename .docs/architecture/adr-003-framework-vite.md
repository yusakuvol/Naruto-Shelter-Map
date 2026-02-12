# ADR 003: フレームワークを Next.js から Vite + React に移行

## ステータス

承認済み

## コンテキスト

本プロジェクトは当初 Next.js（App Router）と next-pwa で構築され、静的エクスポートにより Cloudflare Pages で配信している。実態は単一ページの SPA であり、SSR や API ルートは未使用。Issue #260 にて、ビルドの簡素化・依存の削減・保守性の観点から他フレームワークへの移行を検討した。

## 決定

- **Next.js を廃止し、Vite + React + TypeScript に移行する。**
- **PWA**: next-pwa の代わりに **vite-plugin-pwa**（Workbox）を採用し、現行の runtimeCaching（地図タイル・GeoJSON・フォント等）を同等に再現する。
- **ビルド成果物**: `out/` から `dist/` に変更。CI と Cloudflare Pages の設定を合わせて更新する。

## 理由

- 単一ページ・静的配信のため、Next.js の機能の多くが未使用であり、Vite の軽量なビルドで十分である。
- Vite は開発時の HMR が高速で、本番ビルドも Rollup により最適化される。
- vite-plugin-pwa は Workbox を内包し、next-pwa と同様の precache および runtimeCaching を設定可能である。
- フレームワークの縛りを減らし、今後の保守・変更をしやすくする。

## 結果

- 移行により実施する作業: ADR の作成、Vite プロジェクトの新規作成（vite.config.ts, index.html, エントリ）、PWA 設定の移植（vite-plugin-pwa と runtimeCaching）、ソースの移行（src/app/ 廃止・App.tsx 化・動的 import を React.lazy に）、CI と Cloudflare の出力ディレクトリを dist に変更、検証（dev / build / preview / PWA）。

## 関連

- [ADR 001: PWA フレームワーク](./adr-001-pwa-framework.md)（移行後も PWA 方針は継続）
- [ADR 002: 地図ライブラリ](./adr-002-map-library.md)
- Issue #260（Next.jsから他のフレームワークに移行）
