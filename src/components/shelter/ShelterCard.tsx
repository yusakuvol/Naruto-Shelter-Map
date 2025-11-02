import { clsx } from 'clsx';
import { formatDistance } from '@/lib/geo';
import {
  estimateDrivingTime,
  estimateWalkingTime,
  formatTravelTime,
  generateNavigationURL,
} from '@/lib/navigation';
import { getShelterIcon } from '@/lib/shelterIcons';
import type { ShelterFeature } from '@/types/shelter';

interface ShelterCardProps {
  shelter: ShelterFeature;
  isSelected?: boolean;
  onClick?: () => void;
  distance?: number | null;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

function getShelterTypeColor(type: string): string {
  switch (type) {
    case '指定避難所':
      return 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
    case '緊急避難場所':
      return 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
    case '両方':
      return 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
    default:
      return 'bg-gray-50 text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
}

export function ShelterCard({
  shelter,
  isSelected,
  onClick,
  distance,
  isFavorite = false,
  onToggleFavorite,
}: ShelterCardProps) {
  const { name, type, address, disasterTypes, capacity, id } =
    shelter.properties;
  const typeColor = getShelterTypeColor(type);

  return (
    <button
      type="button"
      className={clsx(
        'w-full cursor-pointer rounded-lg border bg-white dark:bg-gray-800 p-3 shadow-sm text-left transition-all hover:shadow-md',
        'dark:border-gray-700',
        onClick && 'hover:border-blue-300 dark:hover:border-blue-600',
        isSelected &&
          'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
      )}
      onClick={onClick}
      aria-label={`${name}の詳細`}
      aria-pressed={isSelected}
    >
      {/* ヘッダー: 名前 + タイプバッジ + お気に入りボタン */}
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <h3 className="flex-1 text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
          {name}
        </h3>
        <div className="flex items-center gap-1.5">
          {/* お気に入りボタン */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(id);
              }}
              className="flex items-center justify-center rounded-full p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label={
                isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'
              }
            >
              {isFavorite ? (
                <svg
                  className="h-5 w-5 fill-red-500"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 stroke-gray-400 dark:stroke-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </button>
          )}
          {/* タイプバッジ */}
          <span
            className={clsx(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
              typeColor
            )}
          >
            {getShelterIcon(type, { className: 'h-3.5 w-3.5' })}
            <span>{type}</span>
          </span>
        </div>
      </div>

      {/* 住所（常に表示） */}
      <p className="flex items-start gap-1 text-xs text-gray-700 dark:text-gray-300 mb-1">
        <svg
          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="flex-1 leading-tight">{address}</span>
      </p>

      {/* 距離表示（現在地がある場合のみ） */}
      {distance !== null && distance !== undefined && (
        <p className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
          <svg
            className="h-3.5 w-3.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {/* Material Design my_location icon */}
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
          </svg>
          <span>{formatDistance(distance)}</span>
        </p>
      )}

      {/* 追加情報（コンパクトに1行で表示） */}
      <div className="flex items-center gap-3 text-xs text-gray-700 dark:text-gray-300 mb-2">
        {/* 災害種別 */}
        <span className="flex items-center gap-1">
          <svg
            className="h-3.5 w-3.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="truncate">{disasterTypes.join('・')}</span>
        </span>

        {/* 収容人数（ある場合のみ） */}
        {capacity && (
          <span className="flex items-center gap-1 whitespace-nowrap">
            <svg
              className="h-3.5 w-3.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>{capacity}人</span>
          </span>
        )}
      </div>

      {/* 経路案内ボタン（距離がある場合のみ） */}
      {distance !== null && distance !== undefined && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const [lng, lat] = shelter.geometry.coordinates;
              const url = generateNavigationURL(
                { latitude: lat, longitude: lng },
                undefined,
                'walking'
              );
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            aria-label={`${name}への経路案内`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <span className="truncate">経路案内</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span
              className="whitespace-nowrap"
              title={`徒歩: ${formatTravelTime(estimateWalkingTime(distance))}`}
            >
              🚶 {formatTravelTime(estimateWalkingTime(distance))}
            </span>
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <span
              className="whitespace-nowrap"
              title={`車: ${formatTravelTime(estimateDrivingTime(distance))}`}
            >
              🚗 {formatTravelTime(estimateDrivingTime(distance))}
            </span>
          </div>
        </div>
      )}
    </button>
  );
}
