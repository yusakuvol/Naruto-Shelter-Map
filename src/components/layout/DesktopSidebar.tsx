import { ChatPanel } from '@/components/chat/ChatPanel';
import { DisasterTypeFilter } from '@/components/filter/DisasterTypeFilter';
import { ShelterList } from '@/components/shelter/ShelterList';
import { type SortMode, SortToggle } from '@/components/shelter/SortToggle';
import type { Coordinates } from '@/lib/geo';
import type { ShelterFeature } from '@/types/shelter';

interface ShelterWithDistance {
  shelter: ShelterFeature;
  distance: number | null;
}

interface DesktopSidebarProps {
  mainContentId: string;
  filteredShelters: ShelterFeature[];
  allSheltersCount: number;
  listShelters: ShelterWithDistance[];
  selectedShelterId: string | null;
  onShelterSelect: (id: string | null) => void;
  onShowDetail: (shelter: ShelterFeature) => void;
  onShowTerms: () => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  position: Coordinates | null;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
  listFilter: 'all' | 'favorites' | 'chat';
  onListFilterChange: (filter: 'all' | 'favorites' | 'chat') => void;
}

export function DesktopSidebar({
  filteredShelters,
  allSheltersCount,
  listShelters,
  selectedShelterId,
  onShelterSelect,
  onShowDetail,
  onShowTerms,
  onRefresh,
  isRefreshing,
  position,
  favorites,
  onToggleFavorite,
  sortMode,
  onSortModeChange,
  listFilter,
  onListFilterChange,
}: DesktopSidebarProps): React.JSX.Element {
  return (
    <aside
      className="flex h-full w-96 flex-col border-r bg-white"
      aria-label="避難所フィルタとリスト"
    >
      <header className="border-b p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <img
              src="/icon.svg"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9"
              aria-hidden="true"
            />
            鳴門避難マップ
          </h1>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void onRefresh()}
              disabled={isRefreshing}
              className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-1.5 text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60"
              aria-label="避難所データを最新に更新"
              title="通信して最新の避難所データを取得します"
            >
              {isRefreshing ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
                  aria-hidden
                />
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={onShowTerms}
              className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-1.5 text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              aria-label="利用規約を表示"
              title="利用規約"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          {listFilter === 'chat'
            ? '避難所について質問'
            : listFilter === 'favorites'
              ? `${listShelters.length}件のお気に入り`
              : `${filteredShelters.length}件の避難所`}
          {listFilter === 'all' &&
            filteredShelters.length !== allSheltersCount && (
              <span className="ml-1 text-gray-700">
                （全{allSheltersCount}件中）
              </span>
            )}
        </p>
      </header>

      <div className="border-b p-4">
        <div
          className="flex rounded-lg border border-gray-200 p-1"
          role="tablist"
          aria-label="リストの表示"
        >
          <button
            type="button"
            role="tab"
            aria-selected={listFilter === 'all'}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              listFilter === 'all'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => onListFilterChange('all')}
          >
            すべて
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={listFilter === 'favorites'}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              listFilter === 'favorites'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => onListFilterChange('favorites')}
          >
            お気に入り{favorites.size > 0 && ` (${favorites.size})`}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={listFilter === 'chat'}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              listFilter === 'chat'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => onListFilterChange('chat')}
          >
            チャット
          </button>
        </div>
      </div>

      <nav aria-label="災害種別フィルタ" className="border-b p-4">
        <DisasterTypeFilter />
      </nav>

      {listFilter !== 'chat' && (
        <div className="border-b p-4">
          <SortToggle
            mode={sortMode}
            onModeChange={onSortModeChange}
            disabled={!position}
          />
        </div>
      )}

      <nav
        aria-label={listFilter === 'chat' ? '避難所について質問' : '避難所一覧'}
        className="min-h-0 flex-1 overflow-hidden"
      >
        {listFilter === 'chat' ? (
          <ChatPanel
            shelters={filteredShelters}
            userPosition={position ?? null}
          />
        ) : (
          <ShelterList
            shelters={listShelters}
            selectedShelterId={selectedShelterId}
            onShelterSelect={onShelterSelect}
            onShowDetail={onShowDetail}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            userPosition={position}
            {...(listFilter === 'favorites' && {
              emptyMessage: 'お気に入りに追加した避難所がここに表示されます',
            })}
          />
        )}
      </nav>
    </aside>
  );
}
