import { type RefObject, useEffect, useRef } from 'react';

/**
 * フォーカストラップフック
 * 要素内でTabキーによるフォーカス移動を閉じ込める
 *
 * @param isActive - フォーカストラップを有効化するかどうか
 * @returns コンテナ要素のref
 */
export function useFocusTrap<T extends HTMLElement>(
  isActive: boolean
): RefObject<T | null> {
  const containerRef = useRef<T | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // フォーカストラップ有効化時、現在のフォーカス要素を保存
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // コンテナ内の最初のフォーカス可能な要素にフォーカス
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0]?.focus();
    }

    // Tabキーのハンドラー
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      // Shift+Tab: 最初の要素にいる場合は最後の要素へ
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab: 最後の要素にいる場合は最初の要素へ
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // フォーカストラップ解除時、元の要素にフォーカスを戻す
      if (
        previouslyFocusedElement.current &&
        document.contains(previouslyFocusedElement.current)
      ) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * 要素内のフォーカス可能な要素を取得
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => {
      // 非表示要素は除外
      return (
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        getComputedStyle(element).visibility !== 'hidden'
      );
    }
  );
}
