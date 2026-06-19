import { expect, test } from '@playwright/test';

/** 鳴門市中心部（地図の初期表示位置と同じ） */
const NARUTO_CENTER = { latitude: 34.173, longitude: 134.609 };

test.use({
  permissions: ['geolocation'],
  geolocation: NARUTO_CENTER,
});

test.describe('完全オフライン対応（同梱PMTiles）', () => {
  test('初回アクセス後、機内モードでも地図表示と避難所の確認ができる', async ({
    page,
    context,
  }) => {
    // precache（約23MB・796ファイル）の完了待ちがあるため余裕を持たせる
    test.setTimeout(120_000);

    // 1. オンラインで初回アクセスし、Service Worker の precache 完了と
    //    activation（オフライン時にナビゲーションを処理できる状態）を待つ
    await page.goto('/');
    await page.waitForFunction(
      async () => {
        if (!('caches' in window) || !('serviceWorker' in navigator)) {
          return false;
        }
        const registration = await navigator.serviceWorker.getRegistration('/');
        if (registration?.active?.state !== 'activated') {
          return false;
        }
        const cached = await caches.match('/map/basemap.pmtiles', {
          ignoreSearch: true,
        });
        return cached !== undefined;
      },
      undefined,
      { timeout: 90_000 }
    );

    // 2. Service Worker がページをコントロールするまでリロードする
    //    （clients.claim() を使っていないため、コントロールは次のナビゲーションから）
    await expect
      .poll(
        async () => {
          await page.reload();
          return page.evaluate(
            () => navigator.serviceWorker.controller !== null
          );
        },
        { timeout: 30_000 }
      )
      .toBe(true);

    // 3. 機内モード（オフライン）にしてリロード
    await context.setOffline(true);
    await page.reload();

    // アプリシェルと地図キャンバスが表示される
    await expect(page.locator('.map-container').first()).toBeAttached({
      timeout: 15_000,
    });
    await expect(
      page.locator('canvas.maplibregl-canvas').filter({ visible: true }).first()
    ).toBeVisible({ timeout: 15_000 });

    // 地図リソース（タイル・グリフ・スプライト）がオフラインで取得できる
    const resources = await page.evaluate(async () => {
      const tile = await fetch('/map/basemap.pmtiles', {
        headers: { range: 'bytes=0-16383' },
      });
      const glyph = await fetch('/map/fonts/Noto Sans Regular/0-255.pbf');
      const sprite = await fetch('/map/sprites/v4/light.json');
      return { tile: tile.ok, glyph: glyph.ok, sprite: sprite.ok };
    });
    expect(resources).toEqual({ tile: true, glyph: true, sprite: true });

    // 4. 現在地を取得できる（現在地マーカーが表示される）
    await page
      .getByRole('button', { name: /現在地を表示/ })
      .filter({ visible: true })
      .first()
      .click();
    await expect(
      page
        .locator('[role="img"][aria-label="現在地"]')
        .filter({ visible: true })
        .first()
    ).toBeVisible({ timeout: 15_000 });

    // 5. 避難所マーカーを選択して詳細を確認できる
    //    （現在地への移動でマーカーが画面外にあることがあるため click イベントを直接発火する）
    await page
      .getByRole('button', { name: /を選択$/ })
      .filter({ visible: true })
      .first()
      .dispatchEvent('click');
    await expect(
      page
        .getByRole('button', { name: /の詳細を見る$/ })
        .filter({ visible: true })
        .first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
