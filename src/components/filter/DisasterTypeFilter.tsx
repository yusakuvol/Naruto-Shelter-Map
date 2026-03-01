import { ActivityIcon, FlameIcon, WavesIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useFilter } from '@/contexts/FilterContext';
import type { DisasterType } from '@/types/shelter';

const DISASTER_TYPES: readonly DisasterType[] = [
  '洪水',
  '津波',
  '土砂災害',
  '地震',
  '火災',
] as const;

// 津波: 大きく立ち上がる波（JIS Z8210 6.5.3 参考）
function TsunamiIcon({ className }: { className?: string }): ReactElement {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 21c0-6 1.5-9 3-11.5S14 8 14 10.5c0 0 .5-4 2.5-6.5S20 3 20 6v15" />
      <path d="M3 21h18" />
    </svg>
  );
}

// 土砂災害: 山体にジグザグの亀裂（JIS Z8210 6.5.4 参考）
function LandslideIcon({ className }: { className?: string }): ReactElement {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 21h20L14 3 2 21z" />
      <path d="M14 3l-4 8 3 3-4 7" />
    </svg>
  );
}

const DISASTER_ICONS: Record<
  DisasterType,
  React.ComponentType<{ className?: string }>
> = {
  洪水: WavesIcon,
  津波: TsunamiIcon,
  土砂災害: LandslideIcon,
  地震: ActivityIcon,
  火災: FlameIcon,
};

export function DisasterTypeFilter(): ReactElement {
  const { selectedDisasters, toggleDisaster, clearFilters } = useFilter();

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">災害種別</h3>
        {selectedDisasters.length > 0 && (
          <Button
            variant="link"
            size="xs"
            onClick={clearFilters}
            aria-label="フィルタをクリア"
          >
            クリア
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {DISASTER_TYPES.map((disaster) => {
          const IconComponent = DISASTER_ICONS[disaster];
          const isSelected = selectedDisasters.includes(disaster);
          return (
            <label
              key={disaster}
              htmlFor={`filter-${disaster}`}
              className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors ${
                isSelected
                  ? 'bg-primary/10 hover:bg-primary/15'
                  : 'hover:bg-accent'
              }`}
            >
              <Checkbox
                id={`filter-${disaster}`}
                checked={isSelected}
                onCheckedChange={() => toggleDisaster(disaster)}
                aria-label={`${disaster}で絞り込む`}
              />
              <IconComponent
                className={`h-5 w-5 shrink-0 transition-colors ${
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-sm transition-colors ${
                  isSelected ? 'text-primary font-medium' : 'text-foreground/80'
                }`}
              >
                {disaster}
              </span>
            </label>
          );
        })}
      </div>

    </div>
  );
}
