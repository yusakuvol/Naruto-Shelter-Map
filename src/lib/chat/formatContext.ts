/**
 * 避難所リストを LLM/ルール用のテキスト要約に整形する
 * 設計: .docs/issues/279-design-spec.md 1.3
 */
import type { ShelterFeature } from '@/types/shelter';

const DEFAULT_MAX_ITEMS = 100;

/**
 * 1避難所を1行のテキストにフォーマットする
 */
function formatOneShelterLine(feature: ShelterFeature): string {
  const p = feature.properties;
  const capacityStr =
    p.capacity != null ? `${p.capacity}人` : '（未登録）';
  const regionStr = p.regionName ?? '';
  const disasterStr = p.disasterTypes.join(',');
  return `- ID: ${p.id} | 名前: ${p.name} | 種別: ${p.type} | 住所: ${p.address} | 災害: ${disasterStr} | 収容: ${capacityStr} | 地域: ${regionStr}`;
}

/**
 * ShelterFeature[] をテキスト要約に変換する（最大件数あり）
 *
 * @param features 避難所リスト（フィルタ済み想定）
 * @param maxItems 最大件数（省略時 100）
 * @returns プロンプト埋め込み用のテキスト
 */
export function formatSheltersForContext(
  features: ShelterFeature[],
  maxItems = DEFAULT_MAX_ITEMS
): string {
  const total = features.length;
  const limited = features.slice(0, maxItems);
  const lines = limited.map(formatOneShelterLine);
  const header = `【避難所リスト】（現在のフィルタ結果 ${total} 件、最大${maxItems}件まで表示）`;
  return [header, ...lines].join('\n');
}
