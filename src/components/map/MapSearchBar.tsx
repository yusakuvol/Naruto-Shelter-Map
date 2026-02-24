import { MenuIcon, SearchIcon, XIcon } from 'lucide-react';
import type { ChangeEvent, FC } from 'react';
import { useState } from 'react';

interface MapSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  onMenuClick?: () => void;
  onCurrentLocationClick?: () => void;
  showCurrentLocationButton?: boolean;
}

export const MapSearchBar: FC<MapSearchBarProps> = ({
  onSearch,
  placeholder = '避難所を検索...',
  onMenuClick,
  onCurrentLocationClick,
  showCurrentLocationButton = false,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div
      className={`
        absolute left-14 right-4 top-4 z-20
        lg:left-1/2 lg:right-auto lg:w-[600px] lg:-translate-x-1/2
      `}
    >
      <div
        className={`
          flex items-center rounded-lg bg-card shadow-lg transition-shadow
          ${isFocused ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'}
        `}
      >
        {/* メニューボタン（将来の拡張用） */}
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="メニュー"
          >
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        )}

        {/* 検索アイコン */}
        <div className="flex h-11 w-11 items-center justify-center text-muted-foreground/70">
          <SearchIcon className="h-5 w-5" aria-hidden="true" />
        </div>

        {/* 検索入力 */}
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 border-none bg-transparent py-3 pr-2 text-foreground placeholder-muted-foreground outline-none"
          aria-label="避難所を検索"
        />

        {/* クリアボタン */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="flex h-11 w-11 items-center justify-center text-muted-foreground/70 transition-colors hover:text-muted-foreground"
            aria-label="検索をクリア"
          >
            <XIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        {/* 現在地ボタン（検索バー内統合版） */}
        {showCurrentLocationButton && onCurrentLocationClick && (
          <button
            type="button"
            onClick={onCurrentLocationClick}
            className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="現在地を表示"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              {/* Material Design my_location icon */}
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
