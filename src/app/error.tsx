'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          エラーが発生しました
        </h2>
        <p className="mt-4 text-gray-600">
          申し訳ございません。予期しないエラーが発生しました。
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-blue-500 px-6 py-3 text-white transition hover:bg-blue-600"
          type="button"
        >
          再試行
        </button>
      </div>
    </div>
  );
}
