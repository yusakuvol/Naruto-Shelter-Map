'use client';

import { calculateSnapPoint, getSheetHeight } from '@/lib/gestures';
import { cn } from '@/lib/utils';
import { AnimatePresence, type PanInfo, motion } from 'framer-motion';
import { type ReactNode, useEffect, useState } from 'react';

export type SheetState = 'closed' | 'half' | 'full';

interface BottomSheetProps {
  state: SheetState;
  onStateChange: (state: SheetState) => void;
  children: ReactNode;
}

export function BottomSheet({
  state,
  onStateChange,
  children,
}: BottomSheetProps) {
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 667
  );

  // ビューポートの高さを監視
  useEffect(() => {
    const updateHeight = (): void => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

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

  // ドラッグ終了時のハンドラー
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ): void => {
    const currentHeight = getSheetHeight(state, viewportHeight);
    const newHeight = currentHeight - info.offset.y; // offsetは下向きが正
    const newState = calculateSnapPoint(
      newHeight,
      -info.velocity.y,
      viewportHeight
    );

    if (newState !== state) {
      onStateChange(newState);
    }
  };

  // クリック時のハンドラー（従来の動作を維持）
  const handleHandleClick = (): void => {
    if (state === 'closed') onStateChange('half');
    else if (state === 'half') onStateChange('full');
    else onStateChange('closed');
  };

  const currentHeight = getSheetHeight(state, viewportHeight);

  return (
    <>
      {/* オーバーレイ（closed以外で表示） */}
      <AnimatePresence>
        {state !== 'closed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => onStateChange('closed')}
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ height: currentHeight }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
        }}
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 lg:hidden',
          'touch-none' // タッチイベントを適切に処理
        )}
        style={{
          willChange: 'height',
        }}
      >
        {/* ドラッグハンドル */}
        <motion.div
          className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing"
          onClick={handleHandleClick}
          whileTap={{ scale: 1.05 }}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </motion.div>

        {/* コンテンツ */}
        <div className="h-[calc(100%-40px)] overflow-hidden">{children}</div>
      </motion.div>
    </>
  );
}
