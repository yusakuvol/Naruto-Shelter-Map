'use client';

import { calculateSnapPoint, getSheetHeight } from '@/lib/gestures';
import { cn } from '@/lib/utils';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AnimatePresence, type PanInfo, motion } from 'framer-motion';
import { type ReactNode, type KeyboardEvent, useEffect, useState } from 'react';

export type SheetState = 'minimized' | 'expanded';

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

  // モーション設定を検出
  const shouldReduceMotion = useReducedMotion();

  // フォーカストラップ（expanded状態の時のみ有効）
  const sheetRef = useFocusTrap<HTMLDivElement>(state === 'expanded');

  // ビューポートの高さを監視
  useEffect(() => {
    const updateHeight = (): void => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // スクロールロック（expanded状態の時のみ）
  useEffect(() => {
    if (state === 'expanded') {
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

  // クリック時のハンドラー（2状態をトグル）
  const handleHandleClick = (): void => {
    onStateChange(state === 'minimized' ? 'expanded' : 'minimized');
  };

  // キーボードハンドラー
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape' && state === 'expanded') {
      onStateChange('minimized');
    } else if (e.key === 'ArrowUp' && state === 'minimized') {
      e.preventDefault();
      onStateChange('expanded');
    } else if (e.key === 'ArrowDown' && state === 'expanded') {
      e.preventDefault();
      onStateChange('minimized');
    }
  };

  // 状態のラベルを取得
  const getStateLabel = (): string => {
    switch (state) {
      case 'minimized':
        return 'シートを最小化しています';
      case 'expanded':
        return 'シートを展開しています';
    }
  };

  // 状態の数値（0-100）
  const getStateValue = (): number => {
    switch (state) {
      case 'minimized':
        return 0;
      case 'expanded':
        return 100;
    }
  };

  const currentHeight = getSheetHeight(state, viewportHeight);

  return (
    <>
      {/* オーバーレイ（expanded状態で表示） */}
      <AnimatePresence>
        {state === 'expanded' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.2 }
            }
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => onStateChange('minimized')}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <motion.div
        ref={sheetRef}
        role="dialog"
        aria-modal={state === 'expanded'}
        aria-labelledby="sheet-title"
        aria-hidden={state === 'minimized'}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={shouldReduceMotion ? 0 : 0.1}
        onDragEnd={handleDragEnd}
        onKeyDown={handleKeyDown}
        animate={{ height: currentHeight }}
        transition={
          shouldReduceMotion
            ? { duration: 0.2, ease: 'easeOut' }
            : {
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }
        }
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 lg:hidden',
          'touch-none', // タッチイベントを適切に処理
          'focus:outline-none' // フォーカスリングはコンテンツに表示
        )}
        style={{
          willChange: 'height',
        }}
      >
        {/* ドラッグハンドル */}
        <motion.div
          role="slider"
          aria-label="シートの高さを調整"
          aria-valuenow={getStateValue()}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={getStateLabel()}
          tabIndex={0}
          className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          onClick={handleHandleClick}
          whileTap={shouldReduceMotion ? {} : { scale: 1.05 }}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </motion.div>

        {/* コンテンツ */}
        <div id="sheet-content" className="h-[calc(100%-40px)] overflow-hidden">
          <h2 id="sheet-title" className="sr-only">
            避難所情報
          </h2>
          {children}
        </div>
      </motion.div>
    </>
  );
}
