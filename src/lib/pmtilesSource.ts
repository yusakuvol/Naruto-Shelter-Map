import type { RangeResponse, Source } from 'pmtiles';

/**
 * 同梱 PMTiles を読み出すための Source
 *
 * 読み出し順序:
 * 1. Service Worker の precache（Cache Storage）にあれば、その Blob を
 *    slice して返す（オフラインでも動作する基本経路）
 * 2. キャッシュ未ヒット時（Service Worker 登録前の初回オンライン時や
 *    開発時）はネットワークに Range リクエストを送る
 *    - 206: 要求した範囲だけを返す（Range 対応サーバー: Vite 開発サーバーなど）
 *    - 200: サーバーが Range 未対応（Cloudflare Pages など）のため、
 *      ファイル全体を一度だけ取得・保持して以後は slice で返す
 *
 * pmtiles 標準の FetchSource は 200（全体）が返るとエラーにするため使えない。
 */
export class CacheFirstPMTilesSource implements Source {
  private readonly url: string;
  /** ファイル全体の Blob（precache またはネットワークから取得できたら保持） */
  private fullBlob: Promise<Blob> | null = null;

  constructor(url: string) {
    this.url = url;
  }

  getKey(): string {
    return this.url;
  }

  async getBytes(
    offset: number,
    length: number,
    signal?: AbortSignal
  ): Promise<RangeResponse> {
    const blob = await this.lookupBlob();
    if (blob) {
      const data = await blob.slice(offset, offset + length).arrayBuffer();
      return { data };
    }

    const response = await fetch(this.url, {
      signal: signal ?? null,
      headers: { range: `bytes=${offset}-${offset + length - 1}` },
    });
    if (response.status === 206) {
      return { data: await response.arrayBuffer() };
    }
    if (!response.ok) {
      throw new Error(`PMTiles の取得に失敗しました: ${response.status}`);
    }
    // 200 = Range 未対応サーバー。全体を一度だけ取得して以後は slice で返す
    const fullBody = this.memoizeFullBlob(response.blob());
    const data = await (await fullBody)
      .slice(offset, offset + length)
      .arrayBuffer();
    return { data };
  }

  /** 取得済みの Blob、または precache 内の Blob を返す */
  private async lookupBlob(): Promise<Blob | null> {
    if (this.fullBlob) {
      return this.fullBlob;
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
      return await this.memoizeFullBlob(response.blob());
    } catch {
      // Cache Storage が利用できない環境ではネットワークにフォールバック
      return null;
    }
  }

  /** Blob 取得の Promise を保持する（失敗時は破棄して次回再試行できるようにする） */
  private memoizeFullBlob(promise: Promise<Blob>): Promise<Blob> {
    this.fullBlob = promise;
    promise.catch(() => {
      if (this.fullBlob === promise) {
        this.fullBlob = null;
      }
    });
    return promise;
  }
}
