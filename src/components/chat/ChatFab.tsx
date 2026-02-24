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
      className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      aria-label={ariaLabel}
    >
      <MessageCircleIcon className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
