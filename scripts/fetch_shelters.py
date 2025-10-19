#!/usr/bin/env python3
"""
国土地理院の避難所データから鳴門市のデータを取得してGeoJSON形式に変換するスクリプト

使い方:
    python scripts/fetch_shelters.py

出力:
    public/data/shelters.geojson
"""

import json
import urllib.request
import csv
from io import StringIO
from datetime import datetime

# 国土地理院の避難所データAPI（徳島県）
# 実際のURLは国土地理院のサイトから取得する必要があります
TOKUSHIMA_DATA_URL = "https://www.gsi.go.jp/bousaichiri/hinanbasho.html"

def fetch_naruto_shelters():
    """
    鳴門市の避難所データを取得

    Note: このスクリプトは実際のAPIエンドポイントが必要です。
    現時点では、手動でダウンロードしたCSVファイルを読み込む想定です。
    """

    # サンプルデータ（実際には国土地理院のデータを使用）
    # 手動でダウンロードしたCSVファイルを読み込む場合:
    # with open('data/naruto_shelters.csv', 'r', encoding='utf-8') as f:
    #     reader = csv.DictReader(f)
    #     shelters = list(reader)

    print("注意: このスクリプトは国土地理院のデータダウンロードサイトから")
    print("      手動でダウンロードしたCSVファイルを処理するために使用してください。")
    print()
    print("手順:")
    print("1. https://hinanmap.gsi.go.jp/hinanjocp/hinanbasho/koukaidate.html にアクセス")
    print("2. 「徳島県」→「鳴門市」を選択してCSVをダウンロード")
    print("3. ダウンロードしたファイルを scripts/naruto_shelters.csv に保存")
    print("4. このスクリプトを再実行")

    return None

def csv_to_geojson(csv_data):
    """
    CSVデータをGeoJSON形式に変換

    Args:
        csv_data: CSVから読み込んだデータ

    Returns:
        GeoJSON FeatureCollection
    """
    features = []

    for idx, row in enumerate(csv_data, start=1):
        # CSV列名は実際のデータ構造に合わせて調整が必要
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    float(row.get('経度', row.get('lng', 0))),
                    float(row.get('緯度', row.get('lat', 0)))
                ]
            },
            "properties": {
                "id": f"shelter-{idx:03d}",
                "name": row.get('名称', row.get('施設名', '')),
                "type": row.get('種別', '指定避難所'),
                "address": row.get('住所', ''),
                "disasterTypes": parse_disaster_types(row),
                "capacity": int(row.get('収容人数', 0)) if row.get('収容人数') else None,
                "source": "国土地理院",
                "updatedAt": datetime.now().strftime("%Y-%m-%d")
            }
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features
    }

def parse_disaster_types(row):
    """
    災害種別を解析

    Args:
        row: CSV行データ

    Returns:
        災害種別のリスト
    """
    disaster_types = []

    # 国土地理院のデータ形式に合わせて調整
    if row.get('洪水') == '1' or row.get('洪水') == 'o':
        disaster_types.append('洪水')
    if row.get('津波') == '1' or row.get('津波') == 'o':
        disaster_types.append('津波')
    if row.get('地震') == '1' or row.get('地震') == 'o':
        disaster_types.append('地震')
    if row.get('土砂災害') == '1' or row.get('土砂災害') == 'o':
        disaster_types.append('土砂災害')
    if row.get('火災') == '1' or row.get('火災') == 'o':
        disaster_types.append('火災')

    return disaster_types if disaster_types else ['地震']

if __name__ == '__main__':
    print("鳴門市避難所データ取得スクリプト")
    print("=" * 50)
    fetch_naruto_shelters()
