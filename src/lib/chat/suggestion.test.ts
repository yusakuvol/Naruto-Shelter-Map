import { describe, expect, it } from 'vitest';
import type { ShelterFeature } from '@/types/shelter';
import { buildSuggestion } from './suggestion';

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

describe('buildSuggestion', () => {
  it('shelters が空なら null を返す', () => {
    const result = buildSuggestion(
      [],
      { latitude: 34.1, longitude: 134.5 },
      []
    );
    expect(result).toBeNull();
  });

  it('現在地なし + フィルタなし → null を返す', () => {
    const result = buildSuggestion([makeFeature()], null, []);
    expect(result).toBeNull();
  });

  it('現在地なし + フィルタあり → 件数メッセージを返す', () => {
    const shelters = [makeFeature({ id: 'a' }), makeFeature({ id: 'b' })];
    const result = buildSuggestion(shelters, null, ['津波']);
    expect(result).not.toBeNull();
    expect(result?.message).toContain('津波');
    expect(result?.message).toContain('2件');
    expect(result?.shelterId).toBeUndefined();
  });

  it('現在地なし + 複数フィルタ → フィルタ名が「・」区切り', () => {
    const result = buildSuggestion([makeFeature()], null, ['洪水', '津波']);
    expect(result?.message).toContain('洪水・津波');
  });

  it('現在地あり + フィルタなし → 最寄り避難所を返す', () => {
    const near = makeFeature({
      id: 'near',
      name: '近い避難所',
      coordinates: [134.5001, 34.1001],
    });
    const far = makeFeature({
      id: 'far',
      name: '遠い避難所',
      coordinates: [134.6, 34.2],
    });
    const result = buildSuggestion(
      [far, near],
      { latitude: 34.1, longitude: 134.5 },
      []
    );
    expect(result).not.toBeNull();
    expect(result?.message).toContain('近い避難所');
    expect(result?.message).toContain('最寄りの避難所は');
    expect(result?.shelterId).toBe('near');
  });

  it('現在地あり + フィルタあり → フィルタ対応の最寄りを返す', () => {
    const shelter = makeFeature({
      id: 'a',
      name: 'A避難所',
      coordinates: [134.5, 34.1],
    });
    const result = buildSuggestion(
      [shelter],
      { latitude: 34.1, longitude: 134.5 },
      ['地震']
    );
    expect(result).not.toBeNull();
    expect(result?.message).toContain('地震');
    expect(result?.message).toContain('A避難所');
    expect(result?.message).toContain('対応の最寄り避難所は');
    expect(result?.shelterId).toBe('a');
  });

  it('現在地あり + 避難所1件 → その避難所が最寄りになる', () => {
    const shelter = makeFeature({
      id: 'only',
      name: '唯一の避難所',
      coordinates: [134.5, 34.1],
    });
    const result = buildSuggestion(
      [shelter],
      { latitude: 34.1, longitude: 134.5 },
      []
    );
    expect(result?.shelterId).toBe('only');
  });

  it('現在地あり + 最初の要素が最寄りの場合も正しく動作する', () => {
    const near = makeFeature({
      id: 'near',
      name: '近い',
      coordinates: [134.5001, 34.1001],
    });
    const far = makeFeature({
      id: 'far',
      name: '遠い',
      coordinates: [134.6, 34.2],
    });
    const result = buildSuggestion(
      [near, far],
      { latitude: 34.1, longitude: 134.5 },
      []
    );
    expect(result?.shelterId).toBe('near');
  });

  it('距離が正しくフォーマットされる', () => {
    const shelter = makeFeature({
      id: 'a',
      name: 'A',
      coordinates: [134.5, 34.1],
    });
    const result = buildSuggestion(
      [shelter],
      { latitude: 34.1, longitude: 134.5 },
      []
    );
    // 距離がカッコ内に含まれる
    expect(result?.message).toMatch(/（.+）/);
  });
});
