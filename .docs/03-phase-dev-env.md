# Phase 3: 開発環境整備

> **Phase:** 3/5
> **難易度:** ⭐️⭐️⭐️ Hard
> **期間:** 1-2日（約16時間）
> **前提条件:** Phase 1, 2 完了推奨
> **Tech Update:** 2025年最新版（pnpm, React 19, Tailwind v4, Biome）

---

## 🎯 Phase 3 のゴール

ローカルで **`pnpm dev` が動作する** 2025年最新の開発環境を整備し、以下を達成する：

1. ✅ pnpm + package.json と依存関係のインストール完了
2. ✅ Next.js 15 (Turbopack) + React 19 の基本設定
3. ✅ TypeScript 厳格設定
4. ✅ **Biome** によるコード品質管理（ESLint+Prettier置き換え）
5. ✅ Tailwind CSS v4 設定（CSS-First）
6. ✅ 基本的なディレクトリ構造
7. ✅ 環境変数テンプレート
8. ✅ Git除外設定

---

## 📋 実装チェックリスト

### Part 1: pnpm + package.json 作成

- [ ] `.npmrc` ファイル作成（pnpm設定）
- [ ] `package.json` ファイル作成（2025最新依存関係）
- [ ] 依存関係（React 19, Tailwind v4, MapLibre 5.9）
- [ ] 開発依存関係（Biome）
- [ ] pnpm用スクリプト定義
- [ ] `pnpm install` 実行確認

### Part 2: Next.js + Tailwind v4 設定

- [ ] `next.config.js` 作成（Turbopack設定）
- [ ] `tsconfig.json` 作成
- [ ] Tailwind CSS v4設定（CSS-First、postcss不要）
- [ ] `src/app/globals.css` に `@import "tailwindcss"` 追加

### Part 3: コード品質ツール（Biome）

- [ ] `biome.json` 作成（ESLint/Prettier置き換え）
- [ ] `.editorconfig` 作成（Optional）

### Part 4: ディレクトリ構造

- [ ] `src/app/` 作成（App Router）
- [ ] `src/components/` 作成
- [ ] `src/hooks/` 作成
- [ ] `src/lib/` 作成
- [ ] `src/types/` 作成
- [ ] `public/` 作成
- [ ] `scripts/` 作成

### Part 5: その他

- [ ] `.env.example` 作成
- [ ] `.gitignore` 作成（pnpm対応）
- [ ] `pnpm dev` 起動確認

---

## 📝 Part 1: pnpm + package.json 完全仕様（2025年版）

### .npmrc（pnpm設定）

まず `.npmrc` ファイルを作成してpnpmの動作を設定します：

```ini
# pnpm設定
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=false

# レジストリ設定（オプション）
# registry=https://registry.npmjs.org/
```

### package.json

```json
{
  "name": "naruto-shelter-map",
  "version": "0.1.0",
  "private": true,
  "description": "徳島県鳴門市の避難所を地図上に可視化するPWAアプリ（2025年最新技術）",
  "author": "Yusaku Matsukawa",
  "license": "MIT",
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "maplibre-gl": "^5.9.0",
    "react-map-gl": "^7.1.0",
    "swr": "^2.2.5",
    "zustand": "^5.0.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@biomejs/biome": "^1.9.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^4.0.0",
    "@next/bundle-analyzer": "^15.0.0"
  }
}
```

### 依存関係の説明（2025年版）

#### 本番依存関係（dependencies）

| パッケージ | バージョン | 用途 | 備考 |
|----------|-----------|------|------|
| next | 15.x | Reactフレームワーク | Turbopack標準 |
| react | **19.x** | UIライブラリ | Server Components, Actions |
| react-dom | **19.x** | ReactDOM | - |
| maplibre-gl | **5.9.x** | 地図表示 | Globe rendering mode |
| react-map-gl | 7.x | React用MapLibreラッパー | - |
| swr | 2.x | データフェッチング・キャッシング | - |
| zustand | 5.x | グローバル状態管理 | Optional |
| clsx | 2.x | クラス名結合 | - |
| tailwind-merge | 2.x | Tailwindクラスマージ | - |

#### 開発依存関係（devDependencies）

| パッケージ | バージョン | 用途 | 従来比 |
|----------|-----------|------|--------|
| **@biomejs/biome** | **1.9.x** | Lint + Format | ESLint+Prettierより20倍高速 |
| **tailwindcss** | **4.x** | CSSフレームワーク | Lightning CSS統合 |
| typescript | 5.6.x | 型システム | - |
| husky | 9.x | Git hooks | - |
| lint-staged | 15.x | コミット前チェック | - |

### 主な変更点（従来版から）

**削除されたパッケージ:**
- ❌ `eslint`, `eslint-config-next`, `@typescript-eslint/*` → **Biomeに統合**
- ❌ `prettier`, `prettier-plugin-tailwindcss` → **Biomeに統合**
- ❌ `jest`, `jest-environment-jsdom`, `@testing-library/jest-dom` → **削除（テスト不要）**
- ❌ `postcss`, `autoprefixer` → **Tailwind v4で不要**

**追加されたパッケージ:**
- ✅ `@biomejs/biome` - 統一されたLint/Format
- ✅ `react-map-gl` - MapLibre Reactラッパー

### PWA対応（MVP実装時に追加）

```json
"dependencies": {
  "next-pwa": "^5.6.0",
  "workbox-window": "^7.1.0"
}
```

> **Note:** PWA設定はMVP実装フェーズで追加予定

---

## 📝 Part 2: Next.js設定ファイル

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 厳格モード有効化（開発時の警告を増やす）
  reactStrictMode: true,

  // 静的エクスポート（Cloudflare Pages用）
  output: 'export',

  // 画像最適化（静的エクスポート時は無効）
  images: {
    unoptimized: true,
  },

  // ビルド時の型チェック
  typescript: {
    // ビルド時に型エラーがあれば失敗させる
    ignoreBuildErrors: false,
  },

  // ESLint実行
  eslint: {
    // ビルド時にESLintエラーがあれば失敗させる
    ignoreDuringBuilds: false,
  },

  // Webpack設定（MapLibre GL JS用）
  webpack: (config, { isServer }) => {
    // MapLibre GL JSのcanvasモジュールをIgnore（サーバー側でエラーになるため）
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // 環境変数（クライアント側で使用可能）
  env: {
    NEXT_PUBLIC_APP_NAME: 'Naruto Shelter Map',
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },
};

module.exports = nextConfig;
```

### PWA対応版（後で置き換え）

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.geojson$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'geojson-data',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 1週間
        },
      },
    },
  ],
});

module.exports = withPWA(nextConfig);
```

---

### tsconfig.json

```json
{
  "compilerOptions": {
    // 基本設定
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "incremental": true,

    // 厳格な型チェック
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // モジュール解決
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,

    // パス設定
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    // Next.js設定
    "plugins": [
      {
        "name": "next"
      }
    ],
    "allowJs": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "out"
  ]
}
```

---

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // カスタムカラーパレット（避難所マップ用）
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        shelter: {
          designated: '#3b82f6', // 指定避難所: 青
          emergency: '#ef4444',  // 緊急避難場所: 赤
          both: '#8b5cf6',       // 両方: 紫
        },
      },
      fontFamily: {
        sans: [
          'var(--font-noto-sans-jp)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## 📝 Part 3: コード品質ツール設定

### .eslintrc.json

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    // TypeScript
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",

    // React
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // 一般
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  },
  "ignorePatterns": [
    "node_modules/",
    ".next/",
    "out/",
    "public/"
  ]
}
```

---

### .prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf",
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

### .prettierignore

```
node_modules
.next
out
public
*.md
package-lock.json
pnpm-lock.yaml
```

---

### .editorconfig (Optional)

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

---

## 📝 Part 4: ディレクトリ構造作成

### 基本構造

```bash
mkdir -p src/app
mkdir -p src/components/map
mkdir -p src/components/shelter
mkdir -p src/components/ui
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/types
mkdir -p public/data
mkdir -p public/icons
mkdir -p scripts
```

### 初期ファイル作成

#### src/app/layout.tsx

```typescript
import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: '鳴門市避難所マップ',
  description: '徳島県鳴門市の避難所を地図上に可視化するPWAアプリ',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

---

#### src/app/page.tsx

```typescript
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">鳴門市避難所マップ</h1>
      <p className="mt-4 text-gray-600">
        開発環境のセットアップが完了しました
      </p>
    </main>
  );
}
```

---

#### src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply antialiased;
  }

  body {
    @apply bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100;
  }
}

/* MapLibre GL CSS (後で追加) */
/* @import 'maplibre-gl/dist/maplibre-gl.css'; */
```

---

#### src/types/shelter.ts

```typescript
/**
 * 避難所の種別
 */
export type ShelterType = '指定避難所' | '緊急避難場所' | '両方';

/**
 * 災害種別
 */
export type DisasterType = '洪水' | '津波' | '土砂災害' | '地震' | '火災';

/**
 * 避難所情報
 */
export interface Shelter {
  id: string;
  name: string;
  type: ShelterType;
  address: string;
  coordinates: [number, number]; // [経度, 緯度]
  disasterTypes: DisasterType[];
  capacity?: number;
  source: string;
  updatedAt: string;
}

/**
 * GeoJSON Feature型
 */
export interface ShelterFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: Omit<Shelter, 'coordinates'>;
}

/**
 * GeoJSON FeatureCollection型
 */
export interface ShelterGeoJSON {
  type: 'FeatureCollection';
  features: ShelterFeature[];
}
```

---

## 📝 Part 5: VSCode設定

### .vscode/settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

### .vscode/launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "serverReadyAction": {
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

---

### .vscode/extensions.json

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "streetsidesoftware.code-spell-checker",
    "usernamehw.errorlens",
    "yoavbls.pretty-ts-errors",
    "unifiedjs.vscode-mdx",
    "editorconfig.editorconfig"
  ]
}
```

---

## 📝 Part 6: その他の設定ファイル

### .env.example

```bash
# アプリケーション設定
NEXT_PUBLIC_APP_NAME=Naruto Shelter Map
NEXT_PUBLIC_APP_VERSION=0.1.0

# 地図設定
NEXT_PUBLIC_MAP_CENTER_LAT=34.173
NEXT_PUBLIC_MAP_CENTER_LNG=134.609
NEXT_PUBLIC_MAP_ZOOM=12

# データソース
NEXT_PUBLIC_SHELTERS_DATA_URL=/data/shelters.geojson

# 分析（将来的に追加する場合）
# NEXT_PUBLIC_ANALYTICS_ID=

# デバッグ
NEXT_PUBLIC_DEBUG=false
```

---

### .gitignore

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts


# IDE
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea
*.swp
*.swo
*~

# OS
Thumbs.db
```

---

## 🔧 実装手順

### Step 1: ファイル作成（設定系）

```bash
# ルートディレクトリで実行
touch package.json
touch next.config.js
touch tsconfig.json
touch tailwind.config.ts
touch postcss.config.js
touch .eslintrc.json
touch .prettierrc
touch .prettierignore
touch .editorconfig
touch .env.example
touch .gitignore
```

### Step 2: 依存関係インストール

```bash
npm install
```

**確認事項:**
- [ ] `node_modules/` が作成される
- [ ] `package-lock.json` が作成される
- [ ] エラーなくインストール完了

### Step 3: ディレクトリ&初期ファイル作成

```bash
# ディレクトリ作成
mkdir -p src/app src/components/{map,shelter,ui} src/hooks src/lib src/types
mkdir -p public/{data,icons}
mkdir -p scripts

# 初期ファイル作成
touch src/app/layout.tsx
touch src/app/page.tsx
touch src/app/globals.css
touch src/types/shelter.ts
```

### Step 4: VSCode設定

```bash
mkdir -p .vscode
touch .vscode/settings.json
touch .vscode/launch.json
touch .vscode/extensions.json
```

### Step 5: 開発サーバー起動確認

```bash
npm run dev
```

**確認事項:**
- [ ] `http://localhost:3000` にアクセス可能
- [ ] ページが表示される
- [ ] TypeScriptエラーなし
- [ ] ESLintエラーなし

### Step 6: コマンド動作確認

```bash
# Lint
npm run lint

# Format
npm run format:check

# Type check
npm run type-check
```

**すべてエラーなく完了すればOK**

---

## ✅ Phase 3 完了確認

### ファイル存在確認

```bash
# 設定ファイル
ls -la package.json next.config.js tsconfig.json .eslintrc.json .prettierrc

# ディレクトリ
ls -la src/
ls -la .vscode/

# Node modules
ls -la node_modules/
```

### 動作確認

- [ ] `npm run dev` でサーバー起動
- [ ] `http://localhost:3000` で「鳴門市避難所マップ」と表示
- [ ] `npm run lint` でエラーなし
- [ ] `npm run type-check` でエラーなし
- [ ] `npm run format:check` でエラーなし

---

## 🚀 Phase 3 完了後

### 次のステップ

- [ ] Git コミット
  ```bash
  git add .
  git commit -m "chore: Setup development environment"
  ```
- [ ] **Phase 4: MVP実装** に進む（別途 `.docs/04-phase-mvp.md` 作成）

### 準備完了の目印

✅ ローカルで `npm run dev` が動作
✅ TypeScript厳格モードでエラーなし
✅ ESLint, Prettierが正常動作
✅ VSCodeでデバッグ可能

---

## 📚 参考リンク

### Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript ESLint](https://typescript-eslint.io/)

### ツール

- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Next:** Phase 4: MVP実装（`.docs/04-phase-mvp.md` として後で作成）
**Back:** [Phase 2: AI環境整備](./02-phase-ai-env.md)
