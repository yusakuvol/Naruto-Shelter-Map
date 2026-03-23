import { describe, expect, it } from 'vitest';
import type { ShelterFeature } from '@/types/shelter';
import { buildSystemPrompt } from './systemPrompt';

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

describe('buildSystemPrompt', () => {
  it('避難所データがプロンプトに含まれる', () => {
    const features = [makeFeature({ name: '鳴門公民館' })];
    const result = buildSystemPrompt(features, null);
    expect(result).toContain('鳴門公民館');
  });

  it('現在地ありのとき緯度・経度が含まれる', () => {
    const result = buildSystemPrompt([makeFeature()], {
      latitude: 34.1234,
      longitude: 134.5678,
    });
    expect(result).toContain('34.1234');
    expect(result).toContain('134.5678');
  });

  it('現在地なしのとき「不明」と表示される', () => {
    const result = buildSystemPrompt([makeFeature()], null);
    expect(result).toContain('現在地: 不明');
  });

  it('システムプロンプトに回答ルールが含まれる', () => {
    const result = buildSystemPrompt([makeFeature()], null);
    expect(result).toContain('回答ルール');
    expect(result).toContain('鳴門市の避難所案内アシスタント');
  });

  it('複数の避難所がすべてコンテキストに含まれる', () => {
    const features = [
      makeFeature({ name: '避難所A' }),
      makeFeature({ name: '避難所B' }),
    ];
    const result = buildSystemPrompt(features, null);
    expect(result).toContain('避難所A');
    expect(result).toContain('避難所B');
  });
});
