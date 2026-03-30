import { describe, expect, it } from 'vitest';
import type { ShelterFeature } from '@/types/shelter';
import { buildAnswer } from './answer';

function makeFeature(
  overrides: Partial<ShelterFeature['properties']> & {
    coordinates?: [number, number];
  } = {}
): ShelterFeature {
  const { coordinates = [134.5, 34.1], ...props } = overrides;
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates },
    properties: {
      id: 's1',
      name: 'テスト避難所',
      type: '指定避難所',
      address: '徳島県鳴門市',
      disasterTypes: ['洪水', '津波'],
      source: '国土地理院',
      updatedAt: '2026-01-01',
      ...props,
    },
  };
}

describe('buildAnswer', () => {
  it('disaster: 津波でマッチする避難所を返す', () => {
    const features = [
      makeFeature({ id: 'a', name: 'A', disasterTypes: ['津波'] }),
      makeFeature({ id: 'b', name: 'B', disasterTypes: ['洪水'] }),
    ];
    const res = buildAnswer({
      intent: 'disaster',
      query: '津波対応の避難所は？',
      features,
    });
    expect(res).toContain('1 件');
    expect(res).toContain('A');
    expect(res).not.toContain('B');
  });

  it('nearest: 位置情報なしのとき案内文', () => {
    const res = buildAnswer({
      intent: 'nearest',
      query: '一番近い避難所',
      features: [makeFeature()],
      userPosition: null,
    });
    expect(res).toContain('位置情報をオンに');
  });

  it('nearest: 位置情報ありのとき距離順', () => {
    const features = [
      makeFeature({ id: 'far', name: 'Far', coordinates: [134.6, 34.2] }),
      makeFeature({
        id: 'near',
        name: 'Near',
        coordinates: [134.5001, 34.1001],
      }),
    ];
    const res = buildAnswer({
      intent: 'nearest',
      query: '近い',
      features,
      userPosition: { latitude: 34.1, longitude: 134.5 },
    });
    expect(res).toContain('Near');
    expect(res).toContain('Far');
    expect(res.indexOf('Near')).toBeLessThan(res.indexOf('Far'));
  });

  it('capacity: 収容人数でソートして返す', () => {
    const features = [
      makeFeature({ id: 'a', name: 'A', capacity: 50 }),
      makeFeature({ id: 'b', name: 'B', capacity: 100 }),
    ];
    const res = buildAnswer({
      intent: 'capacity',
      query: '収容人数',
      features,
    });
    expect(res).toContain('B');
    expect(res).toContain('100人');
  });

  it('count: 件数と地域別内訳', () => {
    const features = [
      makeFeature({ id: '1', regionName: '鳴門市' }),
      makeFeature({ id: '2', regionName: '鳴門市' }),
      makeFeature({ id: '3', regionName: '松茂町' }),
    ];
    const res = buildAnswer({
      intent: 'count',
      query: '何件',
      features,
    });
    expect(res).toContain('3 件');
    expect(res).toContain('鳴門市');
    expect(res).toContain('松茂町');
  });

  it('shelter_type: 指定と緊急の両方のときは3種すべてを返す', () => {
    const features = [
      makeFeature({ id: 'a', name: 'A', type: '指定避難所' }),
      makeFeature({ id: 'b', name: 'B', type: '緊急避難場所' }),
      makeFeature({ id: 'c', name: 'C', type: '両方' }),
    ];
    const res = buildAnswer({
      intent: 'shelter_type',
      query: '指定避難所と緊急避難場所は？',
      features,
    });
    expect(res).toContain('3 件');
    expect(res).toContain('指定避難所・緊急避難場所・両方');
    expect(res).toContain('A');
    expect(res).toContain('B');
    expect(res).toContain('C');
  });

  // --- disaster: 未カバーパス ---

  it('disaster: 災害種別が不明のとき案内文を返す', () => {
    const res = buildAnswer({
      intent: 'disaster',
      query: 'なにかの災害',
      features: [makeFeature()],
    });
    expect(res).toContain('どの災害種別');
  });

  it('disaster: マッチする避難所が0件のとき', () => {
    const res = buildAnswer({
      intent: 'disaster',
      query: '火災対応は？',
      features: [makeFeature({ disasterTypes: ['洪水'] })],
    });
    expect(res).toContain('火災');
    expect(res).toContain('見つかりませんでした');
  });

  it('disaster: 6件以上のとき「他 N 件」を表示', () => {
    const features = Array.from({ length: 7 }, (_, i) =>
      makeFeature({ id: `s${i}`, name: `避難所${i}`, disasterTypes: ['津波'] })
    );
    const res = buildAnswer({
      intent: 'disaster',
      query: '津波',
      features,
    });
    expect(res).toContain('7 件');
    expect(res).toContain('他 2 件');
  });

  it('disaster: regionName付きの避難所を括弧付きで表示', () => {
    const features = [
      makeFeature({
        id: 'r1',
        name: '鳴門東小学校',
        regionName: '鳴門町',
        disasterTypes: ['地震'],
      }),
    ];
    const res = buildAnswer({
      intent: 'disaster',
      query: '地震対応は？',
      features,
    });
    expect(res).toContain('鳴門東小学校（鳴門町）');
  });

  // --- nearest: 未カバーパス ---

  it('nearest: 避難所が0件のとき', () => {
    const res = buildAnswer({
      intent: 'nearest',
      query: '近い避難所',
      features: [],
      userPosition: { latitude: 34.1, longitude: 134.5 },
    });
    expect(res).toContain('避難所がありません');
  });

  // --- capacity: 未カバーパス ---

  it('capacity: 6件以上のとき「他 N 件」を表示', () => {
    const features = Array.from({ length: 7 }, (_, i) =>
      makeFeature({ id: `c${i}`, name: `施設${i}`, capacity: 100 - i })
    );
    const res = buildAnswer({
      intent: 'capacity',
      query: '収容人数',
      features,
    });
    expect(res).toContain('他 2 件');
  });

  it('capacity: 収容人数が登録されている避難所が0件のとき', () => {
    const res = buildAnswer({
      intent: 'capacity',
      query: '収容人数',
      features: [makeFeature()],
    });
    expect(res).toContain('収容人数が登録されている避難所は');
    expect(res).toContain('ありません');
  });

  // --- place_or_name: 未カバーパス ---

  it('place_or_name: クエリが2文字未満のとき', () => {
    const res = buildAnswer({
      intent: 'place_or_name',
      query: 'A',
      features: [makeFeature()],
    });
    expect(res).toContain('2文字以上');
  });

  it('place_or_name: 一致する避難所がないとき', () => {
    const res = buildAnswer({
      intent: 'place_or_name',
      query: '存在しない場所',
      features: [makeFeature()],
    });
    expect(res).toContain('見つかりませんでした');
  });

  it('place_or_name: 6件以上のとき「他 N 件」を表示', () => {
    const features = Array.from({ length: 7 }, (_, i) =>
      makeFeature({
        id: `p${i}`,
        name: `鳴門施設${i}`,
        address: '鳴門市',
      })
    );
    const res = buildAnswer({
      intent: 'place_or_name',
      query: '鳴門施設',
      features,
    });
    expect(res).toContain('7 件');
    expect(res).toContain('他 2 件');
  });

  it('place_or_name: 名前で一致する避難所を返す', () => {
    const features = [
      makeFeature({ id: 'a', name: '鳴門西小学校', address: '鳴門市撫養町' }),
    ];
    const res = buildAnswer({
      intent: 'place_or_name',
      query: '鳴門西',
      features,
    });
    expect(res).toContain('1 件');
    expect(res).toContain('鳴門西小学校');
  });

  // --- shelter_type: 未カバーパス ---

  it('shelter_type: 指定避難所のみ', () => {
    const features = [
      makeFeature({ id: 'a', name: 'A', type: '指定避難所' }),
      makeFeature({ id: 'b', name: 'B', type: '緊急避難場所' }),
    ];
    const res = buildAnswer({
      intent: 'shelter_type',
      query: '指定避難所は？',
      features,
    });
    expect(res).toContain('1 件');
    expect(res).toContain('A');
    expect(res).not.toContain('B');
  });

  it('shelter_type: 緊急避難場所のみ', () => {
    const features = [
      makeFeature({ id: 'a', name: 'A', type: '指定避難所' }),
      makeFeature({ id: 'b', name: 'B', type: '緊急避難場所' }),
    ];
    const res = buildAnswer({
      intent: 'shelter_type',
      query: '緊急避難場所は？',
      features,
    });
    expect(res).toContain('1 件');
    expect(res).toContain('B');
    expect(res).not.toContain('A');
  });

  it('shelter_type: どちらも含まないクエリは「両方」で絞り込む', () => {
    const features = [
      makeFeature({ id: 'a', name: 'A', type: '両方' }),
      makeFeature({ id: 'b', name: 'B', type: '指定避難所' }),
    ];
    const res = buildAnswer({
      intent: 'shelter_type',
      query: '避難所の種類は？',
      features,
    });
    expect(res).toContain('1 件');
    expect(res).toContain('A');
  });

  it('shelter_type: 6件以上のとき「他 N 件」を表示', () => {
    const features = Array.from({ length: 7 }, (_, i) =>
      makeFeature({ id: `t${i}`, name: `施設${i}`, type: '指定避難所' })
    );
    const res = buildAnswer({
      intent: 'shelter_type',
      query: '指定避難所は？',
      features,
    });
    expect(res).toContain('7 件');
    expect(res).toContain('他 2 件');
  });

  it('shelter_type: マッチ0件のとき', () => {
    const res = buildAnswer({
      intent: 'shelter_type',
      query: '緊急避難場所は？',
      features: [makeFeature({ type: '指定避難所' })],
    });
    expect(res).toContain('ありません');
  });

  // --- count: 未カバーパス ---

  it('count: 避難所が0件のとき', () => {
    const res = buildAnswer({
      intent: 'count',
      query: '何件ある？',
      features: [],
    });
    expect(res).toContain('避難所はありません');
  });

  it('unknown: 案内文を返す', () => {
    const res = buildAnswer({
      intent: 'unknown',
      query: '？',
      features: [makeFeature()],
    });
    expect(res).toContain('津波対応');
    expect(res).toContain('一番近い');
  });
});
