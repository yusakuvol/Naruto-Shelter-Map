import type { ShelterFeature } from '@/types/shelter';
import { ShelterCard } from './ShelterCard';

interface ShelterListProps {
  shelters: ShelterFeature[];
  selectedShelterId?: string | null | undefined;
  onShelterSelect?: (id: string) => void;
  onShelterClick?: (shelter: ShelterFeature) => void;
}

export function ShelterList({ shelters, selectedShelterId, onShelterSelect, onShelterClick }: ShelterListProps) {
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
          <p className="mt-4 text-gray-600">
            検索条件に一致する避難所が見つかりませんでした
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {shelters.map((shelter) => (
        <ShelterCard
          key={shelter.properties.id}
          shelter={shelter}
          isSelected={selectedShelterId === shelter.properties.id}
          onClick={() => {
            onShelterSelect?.(shelter.properties.id);
            onShelterClick?.(shelter);
          }}
        />
      ))}
    </div>
  );
}
