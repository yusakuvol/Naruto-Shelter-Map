import { memo } from 'react';
import { getShelterIcon } from '@/lib/shelterIcons';
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

/** ピンのアウトライン用の暗い色 */
function getShelterDarkerColor(type: string): string {
  switch (type) {
    case '指定避難所':
      return '#1d4ed8';
    case '緊急避難場所':
      return '#b91c1c';
    case '両方':
      return '#6d28d9';
    default:
      return '#374151';
  }
}

function ShelterPinMarkerComponent({
  shelter,
  isSelected,
}: ShelterPinMarkerProps) {
  const { name, type } = shelter.properties;
  const color = getShelterColor(type);
  const darkerColor = getShelterDarkerColor(type);

  return (
    <button
      type="button"
      className={`relative flex cursor-pointer flex-col items-center transition-transform duration-200 ease-out focus:outline-none ${
        isSelected ? 'z-10 scale-125' : 'hover:scale-110'
      }`}
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
      aria-label={`${name}（${type}）を選択`}
      aria-pressed={isSelected}
      title={`${name}\n種別: ${type}\n住所: ${shelter.properties.address}`}
    >
      {/* ティアドロップ型ピン */}
      <svg
        width="28"
        height="38"
        viewBox="0 0 28 38"
        fill="none"
        aria-hidden="true"
        className="block"
      >
        <path
          d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.27 21.73 0 14 0z"
          fill={color}
          stroke={darkerColor}
          strokeWidth="1.5"
        />
        {/* アイコン背景の半透明円 */}
        <circle cx="14" cy="13" r="8" fill="white" fillOpacity="0.2" />
      </svg>
      {/* ピン中央の白アイコン */}
      <div className="absolute top-[5px] left-1/2 flex h-[18px] w-[18px] -translate-x-1/2 items-center justify-center text-white">
        {getShelterIcon(type, { className: 'h-3.5 w-3.5' })}
      </div>
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
