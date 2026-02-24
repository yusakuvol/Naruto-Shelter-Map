import { useState } from 'react';
import { DisasterTypeFilter } from '@/components/filter/DisasterTypeFilter';
import { Button } from '@/components/ui/button';
import { useFilter } from '@/contexts/FilterContext';

export function FilterButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedDisasters } = useFilter();
  const hasActiveFilters = selectedDisasters.length > 0;

  return (
    <>
      {/* フィルタボタン */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full bg-card shadow-lg hover:shadow-xl ${hasActiveFilters ? 'border-2 border-primary' : ''}`}
        aria-label="フィルタ"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-muted-foreground">
          フィルタ
        </span>
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {selectedDisasters.length}
          </span>
        )}
      </Button>

      {/* フィルタドロワー */}
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          {/* ドロワー */}
          <div className="absolute left-4 top-16 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg bg-card shadow-2xl lg:hidden">
            <div className="max-h-[calc(100vh-6rem)] overflow-y-auto p-4">
              <DisasterTypeFilter />
            </div>
          </div>
        </>
      )}
    </>
  );
}
