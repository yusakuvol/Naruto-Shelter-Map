import type { FC, ReactElement, SVGProps } from 'react';

/**
 * 避難所タイプ別アイコンコンポーネント
 *
 * WCAG 1.4.1 Use of Color (Level A) に対応
 * 色だけでなくアイコンでも避難所タイプを識別可能にする
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html
 */

interface ShelterIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * 指定避難所アイコン（家）
 */
export const DesignatedShelterIcon: FC<ShelterIconProps> = ({
  className = 'h-4 w-4',
  ...props
}) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
    {...props}
  >
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

/**
 * 緊急避難場所アイコン（警告）
 */
export const EmergencyShelterIcon: FC<ShelterIconProps> = ({
  className = 'h-4 w-4',
  ...props
}) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * 両方（指定避難所 + 緊急避難場所）アイコン（星）
 */
export const BothShelterIcon: FC<ShelterIconProps> = ({
  className = 'h-4 w-4',
  ...props
}) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
    {...props}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

/**
 * 避難所タイプに応じたアイコンを返すヘルパー関数
 */
export function getShelterIcon(
  type: string,
  props?: ShelterIconProps
): ReactElement {
  switch (type) {
    case '指定避難所':
      return <DesignatedShelterIcon {...props} />;
    case '緊急避難場所':
      return <EmergencyShelterIcon {...props} />;
    case '両方':
      return <BothShelterIcon {...props} />;
    default:
      return <DesignatedShelterIcon {...props} />;
  }
}
