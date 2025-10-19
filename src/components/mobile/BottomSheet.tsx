'use client';

import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { calculateSnapPoint, getSheetHeight } from '@/lib/gestures';
import { cn } from '@/lib/utils';
import {
  AnimatePresence,
  type PanInfo,
  motion,
  useDragControls,
} from 'framer-motion';
import { type KeyboardEvent, type ReactNode, useEffect, useState } from 'react';

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

  // ドラッグコントロール
  const dragControls = useDragControls();

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
    const currentH = getSheetHeight(state, viewportHeight);
    // info.offset.yは上向きが負、下向きが正
    // シートの高さは上にドラッグすると増える（画面下から上に向かって高さが増える）
    // なので、offset.yが負（上向き）の時、高さは増える
    const newHeight =
      currentH + Math.abs(info.offset.y) * (info.offset.y < 0 ? 1 : -1);
    const newState = calculateSnapPoint(
      newHeight,
      -info.velocity.y, // 上向きが正のvelocityになるように反転
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
              shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }
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
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={shouldReduceMotion ? 0 : 0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        onKeyDown={handleKeyDown}
        onTouchStart={(e) => {
          // BottomSheet内のタッチイベントが地図に伝播するのを防ぐ
          e.stopPropagation();
        }}
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
          'focus:outline-none' // フォーカスリングはコンテンツに表示
        )}
        style={{
          willChange: 'height',
        }}
      >
        {/* ドラッグハンドル */}
        <div
          role="slider"
          aria-label="シートの高さを調整"
          aria-valuenow={getStateValue()}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={getStateLabel()}
          tabIndex={0}
          className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset touch-pan-y"
          onClick={handleHandleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleHandleClick();
            }
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            dragControls.start(e);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          style={{ touchAction: 'none' }}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full pointer-events-none" />
        </div>

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
