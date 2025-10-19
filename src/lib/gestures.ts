import type { SheetState } from '@/components/mobile/BottomSheet';

/**
 * シートの高さをピクセル値に変換（2状態システム）
 */
export function getSheetHeight(
  state: SheetState,
  viewportHeight: number
): number {
  switch (state) {
    case 'minimized':
      return 80; // タブバーのみ表示
    case 'expanded':
      return viewportHeight * 0.9; // ほぼ全画面
    default:
      return 80;
  }
}

/**
 * ドラッグ終了時に最適な状態を計算（2状態システム）
 * @param currentY - 現在のY座標（画面下からの距離）
 * @param velocity - スワイプの速度（負=上向き、正=下向き）
 * @param viewportHeight - ビューポートの高さ
 */
export function calculateSnapPoint(
  currentY: number,
  velocity: number,
  viewportHeight: number
): SheetState {
  const velocityThreshold = 500; // px/s

  const minimizedHeight = getSheetHeight('minimized', viewportHeight);
  const expandedHeight = getSheetHeight('expanded', viewportHeight);

  // 勢いよく上スワイプ → 展開
  if (velocity < -velocityThreshold) {
    return 'expanded';
  }

  // 勢いよく下スワイプ → 最小化
  if (velocity > velocityThreshold) {
    return 'minimized';
  }

  // 速度が遅い場合は最も近い状態へスナップ
  const distanceToMinimized = Math.abs(currentY - minimizedHeight);
  const distanceToExpanded = Math.abs(currentY - expandedHeight);

  return distanceToMinimized < distanceToExpanded ? 'minimized' : 'expanded';
}

/**
 * ドラッグ制約を計算（シートが画面外に出ないように）
 */
export function getDragConstraints(viewportHeight: number): {
  top: number;
  bottom: number;
} {
  const expandedHeight = getSheetHeight('expanded', viewportHeight);
  const minimizedHeight = getSheetHeight('minimized', viewportHeight);

  return {
    top: -(expandedHeight - minimizedHeight), // 最大まで上に引っ張れる
    bottom: 0, // 下には引っ張れない（minimizedが最小）
  };
}
