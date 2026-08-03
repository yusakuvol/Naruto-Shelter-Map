import { expect, test } from '@playwright/test';

test.describe('地図ページの基本表示', () => {
  test('ページが正常に読み込まれる', async ({ page }) => {
    await page.goto('/');
    // map-container が存在すること
    const mapContainer = page.locator('.map-container');
    await expect(mapContainer).toBeAttached({ timeout: 10_000 });
    await expect(mapContainer).toHaveCount(1);
    // 避難所はDOMマーカーではなくMapLibreレイヤーで描画する
    await expect(page.locator('.maplibregl-marker')).toHaveCount(0);
  });

  test('タイトルが正しい', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/鳴門/);
  });

  test('スクリーンリーダー用のステータスが存在する', async ({ page }) => {
    await page.goto('/');
    const status = page.locator('[role="status"]');
    await expect(status.first()).toBeAttached();
  });

  test('モバイルの避難所一覧から避難所を選択できる', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: '避難所一覧を表示' }).click();

    await expect(page.getByRole('heading', { name: '避難所一覧' })).toBeVisible();
    await page
      .locator('[data-slot="drawer-content"] [role="button"]')
      .first()
      .click();

    await expect(page.locator('[data-slot="drawer-content"]')).toBeHidden();
    await expect(
      page.locator('.shelter-popup').getByRole('button', {
        name: /の詳細を見る$/,
      })
    ).toBeVisible();
  });

  test('地図レイヤーの避難所をクリックできる', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('382件の避難所')).toBeVisible();
    const canvas = page.locator('canvas.maplibregl-canvas');
    await expect(canvas).toBeVisible();

    await expect
      .poll(
        async () => {
          const bounds = await canvas.boundingBox();
          if (!bounds) return false;
          await canvas.click({
            position: { x: bounds.width / 2, y: bounds.height / 2 },
          });
          return page.locator('.shelter-popup').isVisible();
        },
        { timeout: 10_000 }
      )
      .toBe(true);
    await expect(
      page.locator('.shelter-popup').getByRole('button', {
        name: /の詳細を見る$/,
      })
    ).toBeVisible();
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

    await expect
      .poll(
        () =>
          page.evaluate(async () => {
            if (!('serviceWorker' in navigator)) return false;
            const registration =
              await navigator.serviceWorker.getRegistration('/');
            return registration !== undefined;
          }),
        { timeout: 15_000 }
      )
      .toBe(true);
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
