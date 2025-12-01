# pnpm 完全ガイド

> **Last Updated:** 2025-10-16
> **Target:** 鳴門市避難所マッププロジェクト

---

## 📌 pnpmとは？

**pnpm（performant npm）** は、高速で効率的なパッケージマネージャーです。

### 主な特徴

- ⚡ **高速:** npmより最大3倍高速
- 💾 **ディスク効率:** ハードリンクでディスク使用量を大幅削減
- 🔒 **厳密性:** Phantom dependencies（幽霊依存関係）を防止
- 📦 **モノレポ対応:** ワークスペース機能内蔵

---

## 🚀 インストール

### グローバルインストール

```bash
# npm経由
npm install -g pnpm

# Homebrewの場合（Mac）
brew install pnpm

# Windowsの場合（Chocolatey）
choco install pnpm

# 公式スクリプト
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### バージョン確認

```bash
pnpm --version
```

---

## 📋 基本コマンド

### npmとの対応表

| 操作 | npm | pnpm |
|------|-----|------|
| **インストール** | `npm install` | `pnpm install` または `pnpm i` |
| **パッケージ追加** | `npm install react` | `pnpm add react` |
| **dev依存追加** | `npm install -D vitest` | `pnpm add -D vitest` |
| **パッケージ削除** | `npm uninstall react` | `pnpm remove react` または `pnpm rm react` |
| **グローバル追加** | `npm install -g typescript` | `pnpm add -g typescript` |
| **スクリプト実行** | `npm run dev` | `pnpm dev` または `pnpm run dev` |
| **依存関係更新** | `npm update` | `pnpm update` または `pnpm up` |
| **キャッシュクリア** | `npm cache clean --force` | `pnpm store prune` |

---

## 🔧 プロジェクトセットアップ

### 1. 既存プロジェクトでpnpmを使用開始

```bash
# 既存のnode_modules削除
rm -rf node_modules

# package-lock.json削除（npmの場合）
rm package-lock.json

# yarn.lock削除（yarnの場合）
rm yarn.lock

# pnpmでインストール
pnpm install
```

### 2. 新規プロジェクト

```bash
# プロジェクト作成
mkdir my-project
cd my-project

# package.json作成
pnpm init

# パッケージ追加
pnpm add next react react-dom
pnpm add -D typescript @types/react @types/node
```

---

## ⚙️ .npmrc設定

プロジェクトルートに `.npmrc` ファイルを作成してpnpmの動作をカスタマイズ：

```ini
# 推奨設定（本プロジェクト）
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=false

# オプション
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*

# レジストリ設定（必要に応じて）
registry=https://registry.npmjs.org/
```

### 設定項目説明

| 設定 | 説明 | 推奨値 |
|------|------|--------|
| `auto-install-peers` | peer dependenciesを自動インストール | `true` |
| `strict-peer-dependencies` | peer dependencies不一致でエラー | `false` |
| `shamefully-hoist` | すべてをnode_modulesルートに配置 | `false` |
| `public-hoist-pattern` | 特定パッケージをホイスト | 必要に応じて |

---

## 📦 パッケージ管理

### パッケージ追加

```bash
# 本番依存関係
pnpm add react react-dom

# 開発依存関係
pnpm add -D @biomejs/biome vitest

# 特定バージョン指定
pnpm add react@19.0.0

# 複数パッケージ同時追加
pnpm add swr zustand clsx
```

### パッケージ削除

```bash
# 単一パッケージ削除
pnpm remove react-query

# 複数削除
pnpm remove eslint prettier
```

### パッケージ更新

```bash
# すべて更新
pnpm update

# 特定パッケージ更新
pnpm update react

# 最新バージョンに更新
pnpm update --latest

# インタラクティブ更新
pnpm up --interactive
```

---

## 🏃 スクリプト実行

### 基本実行

```bash
# pnpm run は省略可能
pnpm dev         # pnpm run dev と同じ
pnpm build
pnpm test

# 複数スクリプト並列実行
pnpm run --parallel dev test
```

### 本プロジェクトのスクリプト

```bash
# 開発サーバー（Turbopack）
pnpm dev

# ビルド
pnpm build

# Lint（Biome）
pnpm lint
pnpm lint:fix

# Format（Biome）
pnpm format
pnpm format:check

# 型チェック
pnpm type-check

```

---

## 🔍 便利なコマンド

### 依存関係の確認

```bash
# インストール済みパッケージ一覧
pnpm list

# 深さ指定
pnpm list --depth=0

# 特定パッケージのバージョン
pnpm list react

# 依存関係ツリー
pnpm why react
```

### ストア管理

```bash
# ストアサイズ確認
pnpm store status

# 未使用パッケージ削除
pnpm store prune

# ストアパス確認
pnpm store path
```

### その他

```bash
# 古いパッケージチェック
pnpm outdated

# 実行可能ファイルパス確認
pnpm bin

# 環境変数確認
pnpm config list
```

---

## 🐛 トラブルシューティング

### 問題1: peer dependencies警告

**症状:**
```
WARN  Issues with peer dependencies found
```

**解決策:**
```bash
# .npmrcに追加
echo "auto-install-peers=true" >> .npmrc

# 再インストール
pnpm install
```

### 問題2: パッケージが見つからない

**症状:**
```
Cannot find module 'some-package'
```

**解決策:**
```bash
# shamefully-hoistを有効化（最終手段）
echo "shamefully-hoist=true" >> .npmrc

# または特定パッケージのみホイスト
echo "public-hoist-pattern[]=some-package" >> .npmrc

# 再インストール
pnpm install
```

### 問題3: キャッシュ問題

**症状:**
古いバージョンがインストールされる

**解決策:**
```bash
# キャッシュクリア
pnpm store prune

# lockfileを再生成
rm pnpm-lock.yaml
pnpm install
```

### 問題4: グローバルパッケージが動作しない

**症状:**
グローバルインストールしたコマンドが見つからない

**解決策:**
```bash
# pnpm binパス確認
pnpm bin -g

# PATHに追加（~/.bashrc または ~/.zshrc）
export PATH="$(pnpm bin -g):$PATH"
```

---

## 🚀 パフォーマンス最適化

### 1. CI/CD環境

```bash
# Frozen lockfile（lockfile更新禁止）
pnpm install --frozen-lockfile

# オフラインインストール（キャッシュのみ使用）
pnpm install --offline

# 本番依存のみインストール
pnpm install --prod
```

### 2. GitHub Actions設定例

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build
```

---

## 🌳 モノレポ対応（将来的に）

### pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### ワークスペースコマンド

```bash
# すべてのワークスペースでコマンド実行
pnpm -r run build

# 特定ワークスペースで実行
pnpm --filter web dev

# 依存関係のあるワークスペースも実行
pnpm --filter web... build
```

---

## 📊 npm vs pnpm ベンチマーク

### インストール速度（本プロジェクト想定）

| パッケージマネージャー | 初回 | キャッシュあり |
|---------------------|------|--------------|
| npm | 45秒 | 20秒 |
| pnpm | **15秒** | **6秒** |

### ディスク使用量

| パッケージマネージャー | node_modules | 合計 |
|---------------------|-------------|------|
| npm | 500 MB | 500 MB |
| pnpm | **150 MB** (ハードリンク) | **200 MB** (ストア含む) |

---

## 🔗 参考リンク

### 公式リソース

- [pnpm公式サイト](https://pnpm.io/)
- [pnpm CLI](https://pnpm.io/cli/add)
- [pnpm Benchmark](https://pnpm.io/benchmarks)
- [pnpm Workspaces](https://pnpm.io/workspaces)

### マイグレーション

- [npmからの移行](https://pnpm.io/cli/import)
- [yarnからの移行](https://pnpm.io/cli/import)

### トラブルシューティング

- [FAQ](https://pnpm.io/faq)
- [Troubleshooting](https://pnpm.io/troubleshooting)

---

## 💡 ベストプラクティス

1. ✅ **`.npmrc`を必ず設定する**
   - `auto-install-peers=true`で警告を減らす
   - プロジェクト固有の設定をコミット

2. ✅ **`pnpm-lock.yaml`をコミットする**
   - 再現可能なビルドのため必須

3. ✅ **CI/CDで`--frozen-lockfile`を使う**
   - lockfileの意図しない更新を防ぐ

4. ✅ **`pnpm store prune`を定期実行**
   - 未使用パッケージを削除してディスク節約

5. ✅ **`pnpm update --interactive`で更新**
   - 意図しないbreaking changeを防ぐ

6. ❌ **`shamefully-hoist`は最終手段**
   - Phantom dependenciesのリスクあり

---

## 🆚 npm/yarn/pnpm 比較表

| 機能 | npm | yarn | pnpm |
|------|-----|------|------|
| 速度 | ⭐️⭐️ | ⭐️⭐️⭐️ | ⭐️⭐️⭐️⭐️⭐️ |
| ディスク効率 | ⭐️⭐️ | ⭐️⭐️ | ⭐️⭐️⭐️⭐️⭐️ |
| 厳密性 | ⭐️⭐️ | ⭐️⭐️⭐️ | ⭐️⭐️⭐️⭐️⭐️ |
| モノレポ対応 | ⭐️⭐️⭐️ | ⭐️⭐️⭐️⭐️ | ⭐️⭐️⭐️⭐️⭐️ |
| エコシステム | ⭐️⭐️⭐️⭐️⭐️ | ⭐️⭐️⭐️⭐️ | ⭐️⭐️⭐️⭐️ |

---

**結論:** 本プロジェクトではpnpmを採用することで、**開発速度向上**と**ディスク効率化**を実現します。

---

**Last Updated:** 2025-10-16
