# データスキーマ

> 避難所データの GeoJSON 形式と TypeScript 型定義です。

---

## GeoJSON 形式

避難所データは **GeoJSON FeatureCollection** で保持します。

- **ファイル:** `public/data/shelters.geojson`
- **更新:** GitHub Actions（毎週月曜 3:00 JST）で `scripts/fetch-shelters.ts` が国土地理院 API から取得・検証。

---

## 型定義（概要）

`src/types/shelter.ts` で定義されています。

### 避難所の種別

- `指定避難所` | `緊急避難場所` | `両方`

### 災害種別

- `洪水` | `津波` | `土砂災害` | `地震` | `火災`

### Shelter（避難所）

| プロパティ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| id | string | ✅ | 一意キー |
| name | string | ✅ | 名称 |
| type | ShelterType | ✅ | 指定避難所 / 緊急避難場所 / 両方 |
| address | string | ✅ | 住所 |
| coordinates | [number, number] | ✅ | [経度, 緯度] |
| disasterTypes | DisasterType[] | ✅ | 対応災害種別 |
| capacity | number | - | 収容人数 |
| contact | string | - | 連絡先 |
| source | string | ✅ | データ出典 |
| updatedAt | string | ✅ | 更新日時 |
| regionId | string | - | 地域 ID（naruto, aizumi, kitajima, matsushige, itano） |
| regionName | string | - | 地域名（表示用） |
| facilities | Facilities | - | 設備情報 |
| accessibility | Accessibility | - | バリアフリー情報 |
| pets | PetPolicy | - | ペット可否 |
| operationStatus | OperationStatus | - | 開設状況 |

### GeoJSON Feature

- `geometry.type`: `"Point"`
- `geometry.coordinates`: `[number, number]`（経度・緯度）
- `properties`: 上記 Shelter のうち `coordinates` を除いたもの（座標は geometry に格納）

---

## データ検証

- **スクリプト:** `pnpm validate:shelters`（`scripts/validate-shelters.ts`）
- **内容:** 座標・住所の整合性、対応地域範囲、地域名・「徳島市」混入チェック、境界付近の警告など。

---

## 関連ドキュメント

- [プロジェクト構造](./project-structure.md)
- [技術スタック](./tech-stack.md)
- [データ更新フロー](../../README.md#データ更新フロー)（README）
