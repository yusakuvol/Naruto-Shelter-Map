import { useCallback, useEffect, useRef, useState } from 'react';
import { useWebLLM } from '@/hooks/useWebLLM';
import { buildAnswer, classifyIntent } from '@/lib/chat';
import { buildSystemPrompt } from '@/lib/chat/systemPrompt';
import type { Coordinates } from '@/lib/geo';
import type { ShelterFeature } from '@/types/shelter';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

export interface ChatMessageEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
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
  const { status, progress, initEngine, generate, isGenerating } = useWebLLM();

  // 新着メッセージ表示後に最下部へスクロール
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages 変更時にスクロールする意図
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmitWithLLM = useCallback(
    async (query: string): Promise<void> => {
      const userMsg: ChatMessageEntry = {
        id: nextId(),
        role: 'user',
        content: query,
      };
      setMessages((prev) => [...prev, userMsg]);

      const assistantId = nextId();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', isStreaming: true },
      ]);

      const systemPrompt = buildSystemPrompt(shelters, userPosition);
      const llmMessages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }> = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ];

      try {
        let accumulated = '';
        for await (const chunk of generate(llmMessages)) {
          accumulated += chunk;
          const current = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: current, isStreaming: true }
                : m
            )
          );
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        );
      } catch {
        // LLM 生成失敗時はルールベースにフォールバック
        const intent = classifyIntent(query);
        const answer = buildAnswer({
          intent,
          query,
          features: shelters,
          userPosition,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: answer, isStreaming: false }
              : m
          )
        );
      }
    },
    [shelters, userPosition, generate]
  );

  const handleSubmitRuleBased = useCallback(
    (query: string): void => {
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

  const handleSubmit = useCallback(
    (query: string): void => {
      if (status === 'ready') {
        handleSubmitWithLLM(query);
      } else {
        handleSubmitRuleBased(query);
      }
    },
    [status, handleSubmitWithLLM, handleSubmitRuleBased]
  );

  const isEmpty = messages.length === 0;
  const isLoading = shelters.length === 0 && messages.length === 0;
  const isInputDisabled = shelters.length === 0 || isGenerating;

  return (
    <section className="flex h-full flex-col" aria-label="避難所について質問">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto p-3"
        role="log"
        aria-live="polite"
        aria-label="チャット履歴"
      >
        {/* LLM ステータス表示 */}
        <LLMStatusBanner
          status={status}
          progress={progress}
          onInit={initEngine}
        />

        {isLoading && (
          <p className="text-sm text-muted-foreground">
            避難所データを読み込み中です。
          </p>
        )}
        {!isLoading && isEmpty && (
          <p className="text-sm text-muted-foreground">
            避難所について質問してみてください。例：「津波対応の避難所は？」「一番近い避難所は？」
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="mb-3">
            <ChatMessage
              role={msg.role}
              content={msg.content}
              isStreaming={msg.isStreaming}
            />
          </div>
        ))}
      </div>
      <ChatInput
        onSubmit={handleSubmit}
        disabled={isInputDisabled}
        placeholder={
          status === 'ready' ? 'AIに質問...' : '例: 津波対応の避難所は？'
        }
      />
    </section>
  );
}

/** LLM のステータスに応じたバナー表示 */
function LLMStatusBanner({
  status,
  progress,
  onInit,
}: {
  status: string;
  progress: string;
  onInit: () => void;
}): React.ReactElement | null {
  switch (status) {
    case 'idle':
      return (
        <div className="mb-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
          <p className="mb-2 text-xs text-primary">
            AIモデルを有効にすると、より自然な回答が得られます。
          </p>
          <button
            type="button"
            onClick={onInit}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            AIモデルを有効にする
          </button>
        </div>
      );
    case 'checking':
      return (
        <div className="mb-3 rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">WebGPU を確認中...</p>
        </div>
      );
    case 'downloading':
      return (
        <div className="mb-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
          <p className="mb-1 text-xs font-medium text-primary">
            AIモデルをダウンロード中...
          </p>
          <p className="text-xs text-primary/80 break-all">{progress}</p>
        </div>
      );
    case 'ready':
      return null;
    case 'unsupported':
      return (
        <div className="mb-3 rounded-lg bg-yellow-50 p-3">
          <p className="text-xs text-yellow-800">
            お使いの端末ではAIモデルは利用できません。キーワード検索で回答します。
          </p>
        </div>
      );
    case 'error':
      return (
        <div className="mb-3 rounded-lg bg-red-50 p-3">
          <p className="text-xs text-red-800">
            AIモデルの読み込みに失敗しました。キーワード検索で回答します。
          </p>
        </div>
      );
    default:
      return null;
  }
}
