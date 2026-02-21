# ADR 001: PWA フレームワークの選定

## ステータス

**廃止** — [ADR 003: Vite 移行](./adr-003-framework-vite.md) に置き換え済み。以下は歴史的記録として残しています。

## コンテキスト

鳴門市とその隣接地域の避難所を地図上で提供し、**オフラインでも利用できる**ことが要件です。災害時は電波が不安定になるため、Service Worker によるキャッシュと PWA としてのインストールが必須でした。

## 決定

- **フレームワーク:** Next.js（App Router）
- **PWA 実装:** next-pwa（@ducanh2912/next-pwa）で Service Worker と Manifest を自動生成
- **ホスティング:** Cloudflare Pages（静的エクスポート / ハイブリッド）

## 理由

- Next.js 16 の App Router が安定しており、React 19 と組み合わせて Server Components を活用できる。
- next-pwa が Service Worker をビルド時に生成し、地図タイルや GeoJSON のキャッシュ戦略を設定しやすい。
- Cloudflare Pages が Next.js のビルド成果物をそのまま配信でき、CDN と相性が良い。
- オフラインファーストを保ちつつ、開発体験（HMR・型チェック）を維持できる。

## 結果

- 開発速度を保ちながらオフライン対応を実現。
- ホーム画面に追加可能な PWA として配信済み。
- 地図タイル・避難所データのキャッシュにより、オフラインでも最後に閲覧した範囲を表示可能。

## 関連

- [ADR 002: 地図ライブラリ](./adr-002-map-library.md)
- [設計原則](./design-principles.md)
- [.docs/cloudflare-pages-setup.md](../cloudflare-pages-setup.md)
