# Phase 5: 機能拡張

> **Phase:** 5/5
> **難易度:** ⭐️⭐️⭐️⭐️ Very Hard
> **期間:** 2週間（約80時間）
> **前提条件:** Phase 4 (MVP) 完了
> **実装期間:** 2025-10-21 〜 2025-11-03
> **Status:** 🚧 進行中

---

## 🎯 Phase 5 のゴール

MVP（Phase 4）で構築した基本機能に加えて、**実用性を大幅に向上させる機能拡張**を実装し、以下を達成する：

1. ✅ 災害種別フィルタ機能（洪水/津波/地震などで絞り込み）
2. ✅ 現在地表示機能（Geolocation API活用）
3. ✅ 距離順ソート機能（現在地から近い順に表示）
4. ✅ GitHub Actions データ自動更新（毎週月曜 3:00 JST）
5. ✅ 検索機能（避難所名・住所で検索）
6. ✅ ルート案内機能（Google Maps連携）
7. ✅ Core Web Vitals維持（Performance 90+）

---

## 📋 実装チェックリスト

### Part 1: 災害種別フィルタ機能（Issue #13）

**優先度:** ⭐️⭐️⭐️⭐️⭐️ (最高)
**期間:** 2-3日
**難易度:** Medium

- [ ] DisasterTypeFilter コンポーネント作成
- [ ] チェックボックスUI実装（アクセシビリティ対応）
- [ ] useShelters フックに `filterByDisasterType` ロジック追加
- [ ] 状態管理（選択された災害種別の保持）
- [ ] フィルタ適用時のマーカー更新
- [ ] リスト表示の同期
- [ ] レスポンシブ対応（モバイル/デスクトップ）
- [ ] パフォーマンステスト（150件→フィルタ後のレンダリング）
- [ ] E2Eテスト（Playwright MCP）

**成果物:**
- `src/components/filter/DisasterTypeFilter.tsx`
- `src/hooks/useDisasterFilter.ts`
- `src/lib/filter-utils.ts`（フィルタロジック）

---

### Part 2: 現在地表示機能（Issue #14）

**優先度:** ⭐️⭐️⭐️⭐️ (高)
**期間:** 2-3日
**難易度:** Medium

- [ ] Geolocation API統合
- [ ] 位置情報許可ダイアログUI
- [ ] 現在地マーカー表示（青い円形マーカー）
- [ ] エラーハンドリング（位置情報拒否/取得失敗）
- [ ] 現在地ボタン追加（地図コントロール）
- [ ] 現在地への移動アニメーション
- [ ] 精度表示（Accuracy circle）
- [ ] オフライン時のフォールバック
- [ ] プライバシー配慮（位置情報をサーバー送信しない）
- [ ] E2Eテスト（位置情報モック）

**成果物:**
- `src/components/map/CurrentLocationMarker.tsx`
- `src/components/map/CurrentLocationButton.tsx`
- `src/hooks/useGeolocation.ts`
- `src/lib/geolocation.ts`（ユーティリティ）

**技術的考慮:**
- Geolocation API の `watchPosition` vs `getCurrentPosition`
  - **採用:** `getCurrentPosition`（バッテリー消費を抑える）
  - ユーザーが「現在地ボタン」を押した時のみ取得
- 精度: `enableHighAccuracy: true`（GPS優先）
- タイムアウト: 10秒

---

### Part 3: 距離順ソート機能（Issue #15）

**優先度:** ⭐️⭐️⭐️⭐️ (高)
**期間:** 2-3日
**難易度:** Medium
**依存関係:** Part 2（現在地表示）完了後

- [ ] Haversine公式実装（2点間距離計算）
- [ ] 距離計算ユーティリティ作成
- [ ] ソートボタンUI追加（「距離順」「名前順」トグル）
- [ ] 避難所リストのソート機能実装
- [ ] 距離表示（「約1.2km」形式）
- [ ] パフォーマンス最適化（useMemoでメモ化）
- [ ] エッジケース対応（現在地未取得時）
- [ ] ユニットテスト（距離計算の精度確認）

**成果物:**
- `src/lib/distance.ts`（Haversine公式）
- `src/components/shelter/SortButton.tsx`
- `src/hooks/useSortedShelters.ts`

**技術仕様:**

```typescript
// Haversine公式（2点間距離計算）
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // 地球の半径（km）
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
```

**距離表示フォーマット:**
- `< 1km`: 「約800m」（100m単位）
- `>= 1km`: 「約1.2km」（0.1km単位）
- `>= 10km`: 「約12km」（1km単位）

---

### Part 4: GitHub Actions データ自動更新（Issue #12）

**優先度:** ⭐️⭐️⭐️⭐️ (高)
**期間:** 3-4日
**難易度:** Hard

- [ ] ETLスクリプト作成（TypeScript）
- [ ] 国土地理院APIからデータ取得
- [ ] GeoJSON変換ロジック実装
- [ ] データ検証（スキーマチェック）
- [ ] GitHub Actions ワークフロー作成
- [ ] スケジュール設定（毎週月曜 3:00 JST）
- [ ] 手動トリガー対応（workflow_dispatch）
- [ ] エラー通知（GitHub Issues自動作成）
- [ ] 差分検出（変更がない場合はコミットしない）
- [ ] テスト環境での動作確認

**成果物:**
- `scripts/fetch-shelters.ts`（ETLスクリプト）
- `.github/workflows/update-shelters.yml`
- `scripts/validate-geojson.ts`（データ検証）

**技術仕様:**

**スクリプト仕様:**
```typescript
// scripts/fetch-shelters.ts
import { writeFile } from 'node:fs/promises';

interface GSIResponse {
  // 国土地理院APIレスポンス型
}

async function fetchSheltersFromGSI(): Promise<ShelterGeoJSON> {
  // 1. 国土地理院APIからデータ取得
  const response = await fetch('https://...');
  const data: GSIResponse = await response.json();

  // 2. 鳴門市のデータのみ抽出
  const narutoShelters = data.features.filter(
    (f) => f.properties.city === '鳴門市'
  );

  // 3. GeoJSONに変換
  return {
    type: 'FeatureCollection',
    features: narutoShelters.map(transformToShelterFeature),
  };
}

async function main(): Promise<void> {
  const shelters = await fetchSheltersFromGSI();

  // 検証
  validateGeoJSON(shelters);

  // 保存
  await writeFile(
    'public/data/shelters.geojson',
    JSON.stringify(shelters, null, 2)
  );
}

main().catch(console.error);
```

**GitHub Actions ワークフロー:**
```yaml
name: Update Shelter Data

on:
  schedule:
    # 毎週月曜 3:00 JST (日曜 18:00 UTC)
    - cron: '0 18 * * 0'
  workflow_dispatch: # 手動実行

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Fetch latest shelter data
        run: pnpm tsx scripts/fetch-shelters.ts

      - name: Validate GeoJSON
        run: pnpm tsx scripts/validate-geojson.ts

      - name: Check for changes
        id: changes
        run: |
          git diff --exit-code public/data/shelters.geojson || echo "changed=true" >> $GITHUB_OUTPUT

      - name: Commit and push
        if: steps.changes.outputs.changed == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add public/data/shelters.geojson
          git commit -m "chore(data): Update shelter data ($(date +%Y-%m-%d))"
          git push

      - name: Create issue on error
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'データ自動更新が失敗しました',
              body: '...',
              labels: ['automation', 'bug']
            })
```

**スケジュール:**
- **頻度:** 毎週月曜 3:00 JST
- **理由:** 国土地理院データは頻繁に更新されないため、毎日は不要
- **手動実行:** 緊急時は `workflow_dispatch` で手動実行可能

---

### Part 5: 検索機能（Bonus）

**優先度:** ⭐️⭐️⭐️ (中)
**期間:** 1-2日
**難易度:** Easy

- [ ] 検索バーUI改善（既存のSearchBar拡張）
- [ ] 検索ロジック実装（名前・住所の部分一致）
- [ ] 検索結果ハイライト
- [ ] 検索履歴（LocalStorage保存）
- [ ] オートコンプリート（候補表示）
- [ ] 検索結果への地図移動

**成果物:**
- `src/components/search/SearchBar.tsx`（拡張）
- `src/hooks/useSearch.ts`
- `src/lib/search-utils.ts`

---

### Part 6: ルート案内機能（Google Maps連携）

**優先度:** ⭐️⭐️ (低)
**期間:** 1日
**難易度:** Easy

- [ ] 「ルート案内」ボタン追加（避難所詳細）
- [ ] Google Mapsアプリ起動リンク実装
- [ ] iOS/Android/Webでの動作確認
- [ ] エラーハンドリング（Google Maps未インストール時）

**成果物:**
- `src/components/shelter/RouteButton.tsx`
- `src/lib/navigation.ts`

**技術仕様:**

```typescript
// Google Maps URLスキーム
export function openGoogleMapsRoute(
  destLat: number,
  destLng: number,
  destName: string
): void {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    // モバイル: Google Mapsアプリ起動
    window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&destination_place_id=${encodeURIComponent(destName)}`;
  } else {
    // デスクトップ: 新しいタブで開く
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`,
      '_blank'
    );
  }
}
```

---

## 🔧 技術的決定（ADR）

### ADR-006: フィルタ状態管理 - Zustand vs useState

**決定:** `useState` + Context API を使用（Zustand不採用）

**理由:**
- ✅ フィルタ状態は単純（配列1つのみ）
- ✅ Zustandは過剰（バンドルサイズ増加）
- ✅ Context APIで十分
- ❌ Zustand: MVP段階では不要

**実装:**
```typescript
// src/contexts/FilterContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';
import type { DisasterType } from '@/types/shelter';

interface FilterContextValue {
  selectedDisasters: DisasterType[];
  toggleDisaster: (disaster: DisasterType) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedDisasters, setSelectedDisasters] = useState<DisasterType[]>([]);

  const toggleDisaster = (disaster: DisasterType) => {
    setSelectedDisasters((prev) =>
      prev.includes(disaster)
        ? prev.filter((d) => d !== disaster)
        : [...prev, disaster]
    );
  };

  const clearFilters = () => setSelectedDisasters([]);

  return (
    <FilterContext.Provider value={{ selectedDisasters, toggleDisaster, clearFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) throw new Error('useFilter must be used within FilterProvider');
  return context;
}
```

---

### ADR-007: 距離計算 - Haversine vs Vincenty

**決定:** Haversine公式を採用

**理由:**
- ✅ シンプルで高速
- ✅ 短距離（<100km）では十分な精度（誤差<1%）
- ✅ バンドルサイズ小（Vincenty不要）
- ❌ Vincenty: 精度は高いが計算コスト大

**精度比較:**
| 距離 | Haversine誤差 | Vincenty誤差 |
|------|--------------|-------------|
| 1km  | <10m         | <1m         |
| 10km | <100m        | <10m        |
| 100km| <1km         | <100m       |

鳴門市内（最大30km程度）では Haversine で十分。

---

### ADR-008: データ更新頻度 - 毎日 vs 毎週

**決定:** 毎週月曜 3:00 JST

**理由:**
- ✅ 国土地理院データは頻繁に更新されない（月次〜年次）
- ✅ GitHub Actions無料枠節約
- ✅ 手動実行可能（緊急時）
- ❌ 毎日更新は不要（データ変更率<1%/月）

---

## 🐛 想定される課題とトラブルシューティング

### Issue 1: 位置情報が取得できない

**症状:**
- Geolocation API が `PositionError` を返す
- `PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT`

**対処法:**
```typescript
export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'お使いのブラウザは位置情報に対応していません',
      } as GeolocationPositionError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition(pos),
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError({ ...err, message: '位置情報の利用が拒否されました' });
            break;
          case err.POSITION_UNAVAILABLE:
            setError({ ...err, message: '位置情報を取得できませんでした' });
            break;
          case err.TIMEOUT:
            setError({ ...err, message: '位置情報の取得がタイムアウトしました' });
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5分間キャッシュ
      }
    );
  };

  return { position, error, getCurrentPosition };
}
```

---

### Issue 2: GitHub Actions でのpnpm version conflict

**症状:**
```
Error: Multiple versions of pnpm specified
```

**原因:**
`pnpm/action-setup@v4` は `package.json` の `packageManager` から自動検出するため、`version` 指定が競合。

**解決策:**
```yaml
# ❌ Bad
- uses: pnpm/action-setup@v4
  with:
    version: 9

# ✅ Good
- uses: pnpm/action-setup@v4
```

---

### Issue 3: 災害種別フィルタが遅い（150件処理）

**症状:**
- フィルタ適用時に画面が一瞬フリーズ
- レンダリングに200ms以上かかる

**対処法:**
```typescript
// useMemo でフィルタ結果をメモ化
const filteredShelters = useMemo(() => {
  if (selectedDisasters.length === 0) return shelters;

  return shelters.filter((shelter) =>
    selectedDisasters.some((disaster) =>
      shelter.properties.disaster_types.includes(disaster)
    )
  );
}, [shelters, selectedDisasters]);
```

---

## 📊 成果指標

### 機能完成度

| 機能 | 状態 | 優先度 |
|------|------|--------|
| 災害種別フィルタ | 🚧 開発中 | ⭐️⭐️⭐️⭐️⭐️ |
| 現在地表示 | ⏳ 未着手 | ⭐️⭐️⭐️⭐️ |
| 距離順ソート | ⏳ 未着手 | ⭐️⭐️⭐️⭐️ |
| データ自動更新 | ⏳ 未着手 | ⭐️⭐️⭐️⭐️ |
| 検索機能 | ⏳ 未着手 | ⭐️⭐️⭐️ |
| ルート案内 | ⏳ 未着手 | ⭐️⭐️ |

### Core Web Vitals（維持目標）

| 指標 | Phase 4 | Phase 5目標 |
|------|---------|-----------|
| LCP | 1.1s | <2.5s |
| CLS | 0.00 | <0.1 |
| TTFB | 106ms | <800ms |

### パフォーマンス

| 項目 | 目標 |
|------|------|
| フィルタ適用時間 | <100ms |
| 距離計算時間（150件） | <50ms |
| 検索結果表示時間 | <200ms |

---

## 🚀 実装スケジュール

### Week 1（10/21 - 10/27）

- **Day 1-2:** 災害種別フィルタ実装
- **Day 3-4:** 現在地表示機能実装
- **Day 5-6:** 距離順ソート機能実装
- **Day 7:** E2Eテスト、デバッグ

### Week 2（10/28 - 11/03）

- **Day 8-10:** GitHub Actions データ自動更新実装
- **Day 11-12:** 検索機能実装
- **Day 13:** ルート案内機能実装
- **Day 14:** 統合テスト、ドキュメント更新、デプロイ

---

## 🔄 Phase 5 完了条件

### 必須条件

- [ ] Issue #13, #14, #15, #12 をすべてクローズ
- [ ] すべての機能がE2Eテストでパス
- [ ] Core Web Vitals が Phase 4 レベルを維持（LCP<2.5s, CLS<0.1）
- [ ] TypeScript エラー 0件
- [ ] Biome Lint エラー 0件
- [ ] GitHub Actions が正常動作（データ自動更新成功）
- [ ] Cloudflare Pages にデプロイ完了

### 推奨条件

- [ ] 検索機能実装完了
- [ ] ルート案内機能実装完了
- [ ] Lighthouse スコア 90+ 維持
- [ ] ユーザーテスト実施（5名以上）

---

## 📝 次のステップ（Phase 6以降）

Phase 5完了後、以下の機能拡張を検討：

1. **多言語対応**（英語、やさしい日本語）
2. **MapLibre Vector Tiles対応**（完全オフライン化）
3. **他市町村対応**（徳島県全域）
4. **ダークモード対応**
5. **通知機能**（新しい避難所追加時）
6. **避難所レビュー機能**（コミュニティ投稿）

---

## 📚 参考リンク

### プロジェクト内ドキュメント

- [Phase 4: MVP実装](./04-phase-mvp.md)
- [MASTER PLAN](./00-MASTER-PLAN.md)
- [AGENTS.md](../AGENTS.md)
- [CLAUDE.md](../CLAUDE.md)

### GitHub Issues

- [Issue #13: 災害種別フィルタ機能](https://github.com/yusakuvol/Naruto-Shelter-Map/issues/13)
- [Issue #14: 現在地表示機能](https://github.com/yusakuvol/Naruto-Shelter-Map/issues/14)
- [Issue #15: 距離順ソート機能](https://github.com/yusakuvol/Naruto-Shelter-Map/issues/15)
- [Issue #12: GitHub Actions - データ自動更新](https://github.com/yusakuvol/Naruto-Shelter-Map/issues/12)

### 技術ドキュメント

- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [GitHub Actions - Scheduled Events](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Google Maps URL Scheme](https://developers.google.com/maps/documentation/urls/get-started)

---

**Phase 5 開始日:** 2025-10-21

**次のフェーズ:** Phase 6（多言語対応・完全オフライン化）- 未定
