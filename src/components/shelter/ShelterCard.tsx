import { clsx } from 'clsx';
import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Coordinates } from '@/lib/geo';
import {
  calculateBearing,
  formatDistance,
  getCompassDirection,
  getJapaneseDirection,
} from '@/lib/geo';
import {
  estimateDrivingTime,
  estimateWalkingTime,
  formatTravelTime,
  generateNavigationURL,
} from '@/lib/navigation';
import type { ShelterFeature } from '@/types/shelter';
import { ShelterCardBadges } from './ShelterCardBadges';
import { ShelterDetailModal } from './ShelterDetailModal';

interface ShelterCardProps {
  shelter: ShelterFeature;
  isSelected?: boolean;
  onClick?: () => void;
  /** 指定時は「詳細」クリックでこのコールバックを呼び、親でモーダル表示（地図側で開く） */
  onShowDetail?: (shelter: ShelterFeature) => void;
  distance?: number | null;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  userPosition?: Coordinates | null | undefined;
}

function ShelterCardComponent({
  shelter,
  isSelected,
  onClick,
  onShowDetail,
  distance,
  isFavorite = false,
  onToggleFavorite,
  userPosition,
}: ShelterCardProps) {
  const { name, address, disasterTypes, capacity, id } = shelter.properties;
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 方位角と方向を計算（方位マークは削除、方向テキストのみ表示）
  const bearing =
    userPosition && shelter.geometry.coordinates
      ? calculateBearing(userPosition, {
          latitude: shelter.geometry.coordinates[1],
          longitude: shelter.geometry.coordinates[0],
        })
      : null;

  const direction = bearing !== null ? getCompassDirection(bearing) : null;
  const directionJa =
    direction !== null ? getJapaneseDirection(direction) : null;

  return (
    <>
      {/* biome-ignore lint/a11y/useSemanticElements: ボタンネストを避けるためdivを使用 */}
      <div
        className={clsx(
          'w-full cursor-pointer rounded-xl border bg-white p-4 text-left transition-all hover:shadow-lg',
          onClick && 'hover:border-blue-300',
          isSelected && 'ring-2 ring-blue-500 bg-blue-50 border-blue-300'
        )}
        onClick={onClick}
        role="button"
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={onClick ? `${name}の詳細` : undefined}
        aria-pressed={isSelected}
      >
        {/* ヘッダー: 名前 + お気に入りボタン */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="flex-1 text-base font-semibold text-gray-900 leading-tight">
            {name}
          </h3>
          {/* お気に入りボタン */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(id);
              }}
              className="flex items-center justify-center rounded-full p-1 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
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
                  className="h-5 w-5 stroke-gray-400"
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
        </div>

        {/* 距離と方向（Google Maps風） */}
        {distance !== null && distance !== undefined && (
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              {formatDistance(distance)}
            </span>
            {directionJa && (
              <>
                <span className="text-gray-400">•</span>
                <span>{directionJa}方向</span>
              </>
            )}
          </div>
        )}

        {/* 住所（常に表示） */}
        <p className="flex items-start gap-1.5 text-sm text-gray-600 mb-2">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
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

        {/* 追加情報（コンパクトに1行で表示） */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-800">
          {/* 災害種別 */}
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5 shrink-0"
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
                className="h-3.5 w-3.5 shrink-0"
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

          <ShelterCardBadges shelter={shelter} />
        </div>

        {/* アクションボタン */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          {/* 詳細を見るボタン（onShowDetail ありなら地図側でモーダルを開く） */}
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (onShowDetail) {
                onShowDetail(shelter);
              } else {
                setIsDetailOpen(true);
              }
            }}
            aria-label={`${name}の詳細を見る`}
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="truncate">詳細</span>
          </Button>

          {/* 経路案内ボタン（距離がある場合のみ） */}
          {distance !== null && distance !== undefined && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
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
                aria-label={`${name}への経路案内`}
              >
                <svg
                  className="size-4"
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
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span
                  className="whitespace-nowrap"
                  title={`徒歩: ${formatTravelTime(
                    estimateWalkingTime(distance)
                  )}`}
                >
                  🚶 {formatTravelTime(estimateWalkingTime(distance))}
                </span>
                <span className="text-gray-500">|</span>
                <span
                  className="whitespace-nowrap"
                  title={`車: ${formatTravelTime(
                    estimateDrivingTime(distance)
                  )}`}
                >
                  🚗 {formatTravelTime(estimateDrivingTime(distance))}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 詳細モーダル（onShowDetail 未使用時のみカード内で表示） */}
      {!onShowDetail && (
        <ShelterDetailModal
          shelter={shelter}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          distance={distance}
          userPosition={userPosition}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </>
  );
}

// React.memoでメモ化（propsが変更された場合のみ再レンダリング）
export const ShelterCard = memo(
  ShelterCardComponent,
  (prevProps, nextProps) => {
    // カスタム比較関数：重要なpropsのみを比較
    return (
      prevProps.shelter.properties.id === nextProps.shelter.properties.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.distance === nextProps.distance &&
      prevProps.isFavorite === nextProps.isFavorite &&
      prevProps.userPosition?.latitude === nextProps.userPosition?.latitude &&
      prevProps.userPosition?.longitude === nextProps.userPosition?.longitude
    );
  }
);
