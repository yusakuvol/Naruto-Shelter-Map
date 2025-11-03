import type { SVGProps } from 'react';

interface CompassArrowProps extends SVGProps<SVGSVGElement> {
  /** 回転角度（度数、0-360） */
  rotation: number;
  /** アイコンのサイズ（デフォルト: 16px） */
  size?: number;
}

/**
 * コンパス矢印アイコン
 *
 * 指定された角度に回転する矢印を表示します。
 * 北が0度で時計回りに角度が増加します。
 *
 * @example
 * ```tsx
 * // 北東（45度）を指す矢印
 * <CompassArrow rotation={45} />
 *
 * // 大きいサイズで南（180度）を指す矢印
 * <CompassArrow rotation={180} size={24} />
 * ```
 */
export function CompassArrow({
  rotation,
  size = 16,
  className,
  ...props
}: CompassArrowProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${rotation}deg)` }}
      className={className}
      {...props}
    >
      {/* 矢印の先端部分（北を指す） */}
      <path
        d="M12 2L8 10H16L12 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 矢印の軸 */}
      <path
        d="M12 10V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 南側の小さなマーカー */}
      <circle cx="12" cy="20" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
