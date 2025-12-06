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
 * 指定避難所アイコン（家のアイコン）
 */
export const DesignatedShelterIcon: FC<ShelterIconProps> = ({
  className = 'h-4 w-4',
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
    {...props}
  >
    {/* 家のアイコン */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
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
 * 両方（指定避難所 + 緊急避難場所）アイコン（家+警告の組み合わせ）
 */
export const BothShelterIcon: FC<ShelterIconProps> = ({
  className = 'h-4 w-4',
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
    {...props}
  >
    {/* 家のアイコン（ベース） */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
    {/* 警告マーク（右上に小さく配置） */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      opacity="0.9"
      transform="translate(16, -2) scale(0.4)"
    />
  </svg>
);

/**
 * 避難所タイプに応じたアイコンを返すヘルパー関数
 * 緊急避難場所単独は存在しないため、すべて同じアイコンを使用
 */
export function getShelterIcon(
  type: string,
  props?: ShelterIconProps
): ReactElement {
  // 緊急避難場所単独は存在しないため、すべて建物アイコンを使用
  // 「両方」の場合のみ、警告マークを追加したアイコンを使用
  switch (type) {
    case '両方':
      return <BothShelterIcon {...props} />;
    default:
      return <DesignatedShelterIcon {...props} />;
  }
}
