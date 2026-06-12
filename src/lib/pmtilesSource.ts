import { FetchSource, type RangeResponse, type Source } from 'pmtiles';

/**
 * Service Worker の precache（Cache Storage）を優先して PMTiles を読み出す Source
 *
 * precache されたレスポンスは Range リクエストに対してもファイル全体（200）を
 * 返すため、pmtiles 標準の FetchSource では読み出せない。Cache Storage から
 * Blob を取得し、必要なバイト範囲だけ slice することでオフラインでも
 * タイルを読み出せるようにする。
 *
 * キャッシュに存在しない場合（Service Worker 未登録の初回オンライン時や
 * 開発サーバー利用時）は、通常の HTTP Range リクエストにフォールバックする。
 */
export class CacheFirstPMTilesSource implements Source {
  private readonly url: string;
  private readonly fallback: FetchSource;
  private cachedBlob: Blob | null = null;

  constructor(url: string) {
    this.url = url;
    this.fallback = new FetchSource(url);
  }

  getKey(): string {
    return this.url;
  }

  async getBytes(
    offset: number,
    length: number,
    signal?: AbortSignal,
    etag?: string
  ): Promise<RangeResponse> {
    const blob = await this.getCachedBlob();
    if (blob) {
      const data = await blob.slice(offset, offset + length).arrayBuffer();
      return { data };
    }
    return this.fallback.getBytes(offset, length, signal, etag);
  }

  /** precache から PMTiles 全体の Blob を取得する（取得できたら以降は再利用） */
  private async getCachedBlob(): Promise<Blob | null> {
    if (this.cachedBlob) {
      return this.cachedBlob;
    }
    if (typeof caches === 'undefined') {
      return null;
    }
    try {
      // precache のキーには revision クエリが付くため ignoreSearch で照合する
      const response = await caches.match(this.url, { ignoreSearch: true });
      if (!response?.ok) {
        return null;
      }
      this.cachedBlob = await response.blob();
      return this.cachedBlob;
    } catch {
      // Cache Storage が利用できない環境ではネットワークにフォールバック
      return null;
    }
  }
}
