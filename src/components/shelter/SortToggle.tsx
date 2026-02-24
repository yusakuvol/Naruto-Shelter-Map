import { ArrowDownAZIcon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

export type SortMode = 'distance' | 'name';

interface SortToggleProps {
  mode: SortMode;
  onModeChange: (mode: SortMode) => void;
  disabled?: boolean;
  className?: string;
}

export function SortToggle({
  mode,
  onModeChange,
  disabled = false,
  className,
}: SortToggleProps): React.ReactElement {
  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(value) => {
        // Radix ToggleGroup sends "" when deselecting; ignore to keep one always selected
        if (value) onModeChange(value as SortMode);
      }}
      disabled={disabled}
      className={cn('w-full', className)}
    >
      <ToggleGroupItem
        value="distance"
        aria-label="距離順でソート"
        title={disabled ? '現在地を取得してください' : '距離順でソート'}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md"
      >
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
        </svg>
        <span>距離順</span>
      </ToggleGroupItem>

      <ToggleGroupItem
        value="name"
        aria-label="名前順でソート"
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md"
      >
        <ArrowDownAZIcon className="h-4 w-4" aria-hidden="true" />
        <span>名前順</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
