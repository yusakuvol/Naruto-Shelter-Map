import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
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
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="inset-0 flex max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 pb-[env(safe-area-inset-bottom)]"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <DialogTitle className="text-lg font-bold text-gray-900">
            避難所について質問
          </DialogTitle>
          <DialogDescription className="sr-only">
            避難所に関する質問をAIに相談できます
          </DialogDescription>
          <DialogClose asChild>
            <button
              type="button"
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
          </DialogClose>
        </header>
        <div className="min-h-0 flex-1">
          <ChatPanel shelters={shelters} userPosition={userPosition} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
