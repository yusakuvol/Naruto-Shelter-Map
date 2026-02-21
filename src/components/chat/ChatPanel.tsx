import { useCallback, useEffect, useRef, useState } from 'react';
import { buildAnswer, classifyIntent } from '@/lib/chat';
import type { Coordinates } from '@/lib/geo';
import type { ShelterFeature } from '@/types/shelter';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

export interface ChatMessageEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  shelters: ShelterFeature[];
  userPosition: Coordinates | null;
}

let messageIdCounter = 0;
function nextId(): string {
  messageIdCounter += 1;
  return `chat-msg-${messageIdCounter}`;
}

export function ChatPanel({
  shelters,
  userPosition,
}: ChatPanelProps): React.ReactElement {
  const [messages, setMessages] = useState<ChatMessageEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 新着メッセージ表示後に最下部へスクロール（レビュー指摘対応）
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages 変更時にスクロールする意図
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = useCallback(
    (query: string) => {
      const userMsg: ChatMessageEntry = {
        id: nextId(),
        role: 'user',
        content: query,
      };
      setMessages((prev) => [...prev, userMsg]);

      const intent = classifyIntent(query);
      const answer = buildAnswer({
        intent,
        query,
        features: shelters,
        userPosition,
      });
      const assistantMsg: ChatMessageEntry = {
        id: nextId(),
        role: 'assistant',
        content: answer,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    },
    [shelters, userPosition]
  );

  const isEmpty = messages.length === 0;
  const isLoading = shelters.length === 0 && messages.length === 0;

  return (
    <section className="flex h-full flex-col" aria-label="避難所について質問">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto p-3"
        role="log"
        aria-live="polite"
        aria-label="チャット履歴"
      >
        {isLoading && (
          <p className="text-sm text-gray-500">
            避難所データを読み込み中です。
          </p>
        )}
        {!isLoading && isEmpty && (
          <p className="text-sm text-gray-500">
            避難所について質問してみてください。例：「津波対応の避難所は？」「一番近い避難所は？」
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="mb-3">
            <ChatMessage role={msg.role} content={msg.content} />
          </div>
        ))}
      </div>
      <ChatInput
        onSubmit={handleSubmit}
        disabled={shelters.length === 0}
        placeholder="例: 津波対応の避難所は？"
      />
    </section>
  );
}
