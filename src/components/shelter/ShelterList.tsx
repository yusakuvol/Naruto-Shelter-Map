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
    <div className="space-y-3">
      {shelters.map(({ shelter, distance }) => (
        <ShelterCard
          key={shelter.properties.id}
          shelter={shelter}
          distance={distance}
          isSelected={selectedShelterId === shelter.properties.id}
          onClick={() => {
            onShelterSelect?.(shelter.properties.id);
            onShelterClick?.(shelter);
          }}
          isFavorite={favorites ? favorites.has(shelter.properties.id) : false}
          {...(onToggleFavorite && { onToggleFavorite })}
          userPosition={userPosition}
        />
      ))}
    </div>
  );
}
