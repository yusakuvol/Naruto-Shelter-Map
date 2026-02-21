interface SheetContentProps {
  shelters: unknown[];
  selectedShelterId?: string | null | undefined;
  onShelterSelect?: (id: string) => void;
  onMapViewRequest: () => void;
  sortMode?: string;
  onSortModeChange?: (mode: string) => void;
  hasPosition?: boolean;
  favorites?: Set<string>;
  onToggleFavorite?: (id: string) => void;
  userPosition?: unknown;
  totalCount?: number;
}

export function SheetContent(_props: SheetContentProps) {
  // リスト機能は不要のため、空のコンポーネントを返す
  return null;
}
