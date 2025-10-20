import type { ReactElement } from 'react';

/**
 * 地図読み込み中のSkeletonコンポーネント
 * CLSを防ぐために地図と同じサイズでプレースホルダーを表示
 */
export function MapSkeleton(): ReactElement {
  return (
    <div className="h-full w-full animate-pulse bg-gray-200">
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-600">地図を読み込み中...</p>
        </div>
      </div>
    </div>
  );
}
