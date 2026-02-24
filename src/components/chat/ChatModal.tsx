import { XIcon } from 'lucide-react';
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
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3">
          <DialogTitle className="text-lg font-bold text-foreground">
            避難所について質問
          </DialogTitle>
          <DialogDescription className="sr-only">
            避難所に関する質問をAIに相談できます
          </DialogDescription>
          <DialogClose asChild>
            <button
              type="button"
              className="flex min-h-11 min-w-11 items-center justify-center rounded p-2 text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              aria-label="閉じる"
            >
              <XIcon className="h-5 w-5" aria-hidden="true" />
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
