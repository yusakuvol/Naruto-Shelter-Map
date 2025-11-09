'use client';

import { clsx } from 'clsx';
import { useEffect, useId, useRef } from 'react';
import type { Coordinates } from '@/lib/geo';
import { formatDistance } from '@/lib/geo';
import { generateNavigationURL } from '@/lib/navigation';
import { getShelterIcon } from '@/lib/shelterIcons';
import type { ShelterFeature } from '@/types/shelter';

interface ShelterDetailModalProps {
  shelter: ShelterFeature;
  isOpen: boolean;
  onClose: () => void;
  distance?: number | null | undefined;
  userPosition?: Coordinates | null | undefined;
  isFavorite?: boolean;
  onToggleFavorite?: ((id: string) => void) | undefined;
}

function getShelterTypeColor(type: string): string {
  switch (type) {
    case '指定避難所':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case '緊急避難場所':
      return 'bg-red-50 text-red-800 border-red-200';
    case '両方':
      return 'bg-purple-50 text-purple-900 border-purple-200';
    default:
      return 'bg-gray-50 text-gray-800 border-gray-200';
  }
}

export function ShelterDetailModal({
  shelter,
  isOpen,
  onClose,
  distance,
  isFavorite = false,
  onToggleFavorite,
}: ShelterDetailModalProps) {
  const { name, type, address, disasterTypes, capacity, contact, id } =
    shelter.properties;
  const typeColor = getShelterTypeColor(type);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Escキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // フォーカストラップ: モーダルが開いたら閉じるボタンにフォーカス
      closeButtonRef.current?.focus();
      // 背景スクロール禁止
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const [lng, lat] = shelter.geometry.coordinates;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        // モーダル外クリックで閉じる
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        // Enterでも閉じられるようにする
        if (e.key === 'Enter' && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={clsx(
          'relative w-full max-w-lg rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl',
          'max-h-[90vh] overflow-y-auto',
          'animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
          'sm:slide-in-from-bottom-0'
        )}
        role="document"
      >
        {/* ヘッダー */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-200 bg-white p-4">
          <div className="flex-1">
            <h2
              id={titleId}
              className="text-lg font-bold text-gray-900 leading-tight"
            >
              {name}
            </h2>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className={clsx(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  typeColor
                )}
              >
                {getShelterIcon(type, { className: 'h-3.5 w-3.5' })}
                <span>{type}</span>
              </span>
            </div>
          </div>

          {/* お気に入り + 閉じるボタン */}
          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(id)}
                className="rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                aria-label={
                  isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'
                }
              >
                {isFavorite ? (
                  <svg
                    className="h-6 w-6 fill-red-500"
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
                    className="h-6 w-6 stroke-gray-400"
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
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              aria-label="閉じる"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-4">
          {/* 住所 */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <svg
                className="h-5 w-5 text-gray-600"
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
              所在地
            </h3>
            <p className="text-sm text-gray-700">{address}</p>
          </section>

          {/* 距離（ある場合のみ） */}
          {distance !== null && distance !== undefined && (
            <section className="rounded-lg bg-blue-50 p-3">
              <p className="flex items-center gap-2 text-sm text-blue-900">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                </svg>
                <span className="font-medium">
                  現在地から {formatDistance(distance)}
                </span>
              </p>
            </section>
          )}

          {/* 災害種別 */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <svg
                className="h-5 w-5 text-gray-600"
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
              対応災害種別
            </h3>
            <div className="flex flex-wrap gap-2">
              {disasterTypes.map((disasterType) => (
                <span
                  key={disasterType}
                  className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-900 border border-orange-200"
                >
                  {disasterType}
                </span>
              ))}
            </div>
          </section>

          {/* 収容人数（ある場合のみ） */}
          {capacity && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <svg
                  className="h-5 w-5 text-gray-600"
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
                収容人数
              </h3>
              <p className="text-sm text-gray-700">{capacity}人</p>
            </section>
          )}

          {/* 連絡先（ある場合のみ） */}
          {contact && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                連絡先
              </h3>
              <a
                href={`tel:${contact}`}
                className="text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded"
              >
                {contact}
              </a>
            </section>
          )}

          {/* 設備情報（ある場合のみ） */}
          {shelter.properties.facilities && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                設備情報
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {shelter.properties.facilities.toilet && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M5 5h2v9H5zm7 0h-1v9h1zm4 0h-2v9h2zM8 20c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
                    </svg>
                    トイレ
                  </div>
                )}
                {shelter.properties.facilities.water && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                    水道
                  </div>
                )}
                {shelter.properties.facilities.electricity && (
                  <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                    </svg>
                    電気
                  </div>
                )}
                {shelter.properties.facilities.heating && (
                  <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-900">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M11.71 19.29l-1.42 1.42a1 1 0 01-1.42 0l-1.42-1.42a1 1 0 010-1.42l1.42-1.42 1.42 1.42a1 1 0 010 1.42zm-4.95-4.95L5.34 12.92a1 1 0 010-1.42l1.42-1.42a1 1 0 011.42 0l1.42 1.42-1.42 1.42a1 1 0 01-1.42 0zm11.48 0l-1.42-1.42 1.42-1.42a1 1 0 011.42 0l1.42 1.42a1 1 0 010 1.42l-1.42 1.42a1 1 0 01-1.42 0zm-4.95-4.95l-1.42-1.42 1.42-1.42a1 1 0 011.42 0l1.42 1.42a1 1 0 010 1.42l-1.42 1.42a1 1 0 01-1.42 0zM12 10a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    暖房
                  </div>
                )}
                {shelter.properties.facilities.airConditioning && (
                  <div className="flex items-center gap-2 rounded-lg bg-cyan-50 px-3 py-2 text-sm text-cyan-900">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z" />
                    </svg>
                    冷房
                  </div>
                )}
                {shelter.properties.facilities.wifi && (
                  <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-sm text-purple-900">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                    </svg>
                    Wi-Fi
                  </div>
                )}
              </div>
            </section>
          )}

          {/* バリアフリー情報（ある場合のみ） */}
          {shelter.properties.accessibility && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                バリアフリー情報
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {shelter.properties.accessibility.wheelchairAccessible && (
                  <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v3h5v5h2V9z" />
                    </svg>
                    車椅子対応
                  </div>
                )}
                {shelter.properties.accessibility.elevator && (
                  <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7.5 15c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1-4.5h-2v-5h2v5zm1-8h-4V4h4v1.5z" />
                    </svg>
                    エレベーター
                  </div>
                )}
                {shelter.properties.accessibility.multipurposeToilet && (
                  <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M5 5h2v9H5zm7 0h-1v9h1zm4 0h-2v9h2zM8 20c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
                    </svg>
                    多目的トイレ
                  </div>
                )}
                {shelter.properties.accessibility.brailleBlocks && (
                  <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                    点字ブロック
                  </div>
                )}
                {shelter.properties.accessibility.signLanguageSupport && (
                  <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z" />
                    </svg>
                    手話対応
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ペット情報（ある場合のみ） */}
          {shelter.properties.pets && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                ペット同伴
              </h3>
              <div className="space-y-2">
                {shelter.properties.pets.allowed ? (
                  <div className="rounded-lg bg-green-50 px-3 py-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-green-900">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                      </svg>
                      ペット同伴可
                    </p>
                    {shelter.properties.pets.separateArea && (
                      <p className="mt-1 text-sm text-green-800">
                        専用スペースあり
                      </p>
                    )}
                    {shelter.properties.pets.notes && (
                      <p className="mt-1 text-sm text-green-800">
                        {shelter.properties.pets.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg bg-red-50 px-3 py-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-red-900">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                      ペット同伴不可
                    </p>
                    {shelter.properties.pets.notes && (
                      <p className="mt-1 text-sm text-red-800">
                        {shelter.properties.pets.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 開設状況（ある場合のみ） */}
          {shelter.properties.operationStatus && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                開設状況
              </h3>
              <div className="space-y-2">
                {shelter.properties.operationStatus.isOpen ? (
                  <div className="rounded-lg bg-green-50 px-3 py-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-green-900">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                      </svg>
                      開設中
                    </p>
                    {shelter.properties.operationStatus.lastUpdated && (
                      <p className="mt-1 text-sm text-green-800">
                        最終更新:{' '}
                        {shelter.properties.operationStatus.lastUpdated}
                      </p>
                    )}
                    {shelter.properties.operationStatus.notes && (
                      <p className="mt-1 text-sm text-green-800">
                        {shelter.properties.operationStatus.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                      閉鎖中
                    </p>
                    {shelter.properties.operationStatus.lastUpdated && (
                      <p className="mt-1 text-sm text-gray-800">
                        最終更新:{' '}
                        {shelter.properties.operationStatus.lastUpdated}
                      </p>
                    )}
                    {shelter.properties.operationStatus.notes && (
                      <p className="mt-1 text-sm text-gray-800">
                        {shelter.properties.operationStatus.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* データソース */}
          <section className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              データ提供: {shelter.properties.source}
              <br />
              更新日: {shelter.properties.updatedAt}
            </p>
          </section>
        </div>

        {/* フッター: アクションボタン */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4">
          <button
            type="button"
            onClick={() => {
              const url = generateNavigationURL(
                { latitude: lat, longitude: lng },
                undefined,
                'walking'
              );
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors"
          >
            <svg
              className="h-5 w-5"
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
            経路案内を表示
          </button>
        </div>
      </div>
    </div>
  );
}
