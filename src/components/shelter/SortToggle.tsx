import { ArrowDownAZIcon, CrosshairIcon } from 'lucide-react';
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
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm"
      >
        <CrosshairIcon className="h-4 w-4" aria-hidden="true" />
        <span>距離順</span>
      </ToggleGroupItem>

      <ToggleGroupItem
        value="name"
        aria-label="名前順でソート"
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm"
      >
        <ArrowDownAZIcon className="h-4 w-4" aria-hidden="true" />
        <span>名前順</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
