// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { FilterProvider, useFilter } from '@/contexts/FilterContext';
import type { DisasterType, ShelterFeature } from '@/types/shelter';
import { useFilteredShelters } from './useFilteredShelters';

function makeShelter(
  id: string,
  disasterTypes: DisasterType[]
): ShelterFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [134.609, 34.173] },
    properties: {
      id,
      name: `避難所${id}`,
      type: '指定避難所',
      address: '徳島県鳴門市',
      disasterTypes,
      source: '国土地理院',
      updatedAt: '2026-01-01',
    },
  };
}

function wrapper({ children }: { children: ReactNode }): ReactElement {
  return createElement(FilterProvider, null, children);
}

const shelters = [
  makeShelter('a', ['洪水', '津波']),
  makeShelter('b', ['土砂災害', '地震']),
  makeShelter('c', ['火災']),
  makeShelter('d', ['津波', '土砂災害']),
];

describe('useFilteredShelters', () => {
  it('フィルタなし時はすべての避難所を返す', () => {
    const { result } = renderHook(() => useFilteredShelters(shelters), {
      wrapper,
    });

    expect(result.current).toHaveLength(4);
  });

  it('単一の災害種別でフィルタリングできる', () => {
    const { result } = renderHook(
      () => ({ filtered: useFilteredShelters(shelters), filter: useFilter() }),
      { wrapper }
    );

    act(() => {
      result.current.filter.toggleDisaster('津波');
    });

    const ids = result.current.filtered.map((s) => s.properties.id);
    expect(ids).toEqual(expect.arrayContaining(['a', 'd']));
    expect(result.current.filtered).toHaveLength(2);
  });

  it('複数の災害種別フィルタは OR 条件で動作する', () => {
    const { result } = renderHook(
      () => ({ filtered: useFilteredShelters(shelters), filter: useFilter() }),
      { wrapper }
    );

    act(() => {
      result.current.filter.toggleDisaster('洪水');
      result.current.filter.toggleDisaster('火災');
    });

    // a（洪水）, c（火災）がマッチ
    const ids = result.current.filtered.map((s) => s.properties.id);
    expect(ids).toEqual(expect.arrayContaining(['a', 'c']));
    expect(result.current.filtered).toHaveLength(2);
  });

  it('一致する避難所がない場合は空配列を返す', () => {
    const noFire = [makeShelter('x', ['洪水']), makeShelter('y', ['津波'])];

    const { result } = renderHook(
      () => ({ filtered: useFilteredShelters(noFire), filter: useFilter() }),
      { wrapper }
    );

    act(() => {
      result.current.filter.toggleDisaster('火災');
    });

    expect(result.current.filtered).toHaveLength(0);
  });

  it('clearFilters() 後はすべての避難所が返る', () => {
    const { result } = renderHook(
      () => ({ filtered: useFilteredShelters(shelters), filter: useFilter() }),
      { wrapper }
    );

    act(() => {
      result.current.filter.toggleDisaster('津波');
    });

    expect(result.current.filtered).toHaveLength(2);

    act(() => {
      result.current.filter.clearFilters();
    });

    expect(result.current.filtered).toHaveLength(4);
  });

  it('toggleDisaster() で選択済みの災害種別を再度呼ぶと解除される', () => {
    const { result } = renderHook(
      () => ({ filtered: useFilteredShelters(shelters), filter: useFilter() }),
      { wrapper }
    );

    act(() => {
      result.current.filter.toggleDisaster('津波');
    });

    expect(result.current.filtered).toHaveLength(2);

    act(() => {
      result.current.filter.toggleDisaster('津波');
    });

    expect(result.current.filtered).toHaveLength(4);
  });

  it('空の避難所リストを渡すと空配列を返す', () => {
    const { result } = renderHook(() => useFilteredShelters([]), { wrapper });

    expect(result.current).toHaveLength(0);
  });
});
