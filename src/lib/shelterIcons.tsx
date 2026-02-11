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
 * 指定避難所アイコン（JIS 6.1.5 避難所（建物））
 * 図材: 屋根のある施設及び施設に逃げ込む人の姿
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
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
    {...props}
  >
    {/* 建物（屋根＋本体） */}
    <path d="M12 4L5 11v9h14V11L12 4z" />
    {/* 入口（開いたドア） */}
    <path d="M11 20V14h2v6" />
    {/* 逃げ込む人（頭部） */}
    <circle cx="12" cy="13" r="1.5" fill="currentColor" />
  </svg>
);

/**
 * 緊急避難場所アイコン（JIS 6.1.4 広域避難場所に準拠）
 * 図材: 走る人の姿及び場所を示すだ円
 */
export const EmergencyShelterIcon: FC<ShelterIconProps> = ({
  className = 'h-4 w-4',
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
    {...props}
  >
    {/* だ円（場所） */}
    <ellipse cx="12" cy="12" rx="9" ry="6" />
    {/* 走る人（頭・腕・脚） */}
    <circle cx="12" cy="9" r="1.8" fill="currentColor" />
    <path d="M12 11v2M11 13l-1.5 3M13 13l1.5 3" />
    <path d="M10 11l-2 1M14 11l2 1" />
  </svg>
);

/**
 * 両方（指定避難所 + 緊急避難場所）アイコン（JIS 避難所＋両方である印）
 * 図材: 建物＋人＋「両方」を示す＋
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
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
    {...props}
  >
    {/* 建物＋人（指定避難所と同じベース） */}
    <path d="M12 4L5 11v9h14V11L12 4z" />
    <path d="M11 20V14h2v6" />
    <circle cx="12" cy="13" r="1.5" fill="currentColor" />
    {/* 両方であることを示す＋（右上） */}
    <path d="M17 6h2M18 5v2" strokeWidth="2.5" />
  </svg>
);

/**
 * 避難所タイプに応じたアイコンを返すヘルパー関数
 * JIS 避難誘導図記号に準拠したアイコンで種別を識別可能に
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
