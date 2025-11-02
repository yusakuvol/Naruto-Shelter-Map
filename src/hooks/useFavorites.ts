import { useEffect, useState } from 'react';

const STORAGE_KEY = 'favorite-shelters';

/**
 * お気に入り避難所を管理するカスタムフック
 *
 * LocalStorageを使用して永続化
 */
export function useFavorites(): {
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
} {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 初回マウント時にLocalStorageから読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setFavorites(new Set(parsed));
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
    }
  }, []);

  const toggleFavorite = (id: string): void => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      // LocalStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch (error) {
        console.error('Failed to save favorites to localStorage:', error);
      }

      return next;
    });
  };

  const isFavorite = (id: string): boolean => {
    return favorites.has(id);
  };

  return { favorites, toggleFavorite, isFavorite };
}
