import { useEffect, useState } from 'react';

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';

function getIsDesktop(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(DESKTOP_MEDIA_QUERY).matches
  );
}

/** Tailwind の lg ブレークポイントと同期したデスクトップ表示判定 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(getIsDesktop);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent): void => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isDesktop;
}
