# PR #283 レビュー指摘の修正計画

レビュー元: yusakuvol（オーナー）, Copilot

---

## 必須（マージ前に要対応）

オーナー指摘の 2 点。いずれもコード変更のみで対応可能。

### 1. ChatMessage: Tailwind クラス名の誤り

| 項目 | 内容 |
|------|------|
| **ファイル** | `src/components/chat/ChatMessage.tsx` |
| **行** | 20 |
| **現状** | `wrap-break-word`（Tailwind に存在しない） |
| **修正** | `break-words` に変更 |
| **理由** | 長文・URL がはみ出す可能性がある |

```tsx
<p className="whitespace-pre-line break-words">{content}</p>
```

---

### 2. ChatPanel: 新着メッセージ時に最下部へスクロール

| 項目 | 内容 |
|------|------|
| **ファイル** | `src/components/chat/ChatPanel.tsx` |
| **現状** | `scrollRef` はあるが、メッセージ追加後に `scrollTo` を呼んでいない |
| **修正** | `messages` 変更時に最下部へスクロールする `useEffect` を追加 |
| **理由** | 返答追加後も表示が上に固定され、手動スクロールが必要になる |

- `useEffect` の依存配列は `[messages]`
- `scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })`
- `useEffect` を追加するため、import に `useEffect` を追加する

---

## 推奨（仕様・一貫性のため対応）

Copilot 指摘のうち、データ型・意図の正確性に直結するもの。

### 3. intent.ts: 「高潮」を削除

| 項目 | 内容 |
|------|------|
| **ファイル** | `src/lib/chat/intent.ts` |
| **現状** | `DISASTER_KEYWORDS` に `'高潮'` が含まれる |
| **問題** | `DisasterType`（shelter.ts）は `'洪水' \| '津波' \| '土砂災害' \| '地震' \| '火災'` のみ。高潮で検索すると「disaster」意図になるが、answer 側でマッチする災害がなく「0件」等の応答になり混乱する。 |
| **修正** | `DISASTER_KEYWORDS` から `'高潮'` を削除する |

---

### 4. intent.ts: SHELTER_TYPE_KEYWORDS を完全一致に

| 項目 | 内容 |
|------|------|
| **ファイル** | `src/lib/chat/intent.ts` |
| **現状** | `['指定避難所', '緊急避難場所', '指定', '緊急']` |
| **問題** | 「指定」だけでも shelter_type になる。「指定された場所」などが誤って shelter_type に分類される可能性。 |
| **修正** | `['指定避難所', '緊急避難場所']` のみにする（`'指定'`・`'緊急'` を削除） |

- **テスト**: `intent.test.ts` の「指定避難所だけ」「緊急避難場所は？」はそのまま通る。「指定」のみのテストがあれば文言を「指定避難所」に変更する。

---

### 5. answer.ts: answerShelterType の「指定＋緊急」時の挙動

| 項目 | 内容 |
|------|------|
| **ファイル** | `src/lib/chat/answer.ts` |
| **現状** | クエリに「指定」と「緊急」の両方含むとき、`type === '両方'` の避難所だけを表示している。 |
| **問題** | ユーザーは「指定避難所と緊急避難場所の両方を見たい」と期待するが、「両方」種別の施設だけが返り、指定避難所・緊急避難場所が欠ける。 |
| **修正** | 両方のキーワードが含まれるときは、**指定避難所・緊急避難場所・両方の 3 種すべて**を対象にする（OR 条件で `matched` を結合）。ラベルは「指定避難所・緊急避難場所」などとする。 |

実装案:

- `isDesignated && isEmergency` のとき: `matched = features`（全件）、または `features.filter(f => ['指定避難所','緊急避難場所','両方'].includes(f.properties.type))`（実質全件に近い）。ラベルは「指定避難所・緊急避難場所・両方」または「避難所（指定・緊急・両方）」。
- 既存の「指定のみ」「緊急のみ」の分岐はそのまま。

---

## 任意（対応する場合）

### 6. intent.ts: 「土砂」の扱い

- **指摘**: 「土砂」は広く、「土砂災害」のみにするか「土砂崩れ」を追加するか検討。
- **方針**: 「土砂」は「土砂災害」の省略形として残しつつ、**「土砂崩れ」を DISASTER_KEYWORDS に追加**する。answer 側では `matchDisasterFromQuery` が「土砂災害」を返すので、データの `disasterTypes` と一致する（土砂崩れはデータ上は土砂災害で扱われる想定）。
- **注意**: `matchDisasterFromQuery` はクエリに「土砂災害」または「土砂崩れ」が含まれていれば「土砂災害」を返す必要がある。現在は `query.includes(d)` で `d in DISASTER_TYPES` なので、`DISASTER_TYPES` は `DisasterType` のまま。つまり「土砂崩れ」をキーワードに追加しても、マッチする災害種別は「土砂災害」として answer で使える（`matchDisasterFromQuery` は DISASTER_TYPES をループしているので、「土砂崩れ」は DisasterType にない→マッチしない）。なので **「土砂崩れ」を DISASTER_KEYWORDS に追加**し、`answerDisaster` 側で「土砂崩れ」がクエリに含まれるときは災害種別を「土砂災害」として扱う必要がある。
- **結論**: DISASTER_KEYWORDS に「土砂崩れ」を追加。`answer.ts` の `matchDisasterFromQuery` で、`query.includes('土砂崩れ') || query.includes('土砂災害')` のときは `'土砂災害'` を返すようにする（または DISASTER_TYPES の前に「土砂崩れ→土砂災害」のマップを用意する）。シンプルにするなら、**intent では「土砂崩れ」を追加するだけ**にして、**answer の matchDisasterFromQuery で「土砂崩れ」が含まれる場合も '土砂災害' を返す**ようにする。
- **優先度**: 低。必須・推奨対応後に余力があれば実装。

### 7. ChatModal: フォーカストラップ

- **指摘**: モーダル内にフォーカスを閉じ込める未実装。Tab で背面に抜ける。
- **オーナー**: Step 1 では必須ではない。
- **方針**: 今回は見送り。将来 `useFocusTrap`（既存 BottomSheet と同様）の導入を検討。

---

## 修正の実施順序

1. **必須**: ChatMessage（break-words）、ChatPanel（useEffect スクロール）
2. **推奨**: intent.ts（高潮削除、SHELTER_TYPE_KEYWORDS 短縮）、answer.ts（answerShelterType の両方キーワード時）
3. **テスト**: intent.test.ts で「指定」のみのテストがあれば「指定避難所」に変更。answer.test.ts で shelter_type の「両方」ケースを追加・調整。
4. **任意**: 土砂崩れ（時間があれば）

---

## 修正後確認

```bash
pnpm lint && pnpm type-check && pnpm exec vitest run && pnpm build
```

以上を実施後、PR に「レビュー指摘対応済み」とコメントする。
