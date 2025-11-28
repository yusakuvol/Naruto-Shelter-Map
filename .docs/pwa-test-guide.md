# PWAテストガイド

> **Phase 6.4: PWAテスト実施ガイド**

**作成日:** 2025-11-28  
**対象:** 鳴門市避難所マップ PWA実装

---

## 📋 テスト概要

このドキュメントは、鳴門市避難所マップのPWA実装をテストするための手順とチェックリストを提供します。

### テスト目標

- ✅ Lighthouse PWA監査: **100点**
- ✅ オフライン動作率: **100%**
- ✅ Service Worker正常動作
- ✅ Manifest正常読み込み
- ✅ インストール可能

---

## 🔧 事前準備

### 1. 本番ビルドの作成

```bash
# 依存関係のインストール
pnpm install

# 本番ビルド
pnpm build

# ビルド結果の確認
ls -la out/
```

### 2. ローカルサーバーの起動

```bash
# Next.jsの本番モードで起動
pnpm start

# または、静的ファイルを直接配信
npx serve out -p 3000
```

**重要:** Service Workerは本番環境（`NODE_ENV=production`）でのみ有効化されます。開発環境（`pnpm dev`）では無効です。

---

## 🧪 テスト項目

### 1. Lighthouse PWA監査

#### 手順

1. Chrome DevToolsを開く（F12）
2. **Lighthouse**タブを選択
3. **Categories**で**Progressive Web App**を選択
4. **Device**を**Mobile**に設定
5. **Analyze page load**をクリック

#### チェック項目

- [ ] **Manifest displays correctly** - 100点
- [ ] **Service Worker registered** - 100点
- [ ] **Offline support** - 100点
- [ ] **Page is installable** - 100点
- [ ] **Uses HTTPS** - 100点（本番環境のみ）
- [ ] **Redirects HTTP to HTTPS** - 100点（本番環境のみ）
- [ ] **Has a `<meta name="theme-color">` tag** - 100点
- [ ] **Has a `<meta name="viewport">` tag** - 100点
- [ ] **Content is sized correctly for viewport** - 100点
- [ ] **Has a maskable icon** - 100点
- [ ] **Splash screen is configured** - 100点

#### 期待される結果

- **PWA Score: 100/100**
- すべてのチェック項目が✅（合格）

---

### 2. Chrome DevTools Applicationタブでの確認

#### 2.1 Manifest確認

1. Chrome DevToolsを開く（F12）
2. **Application**タブを選択
3. 左サイドバーで**Manifest**をクリック

#### チェック項目

- [ ] Manifestが正常に読み込まれている
- [ ] **Name**: "鳴門市避難所マップ"
- [ ] **Short name**: "鳴門避難所"
- [ ] **Start URL**: "/"
- [ ] **Display**: "standalone"
- [ ] **Theme color**: "#3b82f6"
- [ ] **Background color**: "#ffffff"
- [ ] **Icons**: 4つ（192x192, 512x512, maskable各2つ）

#### 2.2 Service Worker確認

1. **Application**タブで**Service Workers**をクリック

#### チェック項目

- [ ] Service Workerが登録されている
- [ ] **Status**: "activated and is running"
- [ ] **Source**: `/sw.js`または`/_next/static/.../sw.js`
- [ ] **Update on reload**チェックボックスが利用可能

#### 2.3 Cache Storage確認

1. **Application**タブで**Cache Storage**を展開

#### チェック項目

- [ ] 以下のキャッシュが存在する:
  - [ ] `osm-tiles` - 地図タイルキャッシュ
  - [ ] `geojson-data` - 避難所データキャッシュ
  - [ ] `static-image-assets` - 画像キャッシュ
  - [ ] `pages` - ページキャッシュ
  - [ ] `next-static-js-assets` - JSアセットキャッシュ

---

### 3. オフライン動作テスト

#### 3.1 ネットワーク切断テスト

1. Chrome DevToolsを開く（F12）
2. **Network**タブを選択
3. **Throttling**を**Offline**に設定
4. ページをリロード（F5）

#### チェック項目

- [ ] ページが正常に表示される（オフラインでも）
- [ ] 地図が表示される（キャッシュされたタイル）
- [ ] 避難所マーカーが表示される（キャッシュされたGeoJSON）
- [ ] オフラインインジケーターが表示される（`OfflineIndicator`コンポーネント）

#### 3.2 キャッシュ更新テスト

1. ネットワークを**Online**に戻す
2. **Application**タブ → **Service Workers**で**Update**をクリック
3. 更新通知（`UpdateNotification`）が表示されることを確認
4. **Update**ボタンをクリックして更新を適用

#### チェック項目

- [ ] Service Workerが更新される
- [ ] 更新通知が表示される
- [ ] 更新後、ページが正常に動作する

---

### 4. インストールテスト

#### 4.1 デスクトップ（Chrome/Edge）

1. アドレスバーの右側に**インストールアイコン**（+）が表示される
2. クリックして「インストール」を選択
3. アプリがインストールされる

#### チェック項目

- [ ] インストールプロンプトが表示される（`InstallPrompt`コンポーネント）
- [ ] インストール後、スタンドアロンウィンドウで開く
- [ ] アプリアイコンが正しく表示される

#### 4.2 モバイル（Android Chrome）

1. メニュー（3点）を開く
2. **「ホーム画面に追加」**を選択
3. 確認ダイアログで**「追加」**をクリック

#### チェック項目

- [ ] ホーム画面にアイコンが追加される
- [ ] アイコンをタップしてアプリが起動する
- [ ] スタンドアロンモードで表示される（アドレスバーなし）

#### 4.3 モバイル（iOS Safari）

1. 共有ボタン（□↑）をタップ
2. **「ホーム画面に追加」**を選択
3. 確認ダイアログで**「追加」**をクリック

#### チェック項目

- [ ] ホーム画面にアイコンが追加される
- [ ] アイコンをタップしてアプリが起動する
- [ ] スタンドアロンモードで表示される（アドレスバーなし）

---

### 5. 実機テスト

#### 5.1 iOS Safari（iPhone/iPad）

**テスト環境:**
- iOS 15.0以上
- Safari最新版

**テスト項目:**
- [ ] アプリがインストール可能
- [ ] オフライン動作が正常
- [ ] 地図が正常に表示される
- [ ] 避難所マーカーが正常に表示される
- [ ] パフォーマンスが良好（60fps）

#### 5.2 Android Chrome

**テスト環境:**
- Android 8.0以上
- Chrome最新版

**テスト項目:**
- [ ] アプリがインストール可能
- [ ] オフライン動作が正常
- [ ] 地図が正常に表示される
- [ ] 避難所マーカーが正常に表示される
- [ ] パフォーマンスが良好（60fps）

---

## 📊 テスト結果記録

### テスト実施日

**日付:** YYYY-MM-DD  
**実施者:** [名前]  
**環境:** [ローカル/本番URL]

### Lighthouse PWAスコア

| 項目 | スコア | 備考 |
|------|--------|------|
| **総合スコア** | /100 | |
| Manifest displays correctly | ✅/❌ | |
| Service Worker registered | ✅/❌ | |
| Offline support | ✅/❌ | |
| Page is installable | ✅/❌ | |
| Uses HTTPS | ✅/❌ | |
| Has a maskable icon | ✅/❌ | |

### 機能テスト結果

| 項目 | 結果 | 備考 |
|------|------|------|
| Manifest読み込み | ✅/❌ | |
| Service Worker登録 | ✅/❌ | |
| オフライン動作 | ✅/❌ | |
| キャッシュ動作 | ✅/❌ | |
| インストール（デスクトップ） | ✅/❌ | |
| インストール（Android） | ✅/❌ | |
| インストール（iOS） | ✅/❌ | |

### 実機テスト結果

| デバイス | OS | ブラウザ | 結果 | 備考 |
|---------|----|---------|------|------|
| iPhone 13 | iOS 17 | Safari | ✅/❌ | |
| Android | Android 13 | Chrome | ✅/❌ | |

---

## 🐛 既知の問題

### 開発環境でのService Worker無効化

**問題:** `next.config.js`で`disable: process.env.NODE_ENV === "development"`となっているため、開発環境ではService Workerが無効です。

**対処法:** 本番ビルド（`pnpm build`）でテストを実施してください。

---

## 📚 参考リンク

- [Lighthouse PWA監査](https://developer.chrome.com/docs/lighthouse/pwa/)
- [Web App Manifest](https://developer.mozilla.org/ja/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/ja/docs/Web/API/Service_Worker_API)
- [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa)

---

**最終更新:** 2025-11-28

