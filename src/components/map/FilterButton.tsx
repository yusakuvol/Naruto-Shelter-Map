import { useState } from 'react';
import { DisasterTypeFilter } from '@/components/filter/DisasterTypeFilter';
import { useFilter } from '@/contexts/FilterContext';

export function FilterButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedDisasters } = useFilter();
  const hasActiveFilters = selectedDisasters.length > 0;

  return (
    <>
      {/* フィルタボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-lg
          transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${hasActiveFilters ? 'border-2 border-blue-500' : 'border border-gray-200'}
        `}
        aria-label="フィルタ"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-gray-700">フィルタ</span>
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
            {selectedDisasters.length}
          </span>
        )}
      </button>

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
          <div className="absolute left-4 top-16 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg bg-white shadow-2xl lg:hidden">
            <div className="max-h-[calc(100vh-6rem)] overflow-y-auto p-4">
              <DisasterTypeFilter />
            </div>
          </div>
        </>
      )}
    </>
  );
}
