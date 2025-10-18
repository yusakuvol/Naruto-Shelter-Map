'use client';

import { calculateSnapPoint, getSheetHeight } from '@/lib/gestures';
import { cn } from '@/lib/utils';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AnimatePresence, type PanInfo, motion } from 'framer-motion';
import { type ReactNode, type KeyboardEvent, useEffect, useState } from 'react';

export type SheetState = 'closed' | 'peek' | 'half' | 'full';

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

  // フォーカストラップ（half/full状態の時のみ有効）
  const sheetRef = useFocusTrap<HTMLDivElement>(
    state === 'half' || state === 'full'
  );

  // ビューポートの高さを監視
  useEffect(() => {
    const updateHeight = (): void => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // スクロールロック（half/full状態の時のみ）
  useEffect(() => {
    if (state === 'half' || state === 'full') {
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

  // クリック時のハンドラー（4状態をサイクル）
  const handleHandleClick = (): void => {
    if (state === 'closed') onStateChange('peek');
    else if (state === 'peek') onStateChange('half');
    else if (state === 'half') onStateChange('full');
    else onStateChange('closed');
  };

  // キーボードハンドラー
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape' && state !== 'closed') {
      onStateChange('closed');
    } else if (e.key === 'ArrowUp' && state !== 'full') {
      e.preventDefault();
      // closed → peek → half → full
      if (state === 'closed') onStateChange('peek');
      else if (state === 'peek') onStateChange('half');
      else onStateChange('full');
    } else if (e.key === 'ArrowDown' && state !== 'closed') {
      e.preventDefault();
      // full → half → peek → closed
      if (state === 'full') onStateChange('half');
      else if (state === 'half') onStateChange('peek');
      else onStateChange('closed');
    }
  };

  // 状態のラベルを取得
  const getStateLabel = (): string => {
    switch (state) {
      case 'closed':
        return 'シートを閉じています';
      case 'peek':
        return 'シートをプレビュー表示しています';
      case 'half':
        return 'シートを半分開いています';
      case 'full':
        return 'シートを全開にしています';
    }
  };

  // 状態の数値（0-100）
  const getStateValue = (): number => {
    switch (state) {
      case 'closed':
        return 0;
      case 'peek':
        return 25;
      case 'half':
        return 50;
      case 'full':
        return 100;
    }
  };

  const currentHeight = getSheetHeight(state, viewportHeight);

  return (
    <>
      {/* オーバーレイ（half/full状態で表示） */}
      <AnimatePresence>
        {(state === 'half' || state === 'full') && (
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
            onClick={() => onStateChange('closed')}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <motion.div
        ref={sheetRef}
        role="dialog"
        aria-modal={state === 'half' || state === 'full'}
        aria-labelledby="sheet-title"
        aria-hidden={state === 'closed'}
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
