const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/tile\.openstreetmap\.jp\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'osm-tiles',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30日
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30日
        },
      },
    },
    {
      urlPattern: /\.geojson$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'geojson-data',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7日
        },
      },
    },
  ],
});

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

  // FIXME: Next.js 16のTurbopackでnext/font/googleに問題があるため
  // 環境変数でTurbopackを無効化できるようにする
  // Cloudflare Pagesでは DISABLE_TURBOPACK=1 を設定
  // https://github.com/vercel/next.js/issues/71920
  // TODO: Turbopackでフォント問題が解決したらwebpack設定を削除（Issue #107）
  ...(process.env.DISABLE_TURBOPACK !== '1' && { turbopack: {} }),

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

module.exports = withPWA(nextConfig);
