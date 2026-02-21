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
  /** 指定時はカードの「詳細」でこのコールバックを呼び、親でモーダル表示（地図側で開く） */
  onShowDetail?: (shelter: ShelterFeature) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (id: string) => void;
  userPosition?: Coordinates | null | undefined;
  /** 0件時に表示するメッセージ（お気に入りフィルタ時など） */
  emptyMessage?: string;
}

export function ShelterList({
  shelters,
  selectedShelterId,
  onShelterSelect,
  onShelterClick,
  onShowDetail,
  favorites,
  onToggleFavorite,
  userPosition,
  emptyMessage,
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
  const virtualizerOptions: Parameters<typeof useVirtualizer>[0] = {
    count: shelters.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // 各カードの推定高さ（px）+ スペース（pb-3 = 12px）
    overscan: 5, // 画面外のアイテム数（スクロール時のスムーズさのため）
  };

  // 実際のサイズを測定して推定値を更新（Firefox以外）
  if (
    typeof window !== 'undefined' &&
    navigator.userAgent.indexOf('Firefox') === -1
  ) {
    virtualizerOptions.measureElement = (element) =>
      element?.getBoundingClientRect().height ?? 180;
  }

  const virtualizer = useVirtualizer(virtualizerOptions);

  if (shelters.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-gray-600">
            {emptyMessage ?? '避難所データがありません'}
          </p>
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
          const isFirst = virtualItem.index === 0;
          const isLast = virtualItem.index === shelters.length - 1;
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
              <div
                className={`px-4 ${isFirst ? 'pt-4' : ''} ${isLast ? 'pb-4' : 'pb-3'}`}
                data-index={virtualItem.index}
                ref={(node) => {
                  // 実際のサイズを測定して仮想スクロールに通知
                  if (node) {
                    virtualizer.measureElement(node);
                  }
                }}
              >
                <ShelterCard
                  shelter={shelter}
                  distance={distance}
                  isSelected={selectedShelterId === shelter.properties.id}
                  onClick={() =>
                    handleShelterClick(shelter.properties.id, shelter)
                  }
                  {...(onShowDetail && { onShowDetail })}
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
