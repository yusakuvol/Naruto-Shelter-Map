import type { FC } from 'react';
import { cn } from '@/lib/utils';

export type SortMode = 'distance' | 'name';

interface SortToggleProps {
  mode: SortMode;
  onModeChange: (mode: SortMode) => void;
  disabled?: boolean;
  className?: string;
}

export const SortToggle: FC<SortToggleProps> = ({
  mode,
  onModeChange,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn('flex gap-2', className)}>
      {/* 距離順ボタン */}
      <button
        type="button"
        onClick={() => onModeChange('distance')}
        disabled={disabled}
        className={cn(
          'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          mode === 'distance'
            ? 'bg-blue-500 text-white shadow-md'
            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        aria-label="距離順でソート"
        aria-current={mode === 'distance' ? 'true' : undefined}
        title={disabled ? '現在地を取得してください' : '距離順でソート'}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          {/* Material Design my_location icon */}
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
        </svg>
        <span>距離順</span>
      </button>

      {/* 名前順ボタン */}
      <button
        type="button"
        onClick={() => onModeChange('name')}
        className={cn(
          'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          mode === 'name'
            ? 'bg-blue-500 text-white shadow-md'
            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        )}
        aria-label="名前順でソート"
        aria-current={mode === 'name' ? 'true' : undefined}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          {/* Sort alphabetically icon */}
          <path d="M3 6h18M7 12h14M11 18h10" />
        </svg>
        <span>名前順</span>
      </button>
    </div>
  );
};
