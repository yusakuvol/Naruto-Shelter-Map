import maplibregl from 'maplibre-gl';
import { PMTiles, Protocol } from 'pmtiles';
import { BASEMAP_PMTILES_PATH } from '@/config/mapStyle';
import { CacheFirstPMTilesSource } from '@/lib/pmtilesSource';

let registered = false;

/**
 * MapLibre に pmtiles:// プロトコルを登録する
 *
 * 同梱ベースマップは precache 優先で読み出す CacheFirstPMTilesSource を
 * 使った PMTiles インスタンスとして事前登録する。複数回呼んでも安全。
 */
export function registerPMTilesProtocol(): void {
  if (registered) {
    return;
  }
  const protocol = new Protocol();
  const url = `${window.location.origin}${BASEMAP_PMTILES_PATH}`;
  protocol.add(new PMTiles(new CacheFirstPMTilesSource(url)));
  maplibregl.addProtocol('pmtiles', protocol.tile);
  registered = true;
}
