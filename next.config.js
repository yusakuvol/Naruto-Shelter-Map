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
