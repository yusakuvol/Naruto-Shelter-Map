import { MessageCircleIcon } from 'lucide-react';

interface ChatFabProps {
  onClick: () => void;
  ariaLabel?: string;
}

export function ChatFab({
  onClick,
  ariaLabel = '避難所について質問する',
}: ChatFabProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      aria-label={ariaLabel}
    >
      <MessageCircleIcon className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
