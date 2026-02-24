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

// 災害種別アイコン（JIS Z8210 災害種別一般図記号に準拠したデザイン）
// 内閣府「避難場所等の図記号の標準化」で使われる図材に合わせており、
// 自治体の避難標識などで見慣れた形で直感的に識別しやすくする。

// 洪水（JIS 6.5.1）: 上昇した水面を表す二重の波
function FloodIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2 10c2.5 1 5 1 7.5 0s5-1 7.5 0M2 15c2.5 1 5 1 7.5 0s5-1 7.5 0"
      />
    </svg>
  );
}

// 津波（JIS 6.5.3）: 海面から盛り上がった波
function TsunamiIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2 20c4-6 8-6 12 0 4 6 8 6 12 0"
      />
    </svg>
  );
}

// 土砂災害（JIS 6.5.4）: 崖と大小複数の岩石
function LandslideIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 20V8l7-4 7 16H5z"
      />
      <circle cx="8" cy="16" r="1.5" strokeWidth={2} />
      <circle cx="14" cy="18" r="1" strokeWidth={2} />
      <circle cx="18" cy="15" r="1.2" strokeWidth={2} />
    </svg>
  );
}

// 地震: 地震波（揺れの波形。避難標識等でよく使われる表現）
function EarthquakeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2 12h3l2-4 2 4 2-6 2 6h3"
      />
    </svg>
  );
}

// 火災（JIS 6.5.5）: 炎（一般的な火災アイコン）
function FireIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 1.832 1.832 3 4.5 3 6.5a7.98 7.98 0 01-1.343 4.657z"
      />
    </svg>
  );
}

const DISASTER_ICONS: Record<
  DisasterType,
  ({ className }: { className?: string }) => ReactElement
> = {
  洪水: FloodIcon,
  津波: TsunamiIcon,
  土砂災害: LandslideIcon,
  地震: EarthquakeIcon,
  火災: FireIcon,
};

export function DisasterTypeFilter(): ReactElement {
  const { selectedDisasters, toggleDisaster, clearFilters } = useFilter();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">災害種別</h3>
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
                isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
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
                  isSelected ? 'text-blue-600' : 'text-gray-600'
                }`}
              />
              <span
                className={`text-sm transition-colors ${
                  isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'
                }`}
              >
                {disaster}
              </span>
            </label>
          );
        })}
      </div>

      {selectedDisasters.length > 0 && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-600">
            {selectedDisasters.length}件の災害種別でフィルタ中
          </p>
        </div>
      )}
    </div>
  );
}
