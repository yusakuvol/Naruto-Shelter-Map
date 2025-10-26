# GitHub Actions デプロイ設定ガイド

このドキュメントでは、GitHub Actions を使用して Cloudflare Pages への自動デプロイを設定する方法を説明します。

## 概要

`.github/workflows/deploy.yml` ワークフローは、`main` ブランチへの push 時に自動的に以下を実行します：

1. コードのチェックアウト
2. Node.js 20.x と pnpm 9.x のセットアップ
3. 依存関係のインストール
4. Next.js プロジェクトのビルド（静的エクスポート）
5. Cloudflare Pages へのデプロイ

## 必要な準備

### 1. Cloudflare API トークンの取得

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. 右上のプロフィールアイコンをクリック → **「マイ プロフィール」**
3. 左サイドバーから **「API トークン」** を選択
4. **「トークンを作成」** ボタンをクリック
5. **「Cloudflare Pages を編集」** テンプレートを選択（または「カスタムトークン」で以下の権限を設定）
   - **アカウント リソース**:
     - `Cloudflare Pages` → `Edit`
   - **ゾーン リソース** (オプション):
     - 特定のゾーン → `Cloudflare Pages:Edit`
6. **「続行してサマリーへ」** をクリック
7. **「トークンを作成」** をクリック
8. 表示されたトークンをコピー（**重要**: このトークンは一度しか表示されません）

### 2. Cloudflare アカウント ID の取得

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. 左サイドバーから **「Workers & Pages」** を選択
3. ページ右側に **「アカウント ID」** が表示されます
4. アカウント ID をコピー（形式: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`）

### 3. GitHub Secrets の設定

1. GitHub リポジトリページにアクセス
2. **「Settings」** タブをクリック
3. 左サイドバーから **「Secrets and variables」** → **「Actions」** を選択
4. **「New repository secret」** をクリック
5. 以下の 2 つのシークレットを作成：

#### シークレット 1: CLOUDFLARE_API_TOKEN

- **Name**: `CLOUDFLARE_API_TOKEN`
- **Secret**: 先ほどコピーした Cloudflare API トークン
- **「Add secret」** をクリック

#### シークレット 2: CLOUDFLARE_ACCOUNT_ID

- **Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Secret**: 先ほどコピーした Cloudflare アカウント ID
- **「Add secret」** をクリック

## Cloudflare Pages プロジェクトの作成

初回デプロイの前に、Cloudflare Pages でプロジェクトを作成する必要があります。

### オプション A: Cloudflare Dashboard で作成（推奨）

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **「Workers & Pages」** → **「Create application」** → **「Pages」** を選択
3. **「アップロードで作成」** を選択
4. プロジェクト名: `naruto-shelter-map`
5. **「プロジェクトを作成」** をクリック
6. 最初のデプロイは空でも構いません（GitHub Actions が後で上書きします）

### オプション B: 初回 GitHub Actions 実行時に自動作成

GitHub Actions の初回実行時に、Cloudflare Pages プロジェクトが自動的に作成されます。

## ワークフローの実行

### 自動実行

`main` ブランチに push すると、自動的にワークフローが実行されます。

```bash
git push origin main
```

### 手動実行

GitHub リポジトリの **「Actions」** タブから手動でワークフローを実行できます：

1. **「Actions」** タブを選択
2. 左サイドバーから **「Deploy to Cloudflare Pages」** を選択
3. **「Run workflow」** ボタンをクリック
4. ブランチを選択（通常は `main`）
5. **「Run workflow」** をクリック

## デプロイ状況の確認

### GitHub Actions ログ

1. **「Actions」** タブを選択
2. 実行中または完了したワークフローをクリック
3. 各ステップのログを確認

### Cloudflare Pages ダッシュボード

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **「Workers & Pages」** を選択
3. **「naruto-shelter-map」** プロジェクトをクリック
4. デプロイ履歴とログを確認

## デプロイ後のURL

デプロイが成功すると、以下の URL でアクセスできます：

- **本番環境**: https://naruto-shelter-map.pages.dev
- **プレビュー環境** (Pull Request): https://[pr-number].naruto-shelter-map.pages.dev

## トラブルシューティング

### エラー: `Error: Failed to publish your Function. Got error: Authentication error [code: 10000]`

**原因**: Cloudflare API トークンが無効、または権限が不足しています。

**解決策**:
1. GitHub Secrets の `CLOUDFLARE_API_TOKEN` が正しいか確認
2. Cloudflare API トークンの権限を確認（`Cloudflare Pages:Edit` が必要）
3. API トークンが期限切れになっていないか確認

### エラー: `Error: Failed to publish your Function. Got error: A request to the Cloudflare API (/accounts/ACCOUNT_ID/pages/projects/PROJECT_NAME) failed`

**原因**: プロジェクト名が存在しない、またはアカウント ID が間違っています。

**解決策**:
1. Cloudflare Pages で `naruto-shelter-map` プロジェクトが作成されているか確認
2. GitHub Secrets の `CLOUDFLARE_ACCOUNT_ID` が正しいか確認

### エラー: `Error: No such file or directory: 'out'`

**原因**: ビルドが失敗し、`out/` ディレクトリが作成されませんでした。

**解決策**:
1. ビルドログを確認し、エラーを修正
2. ローカルで `pnpm build` を実行し、正常にビルドできるか確認
3. `next.config.js` で `output: 'export'` が設定されているか確認

### ワークフローが実行されない

**原因**: ワークフローが無効になっている、またはトリガー条件が満たされていません。

**解決策**:
1. **「Actions」** タブでワークフローが有効になっているか確認
2. `.github/workflows/deploy.yml` の `on` トリガーを確認
3. `main` ブランチに push しているか確認

## カスタマイズ

### デプロイブランチの変更

別のブランチでデプロイしたい場合、`.github/workflows/deploy.yml` を編集：

```yaml
on:
  push:
    branches: [production] # main から production に変更
```

### プロジェクト名の変更

異なるプロジェクト名でデプロイしたい場合、`.github/workflows/deploy.yml` の環境変数を編集：

```yaml
env:
  CLOUDFLARE_PROJECT_NAME: your-project-name # ここを変更
```

この設定により、デプロイURLやコマンド内のプロジェクト名が自動的に更新されます。

### 通知の追加

Slack や Discord への通知を追加したい場合、以下のステップを追加できます：

```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "✅ デプロイ成功: https://naruto-shelter-map.pages.dev"
      }
```

## 参考リンク

- [Cloudflare Wrangler Action](https://github.com/cloudflare/wrangler-action)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

## サポート

問題が発生した場合は、[GitHub Issues](https://github.com/yusakuvol/Naruto-Shelter-Map/issues) で報告してください。
