import {
  AccessibilityIcon,
  Building2Icon,
  CheckIcon,
  ClockIcon,
  DropletIcon,
  EyeIcon,
  FlameIcon,
  HandIcon,
  PawPrintIcon,
  SnowflakeIcon,
  UserIcon,
  WifiIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';
import type {
  Accessibility,
  Facilities,
  OperationStatus,
  PetPolicy,
} from '@/types/shelter';

export function FacilitiesSection({
  facilities,
}: {
  facilities: Facilities;
}): React.JSX.Element {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
        <Building2Icon
          className="h-5 w-5 text-muted-foreground"
          aria-hidden="true"
        />
        設備情報
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {facilities.toilet && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900">
            <ToiletIcon className="h-4 w-4" aria-hidden="true" />
            トイレ
          </div>
        )}
        {facilities.water && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900">
            <DropletIcon className="h-4 w-4" aria-hidden="true" />
            水道
          </div>
        )}
        {facilities.electricity && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
            <ZapIcon className="h-4 w-4" aria-hidden="true" />
            電気
          </div>
        )}
        {facilities.heating && (
          <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-900">
            <FlameIcon className="h-4 w-4" aria-hidden="true" />
            暖房
          </div>
        )}
        {facilities.airConditioning && (
          <div className="flex items-center gap-2 rounded-lg bg-cyan-50 px-3 py-2 text-sm text-cyan-900">
            <SnowflakeIcon className="h-4 w-4" aria-hidden="true" />
            冷房
          </div>
        )}
        {facilities.wifi && (
          <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-sm text-purple-900">
            <WifiIcon className="h-4 w-4" aria-hidden="true" />
            Wi-Fi
          </div>
        )}
      </div>
    </section>
  );
}

export function AccessibilitySection({
  accessibility,
}: {
  accessibility: Accessibility;
}): React.JSX.Element {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
        <UserIcon
          className="h-5 w-5 text-muted-foreground"
          aria-hidden="true"
        />
        バリアフリー情報
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {accessibility.wheelchairAccessible && (
          <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
            <AccessibilityIcon className="h-4 w-4" aria-hidden="true" />
            車椅子対応
          </div>
        )}
        {accessibility.elevator && (
          <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
            <ElevatorIcon className="h-4 w-4" aria-hidden="true" />
            エレベーター
          </div>
        )}
        {accessibility.multipurposeToilet && (
          <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
            <ToiletIcon className="h-4 w-4" aria-hidden="true" />
            多目的トイレ
          </div>
        )}
        {accessibility.brailleBlocks && (
          <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
            <EyeIcon className="h-4 w-4" aria-hidden="true" />
            点字ブロック
          </div>
        )}
        {accessibility.signLanguageSupport && (
          <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
            <HandIcon className="h-4 w-4" aria-hidden="true" />
            手話対応
          </div>
        )}
      </div>
    </section>
  );
}

export function PetSection({ pets }: { pets: PetPolicy }): React.JSX.Element {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
        <PawPrintIcon
          className="h-5 w-5 text-muted-foreground"
          aria-hidden="true"
        />
        ペット同伴
      </h3>
      <div className="space-y-2">
        {pets.allowed ? (
          <div className="rounded-lg bg-green-50 px-3 py-2">
            <p className="flex items-center gap-2 text-sm font-medium text-green-900">
              <CheckIcon className="h-4 w-4" aria-hidden="true" />
              ペット同伴可
            </p>
            {pets.separateArea && (
              <p className="mt-1 text-sm text-green-800">専用スペースあり</p>
            )}
            {pets.notes && (
              <p className="mt-1 text-sm text-green-800">{pets.notes}</p>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-red-50 px-3 py-2">
            <p className="flex items-center gap-2 text-sm font-medium text-red-900">
              <XIcon className="h-4 w-4" aria-hidden="true" />
              ペット同伴不可
            </p>
            {pets.notes && (
              <p className="mt-1 text-sm text-red-800">{pets.notes}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function OperationStatusSection({
  operationStatus,
}: {
  operationStatus: OperationStatus;
}): React.JSX.Element {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
        <ClockIcon
          className="h-5 w-5 text-muted-foreground"
          aria-hidden="true"
        />
        開設状況
      </h3>
      <div className="space-y-2">
        {operationStatus.isOpen ? (
          <div className="rounded-lg bg-green-50 px-3 py-2">
            <p className="flex items-center gap-2 text-sm font-medium text-green-900">
              <CheckIcon className="h-4 w-4" aria-hidden="true" />
              開設中
            </p>
            {operationStatus.lastUpdated && (
              <p className="mt-1 text-sm text-green-800">
                最終更新: {operationStatus.lastUpdated}
              </p>
            )}
            {operationStatus.notes && (
              <p className="mt-1 text-sm text-green-800">
                {operationStatus.notes}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-muted px-3 py-2">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <XIcon className="h-4 w-4" aria-hidden="true" />
              閉鎖中
            </p>
            {operationStatus.lastUpdated && (
              <p className="mt-1 text-sm text-foreground/80">
                最終更新: {operationStatus.lastUpdated}
              </p>
            )}
            {operationStatus.notes && (
              <p className="mt-1 text-sm text-foreground/80">
                {operationStatus.notes}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
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

/** エレベーターアイコン（lucide に適切な代替がないため独自SVG） */
function ElevatorIcon({
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
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7.5 15c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1-4.5h-2v-5h2v5zm1-8h-4V4h4v1.5z" />
    </svg>
  );
}
