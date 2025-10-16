import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useShelters } from '../useShelters';

// Mock fetch globally
global.fetch = vi.fn();

describe('useShelters', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useShelters());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should fetch and return shelter data successfully', async () => {
    const mockData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [134.609, 34.173],
          },
          properties: {
            id: 'shelter-001',
            name: '鳴門市役所',
            type: '指定避難所',
            address: '徳島県鳴門市撫養町南浜字東浜170',
            disasterTypes: ['洪水', '津波', '地震'],
            capacity: 500,
          },
        },
      ],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useShelters());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(global.fetch).toHaveBeenCalledWith('/data/shelters.geojson');
  });

  it('should handle HTTP errors', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useShelters());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('404');
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network failure');
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      networkError
    );

    const { result } = renderHook(() => useShelters());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network failure');
  });

  it('should handle non-Error exceptions', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      'String error'
    );

    const { result } = renderHook(() => useShelters());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch shelters');
  });
});
