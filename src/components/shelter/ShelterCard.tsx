import {
  AlertTriangleIcon,
  HeartIcon,
  InfoIcon,
  MapIcon,
  MapPinIcon,
  UsersIcon,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
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
        className={cn(
          'w-full cursor-pointer rounded-xl border bg-card p-4 text-left transition-all hover:shadow-lg',
          onClick && 'hover:border-primary/50',
          isSelected && 'ring-2 ring-ring bg-primary/10 border-primary/50'
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
        aria-label={onClick ? `${name}` : undefined}
        aria-pressed={isSelected}
      >
        {/* ヘッダー: 名前 + お気に入りボタン */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="flex-1 text-base font-semibold text-foreground leading-tight">
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
              className="flex items-center justify-center rounded-full p-2.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              aria-label={
                isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'
              }
            >
              <HeartIcon
                className={cn(
                  'h-5 w-5',
                  isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-muted-foreground/70'
                )}
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        {/* 距離と方向（Google Maps風） */}
        {distance !== null && distance !== undefined && (
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {formatDistance(distance)}
            </span>
            {directionJa && (
              <>
                <span className="text-muted-foreground/70">•</span>
                <span>{directionJa}方向</span>
              </>
            )}
          </div>
        )}

        {/* 住所（常に表示） */}
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground mb-2">
          <MapPinIcon
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70"
            aria-hidden="true"
          />
          <span className="flex-1 leading-tight">{address}</span>
        </p>

        {/* 追加情報（コンパクトに1行で表示） */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-foreground">
          {/* 災害種別 */}
          <span className="flex items-center gap-1">
            <AlertTriangleIcon
              className="h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{disasterTypes.join('・')}</span>
          </span>

          {/* 収容人数（ある場合のみ） */}
          {capacity && (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <UsersIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{capacity}人</span>
            </span>
          )}

          <ShelterCardBadges shelter={shelter} />
        </div>

        {/* アクションボタン */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
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
            <InfoIcon className="size-4" aria-hidden="true" />
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
                <MapIcon className="size-4" aria-hidden="true" />
                <span className="truncate">経路案内</span>
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  className="whitespace-nowrap"
                  title={`徒歩: ${formatTravelTime(
                    estimateWalkingTime(distance * 1000)
                  )}`}
                >
                  🚶 {formatTravelTime(estimateWalkingTime(distance * 1000))}
                </span>
                <span className="text-muted-foreground/70">|</span>
                <span
                  className="whitespace-nowrap"
                  title={`車: ${formatTravelTime(
                    estimateDrivingTime(distance * 1000)
                  )}`}
                >
                  🚗 {formatTravelTime(estimateDrivingTime(distance * 1000))}
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
