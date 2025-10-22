'use client';

import type { FC, ReactElement } from 'react';
import type {
  GeolocationError,
  GeolocationState,
} from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';

interface CurrentLocationButtonProps {
  onClick: () => void;
  state: GeolocationState;
  error: GeolocationError | null;
  className?: string;
}

function getButtonContent(
  state: GeolocationState,
  error: GeolocationError | null
): { icon: ReactElement; label: string; color: string } {
  if (state === 'loading') {
    return {
      icon: (
        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ),
      label: '現在地を取得中',
      color: 'bg-blue-500 text-white',
    };
  }

  if (state === 'error') {
    return {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      label: getErrorMessage(error),
      color: 'bg-red-500 text-white',
    };
  }

  if (state === 'success') {
    return {
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          <circle cx="12" cy="9" r="2" fill="white" />
        </svg>
      ),
      label: '現在地を表示中',
      color: 'bg-green-500 text-white',
    };
  }

  return {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
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
    ),
    label: '現在地を表示',
    color: 'bg-white text-gray-700 hover:bg-gray-50',
  };
}

function getErrorMessage(error: GeolocationError | null): string {
  if (!error) return '位置情報の取得に失敗';

  switch (error) {
    case 'permission_denied':
      return '位置情報の許可が必要です';
    case 'position_unavailable':
      return '位置情報を取得できません';
    case 'timeout':
      return '位置情報の取得がタイムアウト';
    case 'not_supported':
      return 'この端末は位置情報に非対応';
    default:
      return '位置情報の取得に失敗';
  }
}

export const CurrentLocationButton: FC<CurrentLocationButtonProps> = ({
  onClick,
  state,
  error,
  className,
}) => {
  const { icon, label, color } = getButtonContent(state, error);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === 'loading'}
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-2 font-medium shadow-lg transition-all',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-75',
        color,
        className
      )}
      aria-label={label}
      aria-live="polite"
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );
};
