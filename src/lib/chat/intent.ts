/**
 * ユーザー発話の意図を分類する（ルールベース）
 * 設計: .docs/issues/279-design-spec.md 2.1
 */
export type ChatIntent =
  | 'disaster'
  | 'nearest'
  | 'capacity'
  | 'place_or_name'
  | 'shelter_type'
  | 'count'
  | 'unknown';

const DISASTER_KEYWORDS = [
  '津波',
  '洪水',
  '土砂',
  '地震',
  '火災',
  '高潮',
  '津波対応',
  '洪水対応',
  '土砂災害',
  '地震対応',
  '火災対応',
];
const NEAREST_KEYWORDS = ['近い', '一番近い', '最寄り', '近く', '距離', '近所'];
const CAPACITY_KEYWORDS = ['収容', '定員', '人数', '何人', 'キャパ'];
const SHELTER_TYPE_KEYWORDS = ['指定避難所', '緊急避難場所', '指定', '緊急'];
const COUNT_KEYWORDS = ['何件', 'いくつ', '件数', '一覧', 'いくつある', '何個'];

/**
 * クエリ文字列から意図を分類する
 */
export function classifyIntent(query: string): ChatIntent {
  const normalized = query.trim();
  if (normalized.length === 0) return 'unknown';

  if (COUNT_KEYWORDS.some((k) => normalized.includes(k))) return 'count';
  if (SHELTER_TYPE_KEYWORDS.some((k) => normalized.includes(k)))
    return 'shelter_type';
  if (NEAREST_KEYWORDS.some((k) => normalized.includes(k))) return 'nearest';
  if (CAPACITY_KEYWORDS.some((k) => normalized.includes(k))) return 'capacity';
  if (DISASTER_KEYWORDS.some((k) => normalized.includes(k))) return 'disaster';

  // 地域名・施設名: 2文字以上で、明らかなキーワードでない場合
  if (normalized.length >= 2) return 'place_or_name';

  return 'unknown';
}
