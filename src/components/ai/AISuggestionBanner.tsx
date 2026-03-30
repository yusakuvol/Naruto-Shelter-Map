import { XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFilter } from '@/contexts/FilterContext';
import { buildSuggestion } from '@/lib/chat/suggestion';
import type { Coordinates } from '@/lib/geo';
import type { ShelterFeature } from '@/types/shelter';

interface AISuggestionBannerProps {
  shelters: ShelterFeature[];
  userPosition: Coordinates | null;
  onOpenChat?: () => void;
  onShelterSelect?: (id: string) => void;
}

/**
 * 現在地・フィルタ状態に応じてプロアクティブに提案を表示するバナー。
 * コンテキストが変化（位置取得・フィルタ変更）したら再表示する。
 */
export function AISuggestionBanner({
  shelters,
  userPosition,
  onOpenChat,
  onShelterSelect,
}: AISuggestionBannerProps): React.ReactElement | null {
  const { selectedDisasters } = useFilter();
  const [dismissed, setDismissed] = useState(false);

  // 前回のコンテキストを記録しておく
  const prevPositionRef = useRef<Coordinates | null>(null);
  const prevDisastersRef = useRef<string>('');

  useEffect(() => {
    const positionFirstObtained =
      userPosition !== null && prevPositionRef.current === null;
    const disastersKey = selectedDisasters.slice().sort().join(',');
    const disastersChanged = disastersKey !== prevDisastersRef.current;

    if (positionFirstObtained || disastersChanged) {
      setDismissed(false);
    }

    prevPositionRef.current = userPosition;
    prevDisastersRef.current = disastersKey;
  }, [userPosition, selectedDisasters]);

  const suggestion = buildSuggestion(shelters, userPosition, selectedDisasters);

  if (!suggestion || dismissed) return null;

  return (
    <div
      className="rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="AI提案"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground leading-snug">
          <span className="mr-1" aria-hidden="true">
            💡
          </span>
          {suggestion.message}
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          aria-label="閉じる"
        >
          <XIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {(suggestion.shelterId || onOpenChat) && (
        <div className="mt-2 flex items-center gap-2">
          {suggestion.shelterId && onShelterSelect && (
            <button
              type="button"
              onClick={() => {
                onShelterSelect(suggestion.shelterId as string);
                setDismissed(true);
              }}
              className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              地図で見る
            </button>
          )}
          {onOpenChat && (
            <button
              type="button"
              onClick={() => {
                onOpenChat();
                setDismissed(true);
              }}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              詳細を聞く
            </button>
          )}
        </div>
      )}
    </div>
  );
}
