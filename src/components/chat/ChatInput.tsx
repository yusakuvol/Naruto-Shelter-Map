import { type FormEvent, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
      className="flex gap-2 border-t border-border bg-card p-2"
      aria-label="避難所について質問"
    >
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-w-0 flex-1"
        aria-label="質問を入力"
        autoComplete="off"
      />
      <Button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        size="sm"
        aria-label="送信"
      >
        送信
      </Button>
    </form>
  );
}
