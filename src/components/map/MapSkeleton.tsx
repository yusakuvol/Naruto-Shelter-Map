import type { ReactElement } from 'react';

/**
 * 地図読み込み中のSkeletonコンポーネント
 * CLSを防ぐために地図と同じサイズでプレースホルダーを表示
 */
export function MapSkeleton(): ReactElement {
  return (
    <div className="h-full w-full animate-pulse bg-muted">
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            地図を読み込み中...
          </p>
        </div>
      </div>
    </div>
  );
}
