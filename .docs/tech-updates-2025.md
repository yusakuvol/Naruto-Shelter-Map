# 2025年技術スタック更新ガイド

> **Last Updated:** 2025-10-16
> **Target:** 鳴門市避難所マッププロジェクト

---

## 📌 概要

このドキュメントは、本プロジェクトで採用した2025年最新の技術スタックについて、選定理由・移行ガイド・ベストプラクティスをまとめたものです。

---

## 🚀 主要な技術更新

### 1. パッケージマネージャー: pnpm 9.x

**選定理由:**
- **速度:** npmより最大3倍高速なインストール
- **ディスク効率:** ハードリンクによりディスク使用量を大幅削減
- **厳密性:** Phantom dependencies（幽霊依存関係）を防止
- **モノレポ対応:** 将来的な拡張が容易

**npmからの移行:**
```bash
# pnpmをグローバルインストール
npm install -g pnpm

# package-lock.jsonを削除
rm package-lock.json

# node_modulesを削除
rm -rf node_modules

# pnpmでインストール
pnpm install
```

**参考リンク:**
- [pnpm公式サイト](https://pnpm.io/)
- [pnpm vs npm vs yarn](https://pnpm.io/benchmarks)

---

### 2. React 19

**新機能:**
- **`use` hook:** Promise, Contextの読み取り
- **`useActionState` hook:** フォーム状態管理（旧useFormState）
- **`useOptimistic` hook:** 楽観的UI更新
- **Server Components:** デフォルトで有効
- **Actions:** 非同期トランジション
- **ref as props:** forwardRef不要

**コード例:**

```typescript
// use hook - Promise読み取り
import { use } from 'react';

function ShelterData({ shelterPromise }) {
  const shelter = use(shelterPromise); // Promiseを直接読み取り
  return <div>{shelter.name}</div>;
}

// useActionState - フォーム管理
import { useActionState } from 'react';

function SearchForm() {
  const [state, formAction] = useActionState(searchShelters, initialState);

  return (
    <form action={formAction}>
      <input name="query" />
      <button>検索</button>
    </form>
  );
}

// Server Components
// デフォルトでServer Component（'use client'なし）
async function ShelterList() {
  const shelters = await fetch('/api/shelters').then(r => r.json());
  return <ul>{shelters.map(s => <li key={s.id}>{s.name}</li>)}</ul>;
}
```

**参考リンク:**
- [React 19 Documentation](https://react.dev/)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)

---

### 3. Tailwind CSS v4

**新機能:**
- **Lightning CSS統合:** ビルド5倍高速、増分ビルド100倍高速
- **CSS-First設定:** JavaScript設定ファイル不要
- **OKLCH色空間:** P3ディスプレイ対応の鮮やかな色
- **ゼロコンフィグ:** 自動テンプレート検出

**移行手順:**

1. **v3の設定ファイル削除:**
```bash
rm tailwind.config.ts postcss.config.js
```

2. **globals.cssに追加:**
```css
/* src/app/globals.css */
@import "tailwindcss";

@layer base {
  html {
    @apply antialiased;
  }
}
```

3. **カスタムテーマ（必要な場合）:**
```css
@import "tailwindcss";

@theme {
  --color-primary-500: oklch(0.5 0.2 200);
  --color-primary-600: oklch(0.45 0.25 200);
}
```

**参考リンク:**
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/)
- [Tailwind v4 Migration Guide](https://tailwindcss.com/blog/tailwindcss-v4)

---

### 4. Biome（ESLint + Prettier置き換え）

**選定理由:**
- **速度:** フォーマット25倍、Lint15倍高速（Rust製）
- **統一ツール:** ESLint + Prettierを1つに統合
- **互換性:** Prettier 97%、ESLint 80%互換

**設定ファイル:**

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": [
      ".next",
      "node_modules",
      "out",
      "public"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "always"
    }
  }
}
```

**package.jsonスクリプト:**
```json
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "format:check": "biome format ."
  }
}
```

**参考リンク:**
- [Biome公式サイト](https://biomejs.dev/)
- [Biome vs ESLint/Prettier](https://biomejs.dev/internals/language-support/)

---



---

### 7. MapLibre GL JS 5.9.x

**新機能:**
- **Globe rendering mode:** 地球儀表示モード
- **パフォーマンス改善:** レンダリング最適化

**コード例:**

```typescript
// src/components/map/Map.tsx
'use client';

import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [134.609, 34.173], // 鳴門市
      zoom: 12,
      projection: 'globe', // Globe mode
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} className="h-screen w-full" />;
}
```

**参考リンク:**
- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js/docs/)
- [MapLibre v5 Release Notes](https://github.com/maplibre/maplibre-gl-js/releases)

---

### 8. Next.js 15 + Turbopack

**新機能:**
- **Turbopack:** デフォルトバンドラー（Webpackより5-10倍高速）
- **キャッシュ戦略明示化:** デフォルトでキャッシュなし
- **Partial Prerendering:** 実験的機能

**next.config.js:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // 静的エクスポート

  // Turbopack有効化（デフォルト）
  experimental: {
    turbo: {
      rules: {},
    },
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
```

**開発サーバー起動:**
```bash
pnpm dev --turbo  # Turbopack使用
```

**参考リンク:**
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Turbopack](https://nextjs.org/docs/architecture/turbopack)

---

## 🔧 移行チェックリスト

### npmからpnpmへ

- [ ] pnpmをグローバルインストール
- [ ] package-lock.json削除
- [ ] node_modules削除
- [ ] pnpm install実行
- [ ] .npmrc作成

### ESLint/PrettierからBiomeへ

- [ ] .eslintrc.json削除
- [ ] .prettierrc削除
- [ ] biome.json作成
- [ ] package.jsonスクリプト更新
- [ ] pnpm lint実行確認


### Tailwind v3からv4へ

- [ ] tailwind.config.ts削除
- [ ] postcss.config.js削除
- [ ] globals.cssに`@import "tailwindcss"`追加
- [ ] ビルド確認

---

## 📊 パフォーマンス比較

| 項目 | 従来 | 2025年版 | 改善率 |
|------|------|---------|--------|
| インストール速度 | npm (100%) | pnpm (330%) | **3.3倍** |
| Lintチェック | ESLint (100%) | Biome (1500%) | **15倍** |
| フォーマット | Prettier (100%) | Biome (2500%) | **25倍** |
| ビルド速度 | Webpack (100%) | Turbopack (500-1000%) | **5-10倍** |
| Tailwindビルド | v3 (100%) | v4 (500%) | **5倍** |

---

## 🔗 参考リンク

### 公式ドキュメント

- [pnpm](https://pnpm.io/)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Biome](https://biomejs.dev/)
- [MapLibre GL JS](https://maplibre.org/)
- [Next.js 15](https://nextjs.org/)

### マイグレーションガイド

- [npm to pnpm](https://pnpm.io/cli/import)
- [ESLint/Prettier to Biome](https://biomejs.dev/guides/migrate-eslint-prettier/)
- [Tailwind v3 to v4](https://tailwindcss.com/docs/upgrade-guide)

---

**Last Updated:** 2025-10-16
