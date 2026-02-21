<p align="center">
  <img src="public/icon.svg" alt="鳴門避難マップ" width="80" height="80" />
</p>

<h1 align="center">鳴門避難マップ</h1>

<p align="center">
  電波がなくても使える、鳴門市周辺の避難所マップ
</p>

<p align="center">
  <a href="https://naruto-hinan.com"><strong>naruto-hinan.com</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PWA-offline_ready-5A0FC8" alt="PWA" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" />
</p>

---

## About

鳴門市とその周辺地域（藍住町・北島町・松茂町・板野町）の避難所を地図上に表示する PWA です。

スマートフォンにインストールしておけば、**電波が届かない状況でも**最後に取得した避難所情報と地図を確認できます。データは国土地理院のオープンデータを活用し、毎週自動で更新されます。

## Features

- **オフライン動作** — Service Worker で地図タイルと避難所データをキャッシュ
- **災害種別フィルタ** — 洪水・津波・土砂災害・地震・火災で絞り込み
- **経路案内** — 選択した避難所への経路をワンタップで表示
- **お気に入り** — よく使う避難所をブックマーク
- **AI チャット** — 避難所について自然言語で質問
- **PWA インストール** — ホーム画面に追加してネイティブアプリのように使用
- **アクセシビリティ** — キーボード操作・スクリーンリーダー対応

## Tech Stack

| Category | Technology |
|----------|-----------|
| UI | React 19 ・ TypeScript ・ Tailwind CSS v4 |
| Map | MapLibre GL JS 5 |
| Build | Vite 6 ・ vite-plugin-pwa |
| Hosting | Cloudflare Pages |
| CI/CD | GitHub Actions |
| Lint | Biome |

## Data

避難所データは [国土地理院 指定緊急避難場所データ](https://www.gsi.go.jp/bousaichiri/hinanbasho.html) を元に、GitHub Actions で毎週自動取得・更新しています。

地図タイルは [OpenStreetMap](https://www.openstreetmap.org/copyright) のデータを使用しています。

## License

MIT License — Copyright (c) 2025 Yusaku Matsukawa

---

<p align="center">
  Developed by <strong>Yusaku Matsukawa</strong>
</p>
