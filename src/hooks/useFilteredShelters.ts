import { useMemo } from 'react';
import { useFilter } from '@/contexts/FilterContext';
import type { DisasterType, ShelterFeature } from '@/types/shelter';

/**
 * フィルタリングされた避難所リストを返すフック
 * @param shelters - 全避難所データ
 * @returns フィルタリングされた避難所データ
 */
export function useFilteredShelters(
  shelters: ShelterFeature[]
): ShelterFeature[] {
  const { selectedDisasters } = useFilter();

  return useMemo(() => {
    // 災害種別フィルタのみ適用（地域フィルタは不要）
    if (selectedDisasters.length === 0) {
      return shelters;
    }

    // 選択された災害種別に対応する避難所のみ返す
    return shelters.filter((shelter) =>
      hasAnyDisasterType(shelter.properties.disasterTypes, selectedDisasters)
    );
  }, [shelters, selectedDisasters]);
}

/**
 * 避難所が指定された災害種別のいずれかに対応しているかチェック
 * @param shelterDisasters - 避難所が対応している災害種別
 * @param selectedDisasters - フィルタで選択された災害種別
 * @returns いずれかの災害種別に対応していればtrue
 */
function hasAnyDisasterType(
  shelterDisasters: DisasterType[],
  selectedDisasters: DisasterType[]
): boolean {
  return selectedDisasters.some((disaster) =>
    shelterDisasters.includes(disaster)
  );
}
