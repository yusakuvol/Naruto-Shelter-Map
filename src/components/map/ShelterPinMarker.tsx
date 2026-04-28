import { memo } from 'react';
import type { ShelterFeature } from '@/types/shelter';

interface ShelterPinMarkerProps {
  shelter: ShelterFeature;
  isSelected: boolean;
}

type ShelterColorTokens = {
  fill: string;
  bg: string;
};

/** 避難所種別に応じた配色トークン (globals.css の --color-shelter-* に同期) */
function getShelterTokens(type: string): ShelterColorTokens {
  switch (type) {
    case '指定避難所':
      return { fill: 'fill-shelter-designated', bg: 'bg-shelter-designated' };
    case '緊急避難場所':
      return { fill: 'fill-shelter-emergency', bg: 'bg-shelter-emergency' };
    case '両方':
      return { fill: 'fill-shelter-both', bg: 'bg-shelter-both' };
    default:
      return { fill: 'fill-muted-foreground', bg: 'bg-muted-foreground' };
  }
}

function ShelterPinMarkerComponent({
  shelter,
  isSelected,
}: ShelterPinMarkerProps) {
  const { name, type } = shelter.properties;
  const tokens = getShelterTokens(type);

  return (
    <button
      type="button"
      className={`relative flex cursor-pointer flex-col items-center transition-transform duration-200 ease-out focus:outline-none ${
        isSelected ? 'z-10 scale-125' : 'hover:scale-110'
      }`}
      style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' }}
      aria-label={`${name}（${type}）を選択`}
      aria-pressed={isSelected}
      title={`${name}\n種別: ${type}\n住所: ${shelter.properties.address}`}
    >
      {/* ロゴと同じティアドロップ + 家のシルエット */}
      <svg
        viewBox="0 0 56 76"
        className="block h-[38px] w-[28px]"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 28 76 C 28 76 56 49 56 30 C 56 13 43 0 28 0 C 13 0 0 13 0 30 C 0 49 28 76 28 76 Z"
          className={tokens.fill}
        />
        <g fill="white">
          <path d="M 14 32 L 28 20 L 42 32 Z" />
          <rect x="17" y="32" width="22" height="16" />
        </g>
      </svg>
      {/* 選択時のパルスリング */}
      {isSelected && (
        <div
          className={`absolute -top-1 left-1/2 h-[30px] w-[30px] -translate-x-1/2 animate-ping rounded-full opacity-30 ${tokens.bg}`}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export const ShelterPinMarker = memo(
  ShelterPinMarkerComponent,
  (prev, next) =>
    prev.shelter.properties.id === next.shelter.properties.id &&
    prev.isSelected === next.isSelected
);
