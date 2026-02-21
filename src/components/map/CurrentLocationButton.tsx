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

// Googleマップ風のMaterial Design my_location アイコン
function getButtonContent(
  state: GeolocationState,
  error: GeolocationError | null
): { icon: ReactElement; label: string; iconColor: string } {
  if (state === 'loading') {
    return {
      icon: (
        <svg
          className="h-5 w-5 animate-spin"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
      label: '現在地を取得中',
      iconColor: 'text-blue-600',
    };
  }

  if (state === 'error') {
    return {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: getErrorMessage(error),
      iconColor: 'text-red-600',
    };
  }

  if (state === 'success') {
    return {
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          {/* Material Design my_location (filled) */}
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
        </svg>
      ),
      label: '現在地を表示中',
      iconColor: 'text-blue-600',
    };
  }

  return {
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        {/* Material Design my_location (outline) */}
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
      </svg>
    ),
    label: '現在地を表示',
    iconColor: 'text-gray-700',
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
  const { icon, label, iconColor } = getButtonContent(state, error);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === 'loading'}
      className={cn(
        // Googleマップ風: 円形、白背景、影
        'flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-all',
        'hover:shadow-xl active:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-75',
        iconColor,
        className
      )}
      aria-label={label}
      aria-live="polite"
      title={label}
    >
      {icon}
    </button>
  );
};
