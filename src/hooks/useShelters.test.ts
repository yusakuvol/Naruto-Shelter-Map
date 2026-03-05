// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ShelterGeoJSON } from '@/types/shelter';
import { useShelters } from './useShelters';

const mockGeoJSON: ShelterGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [134.609, 34.173] },
      properties: {
        id: 's1',
        name: '鳴門市民会館',
        type: '指定避難所',
        address: '徳島県鳴門市撫養町南浜',
        disasterTypes: ['洪水', '津波'],
        source: '国土地理院',
        updatedAt: '2026-01-01',
      },
    },
  ],
};

describe('useShelters', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初期状態では isLoading が true', () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => useShelters());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('正常にデータを取得すると data がセットされ isLoading が false になる', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockGeoJSON,
    } as unknown as Response);

    const { result } = renderHook(() => useShelters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockGeoJSON);
    expect(result.current.error).toBeNull();
  });

  it('HTTP エラー時に error がセットされ data は null のまま', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as unknown as Response);

    const { result } = renderHook(() => useShelters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error?.message).toContain('HTTP 404');
  });

  it('ネットワークエラー時に error がセットされる', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'));

    const { result } = renderHook(() => useShelters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error?.message).toBe('Failed to fetch');
    expect(result.current.data).toBeNull();
  });

  it('retry() を呼ぶと再フェッチが実行される', async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGeoJSON,
      } as unknown as Response);

    const { result } = renderHook(() => useShelters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.data).toEqual(mockGeoJSON));
    expect(result.current.error).toBeNull();
  });

  it('refresh() を呼ぶと最新データを取得できる', async () => {
    const updatedGeoJSON: ShelterGeoJSON = {
      ...mockGeoJSON,
      features: [
        ...mockGeoJSON.features,
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [134.6, 34.18] },
          properties: {
            id: 's2',
            name: '新規避難所',
            type: '緊急避難場所',
            address: '徳島県鳴門市',
            disasterTypes: ['地震'],
            source: '国土地理院',
            updatedAt: '2026-02-01',
          },
        },
      ],
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGeoJSON,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedGeoJSON,
      } as unknown as Response);

    const { result } = renderHook(() => useShelters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.features).toHaveLength(1);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.data?.features).toHaveLength(2);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('refresh() 失敗時に refreshError がセットされる', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGeoJSON,
      } as unknown as Response)
      .mockRejectedValueOnce(new Error('オフライン'));

    const { result } = renderHook(() => useShelters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.refreshError?.message).toBe('オフライン');
    // 元のデータは保持される
    expect(result.current.data).toEqual(mockGeoJSON);
  });

  it('clearRefreshError() を呼ぶと refreshError がクリアされる', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGeoJSON,
      } as unknown as Response)
      .mockRejectedValueOnce(new Error('オフライン'));

    const { result } = renderHook(() => useShelters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.refreshError).not.toBeNull();

    act(() => {
      result.current.clearRefreshError();
    });

    expect(result.current.refreshError).toBeNull();
  });

  it('refresh() 失敗後の refreshError は 6秒後に自動クリアされる', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGeoJSON,
      } as unknown as Response)
      .mockRejectedValueOnce(new Error('オフライン'));

    const { result } = renderHook(() => useShelters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.useFakeTimers();

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.refreshError).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(6001);
    });

    expect(result.current.refreshError).toBeNull();

    vi.useRealTimers();
  });

  it('fetch が非 Error 値をスローした場合はデフォルトメッセージがセットされる', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    vi.mocked(fetch).mockRejectedValueOnce('string error');

    const { result } = renderHook(() => useShelters());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error?.message).toBe(
      '避難所データの読み込みに失敗しました'
    );
  });
});
