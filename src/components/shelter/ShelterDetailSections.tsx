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
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <svg
          className="h-5 w-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        設備情報
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {facilities.toilet && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 5h2v9H5zm7 0h-1v9h1zm4 0h-2v9h2zM8 20c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
            </svg>
            トイレ
          </div>
        )}
        {facilities.water && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            水道
          </div>
        )}
        {facilities.electricity && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M7 2v11h3v9l7-12h-4l4-8z" />
            </svg>
            電気
          </div>
        )}
        {facilities.heating && (
          <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-900">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M11.71 19.29l-1.42 1.42a1 1 0 01-1.42 0l-1.42-1.42a1 1 0 010-1.42l1.42-1.42 1.42 1.42a1 1 0 010 1.42zm-4.95-4.95L5.34 12.92a1 1 0 010-1.42l1.42-1.42a1 1 0 011.42 0l1.42 1.42-1.42 1.42a1 1 0 01-1.42 0zm11.48 0l-1.42-1.42 1.42-1.42a1 1 0 011.42 0l1.42 1.42a1 1 0 010 1.42l-1.42 1.42a1 1 0 01-1.42 0zm-4.95-4.95l-1.42-1.42 1.42-1.42a1 1 0 011.42 0l1.42 1.42a1 1 0 010 1.42l-1.42 1.42a1 1 0 01-1.42 0zM12 10a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            暖房
          </div>
        )}
        {facilities.airConditioning && (
          <div className="flex items-center gap-2 rounded-lg bg-cyan-50 px-3 py-2 text-sm text-cyan-900">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z" />
            </svg>
            冷房
          </div>
        )}
        {facilities.wifi && (
          <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-sm text-purple-900">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
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
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <svg
          className="h-5 w-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        バリアフリー情報
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {accessibility.wheelchairAccessible && (
          <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v3h5v5h2V9z" />
            </svg>
            車椅子対応
          </div>
        )}
        {accessibility.elevator && (
          <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7.5 15c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1-4.5h-2v-5h2v5zm1-8h-4V4h4v1.5z" />
            </svg>
            エレベーター
          </div>
        )}
        {accessibility.multipurposeToilet && (
          <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 5h2v9H5zm7 0h-1v9h1zm4 0h-2v9h2zM8 20c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
            </svg>
            多目的トイレ
          </div>
        )}
        {accessibility.brailleBlocks && (
          <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
            点字ブロック
          </div>
        )}
        {accessibility.signLanguageSupport && (
          <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z" />
            </svg>
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
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <svg
          className="h-5 w-5 text-gray-600"
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
        ペット同伴
      </h3>
      <div className="space-y-2">
        {pets.allowed ? (
          <div className="rounded-lg bg-green-50 px-3 py-2">
            <p className="flex items-center gap-2 text-sm font-medium text-green-900">
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
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
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
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
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <svg
          className="h-5 w-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        開設状況
      </h3>
      <div className="space-y-2">
        {operationStatus.isOpen ? (
          <div className="rounded-lg bg-green-50 px-3 py-2">
            <p className="flex items-center gap-2 text-sm font-medium text-green-900">
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
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
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
              閉鎖中
            </p>
            {operationStatus.lastUpdated && (
              <p className="mt-1 text-sm text-gray-800">
                最終更新: {operationStatus.lastUpdated}
              </p>
            )}
            {operationStatus.notes && (
              <p className="mt-1 text-sm text-gray-800">
                {operationStatus.notes}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
