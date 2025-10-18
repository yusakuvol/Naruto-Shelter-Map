#!/usr/bin/env python3
"""
徳島県の避難所CSVデータから鳴門市のデータを抽出してGeoJSON形式に変換

使い方:
    python scripts/convert_shelters.py

出力:
    public/data/shelters.geojson
"""

import csv
import json
import sys
from datetime import datetime

INPUT_CSV = 'scripts/data/tokushima_shelters.csv'
OUTPUT_GEOJSON = 'public/data/shelters.geojson'

def parse_disaster_types(disaster_str):
    """災害種別文字列を解析してリストに変換"""
    if not disaster_str:
        return ["地震"]

    types = []
    if '洪水' in disaster_str:
        types.append('洪水')
    if '津波' in disaster_str or '高潮' in disaster_str:
        types.append('津波')
    if '地震' in disaster_str:
        types.append('地震')
    if '崖崩れ' in disaster_str or '土砂' in disaster_str:
        types.append('土砂災害')
    if '火事' in disaster_str or '火災' in disaster_str:
        types.append('火災')

    return types if types else ["地震"]

def determine_shelter_type(category_str):
    """分類文字列から避難所種別を判定"""
    if not category_str:
        return "指定避難所"

    has_emergency = '指定緊急避難場所' in category_str
    has_shelter = '指定避難所' in category_str

    if has_emergency and has_shelter:
        return "両方"
    elif has_emergency:
        return "緊急避難場所"
    else:
        return "指定避難所"

def main():
    print("鳴門市避難所データ変換スクリプト")
    print("=" * 60)

    # CSVファイルを読み込み（Shift-JIS -> UTF-8）
    shelters = []
    naruto_count = 0

    try:
        with open(INPUT_CSV, 'r', encoding='shift-jis', errors='ignore') as f:
            reader = csv.DictReader(f)

            for row in reader:
                # 市町村列が空の場合、タイトルや住所から鳴門市かを判定
                title = row.get('タイトル', '')
                address = row.get('所在地', '')

                # 鳴門市のデータかチェック
                if '鳴門' not in title and '鳴門' not in address:
                    continue

                naruto_count += 1

                # 緯度経度
                try:
                    lat = float(row.get('緯度', 0))
                    lng = float(row.get('経度', 0))
                except:
                    print(f"警告: {title} の座標が不正です。スキップします。")
                    continue

                # GeoJSON Feature作成
                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat]  # GeoJSONは [経度, 緯度] の順
                    },
                    "properties": {
                        "id": f"shelter-{naruto_count:03d}",
                        "name": title,
                        "type": determine_shelter_type(row.get('分類', '')),
                        "address": f"徳島県鳴門市{address}" if not address.startswith('徳島県') else address,
                        "disasterTypes": parse_disaster_types(row.get('災害種別', '')),
                        "capacity": None,  # CSVに収容人数データがない
                        "contact": row.get('連絡先', ''),
                        "source": "国土地理院",
                        "updatedAt": datetime.now().strftime("%Y-%m-%d")
                    }
                }

                shelters.append(feature)

        print(f"✅ 鳴門市の避難所: {naruto_count}件")

        # GeoJSON FeatureCollection作成
        geojson = {
            "type": "FeatureCollection",
            "features": shelters
        }

        # ファイルに書き出し
        with open(OUTPUT_GEOJSON, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, ensure_ascii=False, indent=2)

        print(f"✅ GeoJSONファイルを出力: {OUTPUT_GEOJSON}")
        print(f"✅ 総件数: {len(shelters)}件")

        # サンプル表示
        if shelters:
            print("\n" + "=" * 60)
            print("サンプルデータ（最初の3件）:")
            print("=" * 60)
            for i, shelter in enumerate(shelters[:3], 1):
                props = shelter['properties']
                print(f"\n{i}. {props['name']}")
                print(f"   種別: {props['type']}")
                print(f"   住所: {props['address']}")
                print(f"   災害種別: {', '.join(props['disasterTypes'])}")
                print(f"   座標: {shelter['geometry']['coordinates']}")

    except FileNotFoundError:
        print(f"❌ エラー: {INPUT_CSV} が見つかりません。")
        print("先に以下のコマンドを実行してCSVをダウンロードしてください:")
        print("  curl -L -o scripts/data/tokushima_shelters.csv https://www.geospatial.jp/ckan/dataset/.../shiteihinantoroku.csv")
        sys.exit(1)
    except Exception as e:
        print(f"❌ エラー: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
