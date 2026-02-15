/**
 * 意図に応じた検索と定型文で回答を生成する
 * 設計: .docs/issues/279-design-spec.md 2.2, 2.3
 */
import {
  type Coordinates,
  calculateDistance,
  formatDistance,
  toCoordinates,
} from '@/lib/geo';
import type { DisasterType, ShelterFeature } from '@/types/shelter';
import type { ChatIntent } from './intent';

const MAX_LIST_ITEMS = 5;

const DISASTER_TYPES: DisasterType[] = [
  '洪水',
  '津波',
  '土砂災害',
  '地震',
  '火災',
];

export interface AnswerParams {
  intent: ChatIntent;
  query: string;
  features: ShelterFeature[];
  userPosition?: Coordinates | null;
}

function matchDisasterFromQuery(query: string): DisasterType | null {
  for (const d of DISASTER_TYPES) {
    if (query.includes(d)) return d;
  }
  return null;
}

function answerDisaster(query: string, features: ShelterFeature[]): string {
  const disaster = matchDisasterFromQuery(query);
  if (!disaster) {
    return 'どの災害種別（洪水・津波・土砂災害・地震・火災）について知りたいか、もう少し具体的に教えてください。';
  }
  const matched = features.filter((f) =>
    f.properties.disasterTypes.includes(disaster)
  );
  if (matched.length === 0) {
    return `${disaster}に対応している避難所は、現在の地図上には見つかりませんでした。`;
  }
  const list = matched.slice(0, MAX_LIST_ITEMS);
  const lines = list.map(
    (f) =>
      `・${f.properties.name}${f.properties.regionName ? `（${f.properties.regionName}）` : ''}`
  );
  const rest = matched.length - list.length;
  const restMsg =
    rest > 0 ? `\n他 ${rest} 件あります。地図・リストでご確認ください。` : '';
  return `${disaster}に対応している避難所は現在の地図上に ${matched.length} 件あります。\n${lines.join('\n')}${restMsg}`;
}

function answerNearest(
  features: ShelterFeature[],
  userPosition: Coordinates | null | undefined
): string {
  if (!userPosition) {
    return '位置情報をオンにすると、現在地から近い順でお伝えできます。';
  }
  const withDistance = features.map((f) => ({
    feature: f,
    km: calculateDistance(userPosition, toCoordinates(f.geometry.coordinates)),
  }));
  withDistance.sort((a, b) => a.km - b.km);
  const top = withDistance.slice(0, MAX_LIST_ITEMS);
  if (top.length === 0) {
    return '現在の地図上に避難所がありません。';
  }
  const lines = top.map(
    (t, i) =>
      `${i + 1}. ${t.feature.properties.name}（約 ${formatDistance(t.km)}）`
  );
  return `現在地から近い順です。\n${lines.join('\n')}`;
}

function answerCapacity(features: ShelterFeature[]): string {
  const withCapacity = features.filter(
    (f) => f.properties.capacity != null && f.properties.capacity > 0
  );
  if (withCapacity.length === 0) {
    return '収容人数が登録されている避難所は、現在の地図上にはありません。';
  }
  const sorted = [...withCapacity].sort(
    (a, b) => (b.properties.capacity ?? 0) - (a.properties.capacity ?? 0)
  );
  const top = sorted.slice(0, MAX_LIST_ITEMS);
  const lines = top.map(
    (f) =>
      `・${f.properties.name}（${f.properties.capacity}人）${f.properties.regionName ? ` - ${f.properties.regionName}` : ''}`
  );
  const rest = sorted.length - top.length;
  const restMsg =
    rest > 0 ? `\n他 ${rest} 件あります。地図・リストでご確認ください。` : '';
  return `収容人数が多い避難所です（${sorted.length} 件が登録あり）。\n${lines.join('\n')}${restMsg}`;
}

function answerPlaceOrName(query: string, features: ShelterFeature[]): string {
  const q = query.trim();
  if (q.length < 2) {
    return '地域名や施設名を2文字以上で入力してみてください。';
  }
  const matched = features.filter((f) => {
    const name = f.properties.name ?? '';
    const address = f.properties.address ?? '';
    const region = f.properties.regionName ?? '';
    return name.includes(q) || address.includes(q) || region.includes(q);
  });
  if (matched.length === 0) {
    return `「${q}」に一致する避難所は、現在の地図上には見つかりませんでした。`;
  }
  const top = matched.slice(0, MAX_LIST_ITEMS);
  const lines = top.map(
    (f) =>
      `・${f.properties.name}（${f.properties.address}） - ${f.properties.disasterTypes.join('・')}`
  );
  const rest = matched.length - top.length;
  const restMsg =
    rest > 0 ? `\n他 ${rest} 件あります。地図・リストでご確認ください。` : '';
  return `${matched.length} 件見つかりました。\n${lines.join('\n')}${restMsg}`;
}

function answerShelterType(query: string, features: ShelterFeature[]): string {
  const isDesignated = query.includes('指定避難所');
  const isEmergency = query.includes('緊急避難場所');
  let matched: ShelterFeature[];
  let label: string;
  if (isDesignated && !isEmergency) {
    matched = features.filter((f) => f.properties.type === '指定避難所');
    label = '指定避難所';
  } else if (isEmergency && !isDesignated) {
    matched = features.filter((f) => f.properties.type === '緊急避難場所');
    label = '緊急避難場所';
  } else if (isDesignated && isEmergency) {
    matched = features.filter((f) =>
      ['指定避難所', '緊急避難場所', '両方'].includes(f.properties.type)
    );
    label = '指定避難所・緊急避難場所・両方';
  } else {
    matched = features.filter((f) => f.properties.type === '両方');
    label = '両方';
  }
  if (matched.length === 0) {
    return `${label}は、現在の地図上にはありません。`;
  }
  const top = matched.slice(0, MAX_LIST_ITEMS);
  const lines = top.map(
    (f) =>
      `・${f.properties.name}${f.properties.regionName ? `（${f.properties.regionName}）` : ''}`
  );
  const rest = matched.length - top.length;
  const restMsg =
    rest > 0 ? `\n他 ${rest} 件あります。地図・リストでご確認ください。` : '';
  return `${label}は ${matched.length} 件あります。\n${lines.join('\n')}${restMsg}`;
}

function answerCount(features: ShelterFeature[]): string {
  const total = features.length;
  if (total === 0) {
    return '現在の地図上に避難所はありません。';
  }
  const byRegion = new Map<string, number>();
  for (const f of features) {
    const r = f.properties.regionName ?? '（地域未設定）';
    byRegion.set(r, (byRegion.get(r) ?? 0) + 1);
  }
  const breakdown = [...byRegion.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `${name}: ${count}件`)
    .join('、');
  return `現在の地図上に避難所は ${total} 件あります。\n地域別: ${breakdown}`;
}

function answerUnknown(): string {
  return '現在の地図上の避難所について、例えば「津波対応の避難所は？」「一番近い避難所は？」「何件ある？」のように聞いてみてください。';
}

/**
 * 意図とコンテキストから回答文を生成する
 */
export function buildAnswer(params: AnswerParams): string {
  const { intent, query, features, userPosition } = params;

  switch (intent) {
    case 'disaster':
      return answerDisaster(query, features);
    case 'nearest':
      return answerNearest(features, userPosition);
    case 'capacity':
      return answerCapacity(features);
    case 'place_or_name':
      return answerPlaceOrName(query, features);
    case 'shelter_type':
      return answerShelterType(query, features);
    case 'count':
      return answerCount(features);
    default:
      return answerUnknown();
  }
}
