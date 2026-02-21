import { AnimatePresence, motion } from 'framer-motion';
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useState,
} from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getSheetHeight } from '@/lib/gestures';
import { cn } from '@/lib/utils';

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
  const id = useId();
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
          'fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 lg:hidden',
          'focus:outline-none' // フォーカスリングはコンテンツに表示
        )}
        style={{
          willChange: 'height',
        }}
      >
        {/* コンテンツ */}
        <div
          id={`${id}-sheet-content`}
          className="h-full flex flex-col overflow-hidden"
        >
          <h2 id={`${id}-sheet-title`} className="sr-only">
            避難所情報
          </h2>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </motion.div>
    </>
  );
}
