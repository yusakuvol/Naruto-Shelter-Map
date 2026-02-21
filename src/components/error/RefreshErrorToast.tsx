interface RefreshErrorToastProps {
  error: Error;
  onClose: () => void;
}

export function RefreshErrorToast({
  error,
  onClose,
}: RefreshErrorToastProps): React.JSX.Element {
  const message =
    error.message.includes('fetch') || error.message.includes('Network')
      ? 'オフラインのため更新できません'
      : error.message;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg sm:left-auto sm:right-4 sm:max-w-sm"
    >
      <p className="text-sm text-amber-900">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded p-1 text-amber-700 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-label="閉じる"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
