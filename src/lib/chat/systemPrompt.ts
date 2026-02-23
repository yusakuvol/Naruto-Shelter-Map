import type { Coordinates } from '@/lib/geo';
import type { ShelterFeature } from '@/types/shelter';
import { formatSheltersForContext } from './formatContext';

/**
 * LLM 用のシステムプロンプトを構築する
 */
export function buildSystemPrompt(
  features: ShelterFeature[],
  userPosition: Coordinates | null
): string {
  const context = formatSheltersForContext(features);
  const positionInfo = userPosition
    ? `\nユーザーの現在地: 緯度 ${userPosition.latitude}, 経度 ${userPosition.longitude}`
    : '\nユーザーの現在地: 不明';

  return `あなたは鳴門市の避難所案内アシスタントです。以下の避難所データのみを根拠に、日本語で簡潔に回答してください。
データにない情報は「わかりません」と答えてください。推測や外部知識は使わないでください。

${context}
${positionInfo}

回答ルール:
- 簡潔に回答する（3〜5文以内）
- 避難所名・住所・災害種別など具体的な情報を含める
- データにない質問には「現在のデータではわかりません」と回答する`;
}
