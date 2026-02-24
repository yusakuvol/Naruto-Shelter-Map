import { cn } from '@/lib/utils';
import type { ShelterFeature } from '@/types/shelter';

interface ShelterCardBadgesProps {
  shelter: ShelterFeature;
}

export function ShelterCardBadges({
  shelter,
}: ShelterCardBadgesProps): React.JSX.Element | null {
  const { facilities, accessibility, pets } = shelter.properties;
  const hasAny =
    facilities?.toilet ||
    facilities?.water ||
    facilities?.electricity ||
    accessibility?.wheelchairAccessible ||
    pets;

  if (!hasAny) return null;

  return (
    <>
      {facilities && (
        <>
          {facilities.toilet && (
            <span
              className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700"
              title="トイレあり"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 5h2v9H5zm7 0h-1v9h1zm4 0h-2v9h2zM8 20c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
              </svg>
              <span className="sr-only">トイレあり</span>
            </span>
          )}
          {facilities.water && (
            <span
              className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
              title="水道あり"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
              <span className="sr-only">水道あり</span>
            </span>
          )}
          {facilities.electricity && (
            <span
              className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700"
              title="電気あり"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M7 2v11h3v9l7-12h-4l4-8z" />
              </svg>
              <span className="sr-only">電気あり</span>
            </span>
          )}
        </>
      )}

      {accessibility?.wheelchairAccessible && (
        <span
          className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
          title="車椅子対応"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v3h5v5h2V9z" />
          </svg>
          <span className="sr-only">車椅子対応</span>
        </span>
      )}

      {pets && (
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
            pets.allowed
              ? 'bg-green-50 text-green-700'
              : 'bg-gray-50 text-gray-500'
          )}
          title={pets.allowed ? 'ペット同伴可' : 'ペット同伴不可'}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="sr-only">
            {pets.allowed ? 'ペット同伴可' : 'ペット同伴不可'}
          </span>
        </span>
      )}
    </>
  );
}
