"use client";

import { clsx } from "clsx";
import { useState } from "react";
import { CompassArrow } from "@/components/icons/CompassArrow";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import type { Coordinates } from "@/lib/geo";
import {
  calculateBearing,
  formatDistance,
  getCompassDirection,
  getJapaneseDirection,
} from "@/lib/geo";
import {
  estimateDrivingTime,
  estimateWalkingTime,
  formatTravelTime,
  generateNavigationURL,
} from "@/lib/navigation";
import { getShelterIcon } from "@/lib/shelterIcons";
import type { ShelterFeature } from "@/types/shelter";
import { ShelterDetailModal } from "./ShelterDetailModal";

interface ShelterCardProps {
  shelter: ShelterFeature;
  isSelected?: boolean;
  onClick?: () => void;
  distance?: number | null;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  userPosition?: Coordinates | null | undefined;
}

function getShelterTypeColor(type: string): string {
  switch (type) {
    case "指定避難所":
      return "bg-blue-50 text-blue-900 border-blue-200";
    case "緊急避難場所":
      return "bg-red-50 text-red-900 border-red-200";
    case "両方":
      return "bg-purple-50 text-purple-950 border-purple-200";
    default:
      return "bg-gray-50 text-gray-900 border-gray-200";
  }
}

export function ShelterCard({
  shelter,
  isSelected,
  onClick,
  distance,
  isFavorite = false,
  onToggleFavorite,
  userPosition,
}: ShelterCardProps) {
  const { name, type, address, disasterTypes, capacity, id } =
    shelter.properties;
  const typeColor = getShelterTypeColor(type);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // デバイスの方位を取得
  const { heading: deviceHeading, state: orientationState } =
    useDeviceOrientation();

  // 方位角と方向を計算
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

  // コンパスの回転角度を計算（避難所の方位 - デバイスの向き）
  const compassRotation =
    bearing !== null && deviceHeading !== null
      ? bearing - deviceHeading
      : bearing ?? 0;

  return (
    <>
      {/* biome-ignore lint/a11y/useSemanticElements: ボタンネストを避けるためdivを使用 */}
      <div
        className={clsx(
          "w-full cursor-pointer rounded-lg border bg-white p-3 shadow-sm text-left transition-all hover:shadow-md",
          onClick && "hover:border-blue-300",
          isSelected && "ring-2 ring-blue-500 bg-blue-50 border-blue-300"
        )}
        onClick={onClick}
        role="button"
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={onClick ? `${name}の詳細` : undefined}
        aria-pressed={isSelected}
      >
        {/* ヘッダー: 名前 + タイプバッジ + お気に入りボタン */}
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className="flex-1 text-sm font-bold text-gray-900 leading-tight">
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
                className="flex items-center justify-center rounded-full p-1 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                aria-label={
                  isFavorite ? "お気に入りから削除" : "お気に入りに追加"
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
            {/* タイプバッジ */}
            <span
              className={clsx(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
                typeColor
              )}
            >
              {getShelterIcon(type, { className: "h-3.5 w-3.5" })}
              <span>{type}</span>
            </span>
          </div>
        </div>

        {/* 住所（常に表示） */}
        <p className="flex items-start gap-1 text-sm text-gray-800 mb-1">
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

        {/* 距離・方向表示（現在地がある場合のみ） */}
        {distance !== null && distance !== undefined && (
          <p className="flex items-center gap-1 text-sm text-blue-700 font-medium mb-1">
            {/* コンパス矢印（デバイスの向きが取得できている場合） */}
            {orientationState === "granted" && deviceHeading !== null ? (
              <CompassArrow
                rotation={compassRotation}
                size={14}
                className="flex-shrink-0 text-blue-600"
                aria-hidden="true"
              />
            ) : (
              <svg
                className="h-3.5 w-3.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {/* Material Design my_location icon */}
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
              </svg>
            )}
            <span>
              {formatDistance(distance)}
              {directionJa && (
                <span className="ml-1 text-gray-700">({directionJa})</span>
              )}
            </span>
          </p>
        )}

        {/* 追加情報（コンパクトに1行で表示） */}
        <div className="flex items-center gap-3 text-sm text-gray-800 mb-2">
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
            <span className="truncate">{disasterTypes.join("・")}</span>
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

        {/* アクションボタン */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          {/* 詳細を見るボタン */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label={`${name}の詳細を見る`}
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="truncate">詳細</span>
          </button>

          {/* 経路案内ボタン（距離がある場合のみ） */}
          {distance !== null && distance !== undefined && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const [lng, lat] = shelter.geometry.coordinates;
                  const url = generateNavigationURL(
                    { latitude: lat, longitude: lng },
                    undefined,
                    "walking"
                  );
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
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

      {/* 詳細モーダル */}
      <ShelterDetailModal
        shelter={shelter}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        distance={distance}
        userPosition={userPosition}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    </>
  );
}
