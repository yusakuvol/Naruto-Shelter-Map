import type { Coordinates } from '@/lib/geo';
import { calculateDistance, formatDistance, toCoordinates } from '@/lib/geo';
import type { DisasterType, ShelterFeature } from '@/types/shelter';

export interface AISuggestion {
  /** バナーに表示するメッセージ */
  message: string;
  /** 「地図で見る」でハイライトする避難所 ID（最寄り検索時のみ） */
  shelterId?: string;
}

/**
 * 現在地・フィルタ状態に基づいたプロアクティブなサジェストを生成する。
 *
 * 優先度:
 * 1. 現在地あり + フィルタあり → フィルタ対応の最寄り避難所
 * 2. 現在地あり             → 全体の最寄り避難所
 * 3. 現在地なし + フィルタあり → フィルタ対応の件数
 * 4. それ以外               → null（バナーを表示しない）
 */
export function buildSuggestion(
  shelters: ShelterFeature[],
  userPosition: Coordinates | null,
  selectedDisasters: DisasterType[]
): AISuggestion | null {
  if (shelters.length === 0) return null;

  if (userPosition) {
    // 現在地から最近傍を探す
    let nearest = shelters[0] as ShelterFeature;
    let nearestDist = Number.POSITIVE_INFINITY;

    for (const shelter of shelters) {
      const coords = toCoordinates(shelter.geometry.coordinates);
      const dist = calculateDistance(userPosition, coords);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = shelter;
      }
    }

    const distStr = formatDistance(nearestDist);
    const name = nearest.properties.name;
    const shelterId = nearest.properties.id;

    if (selectedDisasters.length > 0) {
      const filterLabel = selectedDisasters.join('・');
      return {
        message: `${filterLabel}対応の最寄り避難所は${name}（${distStr}）です`,
        shelterId,
      };
    }

    return {
      message: `最寄りの避難所は${name}（${distStr}）です`,
      shelterId,
    };
  }

  if (selectedDisasters.length > 0) {
    const filterLabel = selectedDisasters.join('・');
    return {
      message: `${filterLabel}に対応する避難所が${shelters.length}件あります`,
    };
  }

  return null;
}
