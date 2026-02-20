import { memo } from 'react';
import type { ShelterFeature } from '@/types/shelter';

interface ShelterPinMarkerProps {
  shelter: ShelterFeature;
  isSelected: boolean;
}

/** 避難所種別に応じたピン本体の色 */
function getShelterColor(type: string): string {
  switch (type) {
    case '指定避難所':
      return '#2563eb';
    case '緊急避難場所':
      return '#dc2626';
    case '両方':
      return '#7c3aed';
    default:
      return '#4b5563';
  }
}

function ShelterPinMarkerComponent({
  shelter,
  isSelected,
}: ShelterPinMarkerProps) {
  const { name, type } = shelter.properties;
  const color = getShelterColor(type);

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
      {/* ティアドロップ型ピン */}
      <svg
        viewBox="0 0 56 76"
        className="block h-[38px] w-[28px]"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M28 0C12.536 0 0 12.536 0 28c0 6.83 4.2 15.2 9.8 22.4C16.1 59.2 28 76 28 76s11.9-16.8 18.2-25.6C51.8 43.2 56 34.83 56 28 56 12.536 43.464 0 28 0z"
          fill={color}
        />
        {/* 中央の白丸ドット */}
        <circle cx="28" cy="26" r="9" fill="white" />
      </svg>
      {/* 選択時のパルスリング */}
      {isSelected && (
        <div
          className="absolute -top-1 left-1/2 h-[30px] w-[30px] -translate-x-1/2 animate-ping rounded-full opacity-30"
          style={{ backgroundColor: color }}
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
