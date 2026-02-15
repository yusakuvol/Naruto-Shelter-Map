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
