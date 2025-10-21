'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { DisasterType } from '@/types/shelter';

interface FilterContextValue {
  selectedDisasters: DisasterType[];
  toggleDisaster: (disaster: DisasterType) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [selectedDisasters, setSelectedDisasters] = useState<DisasterType[]>(
    []
  );

  const toggleDisaster = (disaster: DisasterType): void => {
    setSelectedDisasters((prev) =>
      prev.includes(disaster)
        ? prev.filter((d) => d !== disaster)
        : [...prev, disaster]
    );
  };

  const clearFilters = (): void => setSelectedDisasters([]);

  return (
    <FilterContext.Provider
      value={{ selectedDisasters, toggleDisaster, clearFilters }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within FilterProvider');
  }
  return context;
}
