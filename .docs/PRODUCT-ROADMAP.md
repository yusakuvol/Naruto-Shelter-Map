# 鳴門市避難所マップ - プロダクトロードマップ

> **Product Roadmap for Naruto Shelter Map**
>
> このドキュメントは、鳴門市避難所マップの長期的な製品開発計画を定義します。

**Document Version:** 1.0.0
**Last Updated:** 2025-10-28
**Owner:** Yusaku Matsukawa
**Status:** Active Development

---

## 📊 現在の開発ステータス

### 完了済み（✅ Completed）

- [x] **Phase 0:** 環境整備・ドキュメント整備
- [x] **Phase 1:** README更新
- [x] **Phase 2:** AI環境整備（AGENTS.md, CLAUDE.md）
- [x] **Phase 3:** 開発環境整備（pnpm, Next.js 15, React 19, Tailwind v4）
- [x] **Phase 4:** MVP実装
  - [x] MapLibre GL JS地図表示
  - [x] 避難所データ表示（GeoJSON）
  - [x] 避難所検索機能
  - [x] 災害種別フィルター
  - [x] 現在地表示機能
  - [x] モバイル対応（BottomSheet UI）
  - [x] レスポンシブデザイン
- [x] **Phase 5:** データ自動更新システム
  - [x] GitHub Actions ワークフロー
  - [x] ETLスクリプト（`scripts/fetch-shelters.ts`）
  - [x] 毎週月曜 3:00 JST 自動実行

### 進行中（🚧 In Progress）

- [ ] **Phase 6:** PWA対応（Next フェーズ）
- [ ] パフォーマンス最適化
- [ ] アクセシビリティ改善

---

## 🎯 プロダクトビジョン

### ミッション
**災害時に確実に避難情報にアクセスできるWebアプリケーションを提供し、地域住民の安全を支える。**

### コアバリュー
1. **オフラインファースト** - 電波がなくても動作
2. **シンプル** - 誰でも直感的に使える
3. **高速** - 3秒以内に地図表示
4. **アクセシブル** - 誰にでも使いやすい
5. **オープン** - データもコードも公開

---

## 🗺️ ロードマップ概要

```
Phase 6      Phase 7    Phase 8    Phase 9    Phase 10+
PWA対応      UX改善     多機能化   地域展開   エコシステム化

[基盤強化] → [体験向上] → [機能拡張] → [範囲拡大] → [持続可能性]
```

---

## 📅 詳細ロードマップ

## Phase 6: PWA対応・オフライン強化 ⭐️⭐️⭐️⭐️

**ゴール:** PWA Lighthouse スコア 100、完全オフライン動作
**優先度:** 🔥 CRITICAL（コアバリュー実現）

### 目標
- オフライン環境でも地図・避難所情報が利用可能
- PWAとしてスマホのホーム画面に追加可能
- キャッシュ戦略の最適化

### タスク

#### 6.1 Service Worker実装
- [ ] Next.js 15対応のService Worker設定
- [ ] Workboxベースのキャッシュ戦略
- [ ] 地図タイルのオフラインキャッシュ
- [ ] GeoJSONデータのキャッシュ
- [ ] 静的アセットのキャッシュ

#### 6.2 PWA Manifest最適化
- [ ] `manifest.json`の完全設定
- [ ] アイコン一式（192x192, 512x512, maskable）
- [ ] テーマカラー・背景色設定
- [ ] インストールプロンプト実装

#### 6.3 オフライン体験向上
- [ ] オフライン検出UI
- [ ] キャッシュ更新通知
- [ ] バックグラウンド同期（Background Sync API）
- [ ] オフライン時のフォールバックUI

#### 6.4 PWAテスト
- [ ] Lighthouse PWA監査（目標: 100点）
- [ ] Chrome DevTools Application タブでの確認
- [ ] 実機テスト（iOS Safari, Android Chrome）
- [ ] オフライン動作テスト

### 成果物
- Service Worker（`src/app/sw.ts` or `public/sw.js`）
- PWA Manifest（`src/app/manifest.ts`）
- オフラインUI コンポーネント
- PWA インストールガイド

### 技術選定
- **next-pwa** または **@ducanh2912/next-pwa**（Next.js 15対応）
- **Workbox** - Google製Service Workerライブラリ

### 成功指標（KPI）
- ✅ Lighthouse PWA スコア: **100**
- ✅ オフライン動作率: **100%**
- ✅ キャッシュヒット率: **90%以上**
- ✅ 初回ロード時間: **3秒以内**

---

## Phase 7: UX/UI改善・アクセシビリティ強化 ⭐️⭐️⭐️

**ゴール:** Lighthouse Accessibility 100、Core Web Vitals全項目Good
**優先度:** 🔥 HIGH

### 目標
- 誰でも使いやすいUI/UX
- アクセシビリティ完全対応
- パフォーマンス最適化

### タスク

#### 7.1 Core Web Vitals最適化
- [ ] **LCP（Largest Contentful Paint）** < 2.5s
  - 地図コンポーネントの遅延読み込み
  - クリティカルCSSのインライン化
  - 画像最適化（WebP, AVIF）
- [ ] **CLS（Cumulative Layout Shift）** < 0.1
  - レイアウトシフト防止（aspectRatio指定）
  - フォント読み込み最適化（font-display: swap）
- [ ] **INP（Interaction to Next Paint）** < 200ms
  - イベントハンドラーの最適化
  - 重い処理のWeb Worker化

#### 7.2 アクセシビリティ強化
- [ ] **WCAG 2.1 AAレベル準拠**
  - スクリーンリーダー対応（ARIA属性）
  - キーボード操作対応（Tab, Enter, Escape）
  - フォーカス管理（Focus Trap）
- [ ] **色覚多様性対応**
  - カラーコントラスト比 4.5:1以上
  - 色だけに依存しない情報表示
- [ ] **読みやすさ向上**
  - フォントサイズ調整機能
  - ダークモード対応

#### 7.3 モバイルUX改善
- [ ] タッチジェスチャー最適化
- [ ] スワイプ操作の改善
- [ ] ハプティックフィードバック
- [ ] Pull-to-Refresh（データ更新）

#### 7.4 エラーハンドリング強化
- [ ] エラーバウンダリの実装
- [ ] ネットワークエラーの適切な表示
- [ ] リトライ機能
- [ ] エラーログ収集（Sentry等）

### 成果物
- パフォーマンス最適化レポート
- アクセシビリティ監査レポート
- Core Web Vitals改善ドキュメント

### 成功指標（KPI）
- ✅ Lighthouse Performance: **95+**
- ✅ Lighthouse Accessibility: **100**
- ✅ Lighthouse Best Practices: **100**
- ✅ Lighthouse SEO: **100**
- ✅ Core Web Vitals: **All Good**

---

## Phase 8: 機能拡張 ⭐️⭐️⭐️⭐️

**ゴール:** ユーザー体験の大幅向上
**優先度:** 🔶 MEDIUM

### 目標
- より便利な機能を追加
- ユーザーエンゲージメント向上

### タスク

#### 8.1 ルート案内機能
- [ ] Google Maps / Apple Maps連携
- [ ] 最寄り避難所への経路表示
- [ ] 徒歩・車での所要時間表示
- [ ] 複数経路の比較

#### 8.2 距離・方角表示
- [ ] 現在地からの距離表示（リアルタイム）
- [ ] 方角コンパス
- [ ] 距離順ソート（既存機能の強化）

#### 8.3 避難所詳細情報
- [ ] 収容人数
- [ ] 設備情報（トイレ、水道、電源）
- [ ] バリアフリー情報
- [ ] ペット可否
- [ ] 開設状況（災害時のAPI連携）

#### 8.4 お気に入り機能
- [ ] 避難所のブックマーク
- [ ] LocalStorageへの保存
- [ ] マイ避難所リスト

#### 8.5 地図機能拡張
- [ ] 地図スタイル切り替え（通常/衛星/地形）
- [ ] クラスタリング（避難所が多い地域）
- [ ] 3D地形表示（MapLibre Globe）

#### 8.6 災害情報統合
- [ ] 気象庁API連携（警報・注意報）
- [ ] 河川水位情報
- [ ] 避難指示・勧告の表示
- [ ] ハザードマップオーバーレイ

### 成果物
- ルート案内機能
- 避難所詳細ページ
- お気に入り機能
- 災害情報統合API

### 成功指標（KPI）
- 📈 機能利用率: **50%以上**
- 📈 ユーザーエンゲージメント: **+30%**
- ⏱️ セッション時間: **2分以上**

---

## Phase 9: 多言語対応・地域展開 ⭐️⭐️⭐️⭐️⭐️

**ゴール:** 鳴門市以外への展開、外国人住民対応
**優先度:** 🔶 MEDIUM

### 目標
- 外国人住民・観光客にも利用可能
- 他市町村への展開モデル構築

### タスク

#### 9.1 多言語対応（i18n）
- [ ] **next-intl** 導入
- [ ] 言語切り替えUI
- [ ] 対応言語:
  - 🇯🇵 日本語（標準）
  - 🇬🇧 English
  - 🌐 やさしい日本語
  - 🇨🇳 简体中文（オプション）
  - 🇰🇷 한국어（オプション）
- [ ] 避難所名・住所の翻訳（Google Translate API）

#### 9.2 地域カスタマイズ機能
- [ ] 地域選択UI（鳴門市 → 他市町村）
- [ ] マルチテナント化
- [ ] 地域ごとのGeoJSONデータ管理
- [ ] デプロイ自動化（Cloudflare Pages Environments）

#### 9.3 徳島県内展開
- [ ] 徳島市
- [ ] 小松島市
- [ ] 阿南市
- [ ] 吉野川市
- [ ] その他市町村

#### 9.4 他県への展開準備
- [ ] データソースの汎用化
- [ ] 自治体向けドキュメント作成
- [ ] セルフホスティングガイド

### 成果物
- 多言語対応版アプリ
- 地域カスタマイズシステム
- 自治体向け導入ガイド

### 成功指標（KPI）
- 🌍 対応地域数: **5地域以上**
- 🗣️ 対応言語数: **3言語以上**
- 📄 導入問い合わせ: **月1件以上**

---

## Phase 10: エコシステム化・持続可能性 ⭐️⭐️⭐️⭐️⭐️

**ゴール:** オープンソースプロジェクトとしての成熟
**優先度:** 🔵 LOW（長期的）

### 目標
- コミュニティ主導の開発
- 持続可能な運用体制

### タスク

#### 10.1 オープンソースコミュニティ構築
- [ ] Contribution Guide作成
- [ ] Code of Conduct策定
- [ ] Issue Template整備
- [ ] PR Template整備
- [ ] GitHub Discussions開設

#### 10.2 技術ドキュメント充実
- [ ] Architecture Decision Records（ADR）
- [ ] API Documentation
- [ ] Component Storybook
- [ ] E2Eテスト（Playwright）

#### 10.3 CI/CD強化
- [ ] 自動テスト（Unit, Integration, E2E）
- [ ] Visual Regression Testing
- [ ] パフォーマンス監視（Lighthouse CI）
- [ ] セキュリティスキャン（Dependabot, Snyk）

#### 10.4 運用体制構築
- [ ] モニタリング（Sentry, Google Analytics代替）
- [ ] ユーザーフィードバック収集
- [ ] バグトリアージプロセス
- [ ] リリースサイクル確立（Semantic Versioning）

#### 10.5 プラットフォーム化
- [ ] 避難所データAPI公開
- [ ] WebHook通知機能
- [ ] サードパーティ連携
- [ ] プラグインシステム

### 成果物
- オープンソースコミュニティ
- API公開プラットフォーム
- 持続可能な運用体制

### 成功指標（KPI）
- 👥 GitHub Stars: **100以上**
- 🔀 Contributors: **10人以上**
- 📊 月間アクティブユーザー: **1,000人以上**

---

## 🎨 Future Ideas（アイデア集）

### アイデアバックログ
以下は、将来的に検討する価値のあるアイデアです。

#### モバイルアプリ化
- React Native化（iOS/Androidネイティブアプリ）
- プッシュ通知（避難指示発令時）
- バックグラウンド位置情報追跡

#### AR機能
- ARKit/ARCoreによる避難所方向表示
- 拡張現実での経路案内

#### ソーシャル機能
- 避難所の混雑状況報告（クラウドソーシング）
- 被災状況の共有
- 安否確認機能

#### AI活用
- 最適な避難所のレコメンデーション
- 災害リスク予測
- チャットボットによるQ&A

#### データ拡張
- 避難所の写真・ストリートビュー
- 口コミ・レビュー
- 開設履歴データ

#### 防災教育
- 避難訓練モード
- 防災クイズ
- 避難経路シミュレーション

---

## 📊 成功指標（全体KPI）

### 技術指標
| 指標 | 目標値 | 現在値 | ステータス |
|-----|-------|-------|----------|
| Lighthouse PWA | 100 | - | 🚧 Phase 6 |
| Lighthouse Performance | 95+ | - | 🚧 Phase 7 |
| Lighthouse Accessibility | 100 | - | 🚧 Phase 7 |
| Core Web Vitals (Good) | 100% | - | 🚧 Phase 7 |
| TypeScript Errors | 0 | 0 | ✅ |
| Test Coverage | 80%+ | - | 🚧 Phase 10 |

### プロダクト指標
| 指標 | 目標値 |
|-----|-------|
| 月間アクティブユーザー | 1,000+ |
| 対応地域数 | 10+ |
| 対応言語数 | 5+ |
| GitHub Stars | 100+ |
| 導入自治体数 | 5+ |
| オープンソース貢献者 | 10+ |

---

## 🔄 ロードマップ見直しサイクル

このロードマップは **定期的** に見直します。

### レビュー項目
1. **進捗確認** - 各Phaseの完了状況
2. **KPI達成度** - 目標値との乖離
3. **ユーザーフィードバック** - 実際の利用状況
4. **技術トレンド** - 新技術の採用検討
5. **優先度調整** - リソース配分の見直し

---

## 📚 関連ドキュメント

### プロジェクト内
- [00-MASTER-PLAN.md](./00-MASTER-PLAN.md) - マスタープラン
- [AGENTS.md](../AGENTS.md) - AI Agent規格
- [CLAUDE.md](../CLAUDE.md) - Claude Code設定
- [README.md](../README.md) - プロジェクトREADME

### 外部リソース
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

---

## 📝 変更履歴

| バージョン | 日付 | 変更内容 | 担当者 |
|-----------|------|---------|-------|
| 1.0.0 | 2025-10-28 | 初版作成 | Claude Code |

---

**このロードマップは、プロジェクトの進化とともに更新されます。**
**コミュニティからのフィードバックを歓迎します！**

---

## 🎯 Next Steps

1. **Phase 6（PWA対応）** の詳細計画策定 → `.docs/06-phase-pwa.md`
2. Service Worker実装開始
3. PWA Lighthouse監査

**現在の最優先タスク:** Phase 6 - PWA対応・オフライン強化
