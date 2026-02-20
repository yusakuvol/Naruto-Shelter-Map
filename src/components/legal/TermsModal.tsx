import { clsx } from 'clsx';
import { useEffect, useId, useRef } from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({
  isOpen,
  onClose,
}: TermsModalProps): React.ReactNode {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={clsx(
          'relative w-full max-w-lg rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl',
          'max-h-[90vh] overflow-y-auto',
          'animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
          'sm:slide-in-from-bottom-0'
        )}
        role="document"
      >
        {/* ヘッダー */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4">
          <h2 id={titleId} className="text-lg font-bold text-gray-900">
            利用規約
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            aria-label="閉じる"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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

        {/* コンテンツ */}
        <div className="space-y-6 p-4 text-sm leading-relaxed text-gray-700">
          <TermsSection title="第1条（サービス概要）">
            <p>
              本サービス「鳴門市避難所マップ」（以下「本サービス」）は、
              徳島県鳴門市内の避難所情報を地図上で提供するウェブアプリケーションです。
              オフライン環境でも避難所を確認できるよう、PWA（Progressive Web
              App）として提供しています。
            </p>
          </TermsSection>

          <TermsSection title="第2条（免責事項）">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                本サービスで提供する避難所情報は、公開データに基づいていますが、
                情報の正確性・完全性・最新性を保証するものではありません。
              </li>
              <li>
                災害時の避難判断は、自治体の公式発表や現地の状況を優先してください。
                本サービスの情報のみに基づく判断によって生じた損害について、
                運営者は一切の責任を負いません。
              </li>
              <li>
                避難所の開設状況・収容状況は災害の種類や規模により変動します。
                実際の受入れ可否は現地で確認してください。
              </li>
              <li>
                本サービスの利用に起因する直接的・間接的な損害について、
                運営者は法令に反しない範囲で責任を負わないものとします。
              </li>
            </ol>
          </TermsSection>

          <TermsSection title="第3条（位置情報の取り扱い）">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                本サービスは、最寄りの避難所を表示するために端末の位置情報を利用する場合があります。
              </li>
              <li>
                位置情報の利用はブラウザの許可設定に基づき、ユーザーの同意なく取得することはありません。
              </li>
              <li>
                取得した位置情報は端末内でのみ処理され、外部サーバーに送信・保存されることはありません。
              </li>
            </ol>
          </TermsSection>

          <TermsSection title="第4条（知的財産権）">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                本サービスのソースコードはオープンソースとして公開されています。
                ライセンスの詳細はリポジトリをご確認ください。
              </li>
              <li>
                地図データは OpenStreetMap
                およびその他の地図タイルプロバイダーの
                著作権・利用規約に従います。
              </li>
              <li>
                避難所データの著作権は、データ提供元の各機関に帰属します。
              </li>
            </ol>
          </TermsSection>

          <TermsSection title="第5条（禁止事項）">
            <p>本サービスの利用にあたり、以下の行為を禁止します。</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>本サービスに過度な負荷をかける行為</li>
              <li>不正アクセスやシステムへの攻撃</li>
              <li>本サービスの情報を改ざんして再配布する行為</li>
              <li>その他、運営者が不適切と判断する行為</li>
            </ul>
          </TermsSection>

          <TermsSection title="第6条（規約の変更）">
            <p>
              運営者は、必要に応じて本規約を変更できるものとします。
              変更後の規約は本サービス上に掲載した時点で効力を生じます。
              重要な変更がある場合は、本サービス上で通知します。
            </p>
          </TermsSection>

          <section className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500">制定日: 2026年2月20日</p>
          </section>
        </div>
      </div>
    </div>
  );
}

function TermsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-gray-900">{title}</h3>
      {children}
    </section>
  );
}
