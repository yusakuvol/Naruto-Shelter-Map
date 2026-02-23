interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean | undefined;
}

export function ChatMessage({
  role,
  content,
  isStreaming = false,
}: ChatMessageProps): React.ReactElement {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="whitespace-pre-line break-words">
          {content}
          {isStreaming && (
            <span className="ml-0.5 inline-block animate-pulse">▍</span>
          )}
        </p>
      </div>
    </div>
  );
}
