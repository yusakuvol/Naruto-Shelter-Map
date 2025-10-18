'use client';

import { type ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';

export type SheetState = 'closed' | 'half' | 'full';

interface BottomSheetProps {
  state: SheetState;
  onStateChange: (state: SheetState) => void;
  children: ReactNode;
}

const SHEET_HEIGHTS: Record<SheetState, string> = {
  closed: 'h-[60px]', // タブバーのみ表示
  half: 'h-[50vh]',
  full: 'h-[90vh]',
};

export function BottomSheet({
  state,
  onStateChange,
  children,
}: BottomSheetProps) {
  // スクロールロック（シートが開いている時）
  useEffect(() => {
    if (state !== 'closed') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [state]);

  return (
    <>
      {/* オーバーレイ（closed以外で表示） */}
      {state !== 'closed' && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => onStateChange('closed')}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 lg:hidden',
          'transition-all duration-300 ease-in-out',
          SHEET_HEIGHTS[state],
        )}
      >
        {/* ドラッグハンドル */}
        <div
          className="flex items-center justify-center py-3 cursor-pointer"
          onClick={() => {
            if (state === 'closed') onStateChange('half');
            else if (state === 'half') onStateChange('full');
            else onStateChange('closed');
          }}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* コンテンツ */}
        <div className="h-[calc(100%-40px)] overflow-hidden">{children}</div>
      </div>
    </>
  );
}
