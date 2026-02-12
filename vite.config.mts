import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // ユーザーが手動で更新を承認するまで待つ（next-pwa の skipWaiting: false に相当）
      includeAssets: ['favicon.ico', 'icons/*', 'data/*', 'manifest.json'],
      manifest: false, // public/manifest.json を静的利用する
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,geojson,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.jp\/data\/.*\.pbf/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-vector-tiles',
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.jp\/fonts\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-fonts',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.jp\/styles\/.*\/sprite.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-sprites',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.jp\/styles\/.*\/style\.json/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'osm-styles',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /\.pbf$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'vector-tiles',
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/style\.json$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'map-styles',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /\/fonts\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-fonts',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/sprite.*\.(?:png|json)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-sprites',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/api\.maptiler\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'maptiler-tiles',
              expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
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
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
