import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      // hooks 配下すべてをカバレッジ対象とする（test:coverage 用）
      include: ['src/hooks/*.ts'],
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt', // ユーザーが手動で更新を承認するまで待つ（next-pwa の skipWaiting: false に相当）
      includeAssets: ['favicon.ico', 'icons/*', 'data/*', 'manifest.json'],
      manifest: false, // public/manifest.json を静的利用する
      workbox: {
        // 地図タイル（pmtiles）・フォント（pbf）も同梱・precache し、
        // 初回インストール直後から完全オフラインで地図を表示できるようにする
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2,geojson,json,pbf,pmtiles}',
        ],
        globIgnores: ['**/webllm-*.js'], // WebLLM はオンデマンド読み込み、precache 対象外
        // basemap.pmtiles（約10MB）を precache するため上限を引き上げる
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\.geojson$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'geojson-data',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rolldownOptions: {
      output: {
        manualChunks(id): string | undefined {
          if (id.includes('@mlc-ai/web-llm')) {
            return 'webllm';
          }
          return undefined;
        },
      },
    },
  },
});
