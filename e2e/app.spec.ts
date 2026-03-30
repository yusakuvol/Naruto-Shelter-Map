import { expect, test } from '@playwright/test';

test.describe('地図ページの基本表示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ページが正常に読み込まれる', async ({ page }) => {
    // map-container が存在すること
    const mapContainer = page.locator('.map-container').first();
    await expect(mapContainer).toBeAttached({ timeout: 10_000 });
  });

  test('タイトルが正しい', async ({ page }) => {
    await expect(page).toHaveTitle(/鳴門/);
  });

  test('スクリーンリーダー用のステータスが存在する', async ({ page }) => {
    const status = page.locator('[role="status"]');
    await expect(status.first()).toBeAttached();
  });

  test('コンソールに致命的エラーがない', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(3_000);

    // WebGL の警告は無視し、アプリケーション固有のエラーがないことを確認
    const appErrors = errors.filter(
      (e) => !e.includes('WebGL') && !e.includes('GPU')
    );
    expect(appErrors).toHaveLength(0);
  });
});

test.describe('オフライン対応', () => {
  test('Service Worker が登録される', async ({ page }) => {
    await page.goto('/');

    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const registration = await navigator.serviceWorker.getRegistration('/');
      return registration !== undefined;
    });

    expect(swRegistered).toBe(true);
  });

  test('manifest.json が取得できる', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);
    const manifest = await response?.json();
    expect(manifest.name).toContain('鳴門');
    expect(manifest.display).toBe('standalone');
  });

  test('主要なアセットがキャッシュ可能', async ({ page }) => {
    // index.html が正常に返ること
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // GeoJSON データが取得できること
    const geoResponse = await page.evaluate(async () => {
      const res = await fetch('/data/shelters.geojson');
      return { status: res.status, ok: res.ok };
    });
    expect(geoResponse.ok).toBe(true);
  });
});
