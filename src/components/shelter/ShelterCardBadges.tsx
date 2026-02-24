import {
  AccessibilityIcon,
  DropletIcon,
  PawPrintIcon,
  ZapIcon,
} from 'lucide-react';
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
              <ToiletIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">トイレあり</span>
            </span>
          )}
          {facilities.water && (
            <span
              className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
              title="水道あり"
            >
              <DropletIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">水道あり</span>
            </span>
          )}
          {facilities.electricity && (
            <span
              className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700"
              title="電気あり"
            >
              <ZapIcon className="h-3.5 w-3.5" aria-hidden="true" />
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
          <AccessibilityIcon className="h-3.5 w-3.5" aria-hidden="true" />
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
          <PawPrintIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">
            {pets.allowed ? 'ペット同伴可' : 'ペット同伴不可'}
          </span>
        </span>
      )}
    </>
  );
}

/** トイレアイコン（lucide に適切な代替がないため独自SVG） */
function ToiletIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M5 5h2v9H5zm7 0h-1v9h1zm4 0h-2v9h2zM8 20c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
    </svg>
  );
}
