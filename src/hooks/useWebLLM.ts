import type { MLCEngineInterface } from '@mlc-ai/web-llm';
import { useCallback, useRef, useState } from 'react';

type WebLLMStatus =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'ready'
  | 'unsupported'
  | 'error';

interface UseWebLLMReturn {
  status: WebLLMStatus;
  progress: string;
  initEngine: () => Promise<void>;
  generate: (
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  ) => AsyncGenerator<string, void, void>;
  isGenerating: boolean;
}

const MODEL_ID = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';

async function checkWebGPUSupport(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  // navigator.gpu は WebGPU 対応ブラウザのみ存在（型定義が標準にないため unknown 経由）
  const nav = navigator as unknown as {
    gpu?: { requestAdapter: () => Promise<unknown | null> };
  };
  if (!nav.gpu) return false;
  try {
    const adapter = await nav.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

export function useWebLLM(): UseWebLLMReturn {
  const [status, setStatus] = useState<WebLLMStatus>('idle');
  const [progress, setProgress] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const engineRef = useRef<MLCEngineInterface | null>(null);

  const initEngine = useCallback(async (): Promise<void> => {
    if (
      status === 'ready' ||
      status === 'downloading' ||
      status === 'checking'
    ) {
      return;
    }

    setStatus('checking');

    const supported = await checkWebGPUSupport();
    if (!supported) {
      setStatus('unsupported');
      return;
    }

    setStatus('downloading');
    setProgress('モデルを準備中...');

    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report) => {
          setProgress(report.text);
        },
      });
      engineRef.current = engine;
      setStatus('ready');
      setProgress('');
    } catch {
      setStatus('error');
      setProgress('');
    }
  }, [status]);

  const generate = useCallback(async function* generateFn(
    messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>
  ): AsyncGenerator<string, void, void> {
    const engine = engineRef.current;
    if (!engine) return;

    setIsGenerating(true);
    try {
      const stream = await engine.chat.completions.create({
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 512,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          yield delta;
        }
      }
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { status, progress, initEngine, generate, isGenerating };
}
