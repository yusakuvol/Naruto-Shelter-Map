import { useCallback, useRef, useState } from 'react';

type CopyState = 'idle' | 'copied' | 'error';

interface UseCopyToClipboardReturn {
  state: CopyState;
  copy: (text: string) => Promise<void>;
}

export function useCopyToClipboard(
  resetDelay = 2000
): UseCopyToClipboardReturn {
  const [state, setState] = useState<CopyState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = useCallback(
    async (text: string): Promise<void> => {
      try {
        await navigator.clipboard.writeText(text);
        setState('copied');
      } catch {
        setState('error');
      }

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setState('idle'), resetDelay);
    },
    [resetDelay]
  );

  return { state, copy };
}
