import { useState, useEffect } from 'react';

/**
 * ユーザーのprefers-reduced-motion設定を検出するカスタムフック
 *
 * @returns {boolean} `true`の場合、アニメーションを減らすべき
 *
 * @example
 * ```tsx
 * const shouldReduceMotion = useReducedMotion();
 *
 * <motion.div
 *   animate={{ opacity: 1 }}
 *   transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
 * />
 * ```
 */
export function useReducedMotion(): boolean {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // メディアクエリを作成
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // 初期値を設定
    setShouldReduceMotion(mediaQuery.matches);

    // 変更を監視
    const handleChange = (event: MediaQueryListEvent): void => {
      setShouldReduceMotion(event.matches);
    };

    // リスナーを追加
    mediaQuery.addEventListener('change', handleChange);

    // クリーンアップ
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return shouldReduceMotion;
}
