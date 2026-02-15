'use client';

import { useEffect, useId, useRef } from 'react';
import type { Coordinates } from '@/lib/geo';
import type { ShelterFeature } from '@/types/shelter';
import { ChatPanel } from './ChatPanel';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelters: ShelterFeature[];
  userPosition: Coordinates | null;
}

export function ChatModal({
  isOpen,
  onClose,
  shelters,
  userPosition,
}: ChatModalProps): React.ReactElement | null {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <h2
          id={titleId}
          className="text-lg font-bold text-gray-900"
        >
          避難所について質問
        </h2>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="rounded p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="閉じる"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </header>
      <div className="min-h-0 flex-1">
        <ChatPanel shelters={shelters} userPosition={userPosition} />
      </div>
    </div>
  );
}
