import { describe, expect, it } from 'vitest';
import { formatSheltersForContext } from './formatContext';
import type { ShelterFeature } from '@/types/shelter';

function makeFeature(overrides: Partial<ShelterFeature['properties']> = {}): ShelterFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [134.5, 34.1] },
    properties: {
      id: 'shelter-001',
      name: 'テスト避難所',
      type: '指定避難所',
      address: '徳島県鳴門市',
      disasterTypes: ['洪水', '津波'],
      source: '国土地理院',
      updatedAt: '2026-01-01',
      ...overrides,
    },
  };
}

describe('formatSheltersForContext', () => {
  it('空配列の場合はヘッダーのみ', () => {
    const result = formatSheltersForContext([]);
    expect(result).toContain('【避難所リスト】');
    expect(result).toContain('0 件');
    expect(result.split('\n').length).toBe(1);
  });

  it('1件の場合は1行の避難所データが含まれる', () => {
    const features = [makeFeature({ id: 's1', name: 'A避難所', capacity: 100 })];
    const result = formatSheltersForContext(features);
    expect(result).toContain('ID: s1');
    expect(result).toContain('名前: A避難所');
    expect(result).toContain('収容: 100人');
    expect(result).toContain('1 件');
  });

  it('capacity がない場合は（未登録）', () => {
    const features = [makeFeature()];
    const result = formatSheltersForContext(features);
    expect(result).toContain('（未登録）');
  });

  it('maxItems で件数制限される', () => {
    const features = Array.from({ length: 10 }, (_, i) =>
      makeFeature({ id: `s-${i}`, name: `避難所${i}` })
    );
    const result = formatSheltersForContext(features, 3);
    expect(result).toContain('10 件');
    expect(result).toContain('最大3件まで表示');
    const lines = result.split('\n');
    // ヘッダー + 3件
    expect(lines.length).toBe(4);
    expect(lines[1]).toContain('s-0');
    expect(lines[2]).toContain('s-1');
    expect(lines[3]).toContain('s-2');
  });

  it('デフォルト maxItems は 100', () => {
    const features = [makeFeature()];
    const result = formatSheltersForContext(features);
    expect(result).toContain('最大100件まで表示');
  });
});
