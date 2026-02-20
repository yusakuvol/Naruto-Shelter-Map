import type { FC, ReactElement, SVGProps } from 'react';

/**
 * 避難所タイプ別アイコンコンポーネント
 *
 * WCAG 1.4.1 Use of Color (Level A) に対応
 * 色だけでなくアイコンでも避難所タイプを識別可能にする
 * 塗りつぶし（fill-based）デザインで小サイズでも高い視認性を確保
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html
 */

interface ShelterIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * 指定避難所アイコン（建物）
 * 太い屋根＋四角の本体のシンプルな家形状
 */
export const DesignatedShelterIcon: FC<ShelterIconProps> = ({
  className = 'h-4 w-4',
  ...props
}) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M8 1.5L1.5 7H3v6.5h10V7h1.5L8 1.5zM7 11V9h2v2H7z" />
  </svg>
);

/**
 * 緊急避難場所アイコン（走る人）
 * 大きめの頭部＋太い四肢でダイナミックなポーズ
 */
export const EmergencyShelterIcon: FC<ShelterIconProps> = ({
  className = 'h-4 w-4',
  ...props
}) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <circle cx="11" cy="2.8" r="2" />
    <path
      d="M6.5 5.5l4 1v3l2.5 4M10.5 9.5L7 14M4.5 7.5l5-1"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/**
 * 両方（指定避難所＋緊急避難場所）アイコン（シールド/盾）
 * 「安全な場所」を直感的に伝え、他2つのアイコンと明確に区別
 */
export const BothShelterIcon: FC<ShelterIconProps> = ({
  className = 'h-4 w-4',
  ...props
}) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M8 0.5L2 3v4.5c0 3.8 2.6 7 6 8.5 3.4-1.5 6-4.7 6-8.5V3L8 0.5z" />
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
