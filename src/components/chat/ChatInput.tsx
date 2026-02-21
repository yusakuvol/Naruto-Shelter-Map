import { type FormEvent, useCallback, useState } from 'react';

interface ChatInputProps {
  onSubmit: (query: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSubmit,
  disabled = false,
  placeholder = '例: 津波対応の避難所は？',
}: ChatInputProps): React.ReactElement {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed.length === 0 || disabled) return;
      onSubmit(trimmed);
      setValue('');
    },
    [value, disabled, onSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 border-t border-gray-200 bg-white p-2"
      aria-label="避難所について質問"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-500"
        aria-label="質問を入力"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50"
        aria-label="送信"
      >
        送信
      </button>
    </form>
  );
}
