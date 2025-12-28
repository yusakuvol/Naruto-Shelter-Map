'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useRef } from 'react';
import type { Coordinates } from '@/lib/geo';
import type { ShelterFeature } from '@/types/shelter';
import { ShelterCard } from './ShelterCard';

interface ShelterWithDistance {
  shelter: ShelterFeature;
  distance: number | null;
}

interface ShelterListProps {
  shelters: ShelterWithDistance[];
  selectedShelterId?: string | null | undefined;
  onShelterSelect?: (id: string) => void;
  onShelterClick?: (shelter: ShelterFeature) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (id: string) => void;
  userPosition?: Coordinates | null | undefined;
}

export function ShelterList({
  shelters,
  selectedShelterId,
  onShelterSelect,
  onShelterClick,
  favorites,
  onToggleFavorite,
  userPosition,
}: ShelterListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // クリックハンドラーをメモ化（再レンダリングを防ぐ）
  const handleShelterClick = useCallback(
    (shelterId: string, shelter: ShelterFeature) => {
      onShelterSelect?.(shelterId);
      onShelterClick?.(shelter);
    },
    [onShelterSelect, onShelterClick]
  );

  // 仮想スクロールの設定
  const virtualizer = useVirtualizer({
    count: shelters.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140, // 各カードの推定高さ（px）
    overscan: 5, // 画面外のアイテム数（スクロール時のスムーズさのため）
  });

  if (shelters.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-gray-600">避難所データがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = shelters[virtualItem.index];
          if (!item) return null;
          const { shelter, distance } = item;
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="px-4 pb-3">
                <ShelterCard
                  shelter={shelter}
                  distance={distance}
                  isSelected={selectedShelterId === shelter.properties.id}
                  onClick={() =>
                    handleShelterClick(shelter.properties.id, shelter)
                  }
                  isFavorite={
                    favorites ? favorites.has(shelter.properties.id) : false
                  }
                  {...(onToggleFavorite && { onToggleFavorite })}
                  userPosition={userPosition}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
