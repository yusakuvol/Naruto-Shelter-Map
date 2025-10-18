import type { SheetState } from '@/components/mobile/BottomSheet';

/**
 * シートの高さをピクセル値に変換
 */
export function getSheetHeight(
  state: SheetState,
  viewportHeight: number
): number {
  switch (state) {
    case 'closed':
      return 60; // タブバーのみ
    case 'peek':
      return 120; // タブバー + カード1枚の上部がちらっと見える
    case 'half':
      return viewportHeight * 0.5; // 50vh
    case 'full':
      return viewportHeight * 0.9; // 90vh
    default:
      return 60;
  }
}

/**
 * ドラッグ終了時に最適な状態を計算
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

  const closedHeight = getSheetHeight('closed', viewportHeight);
  const peekHeight = getSheetHeight('peek', viewportHeight);
  const halfHeight = getSheetHeight('half', viewportHeight);
  const fullHeight = getSheetHeight('full', viewportHeight);

  // 勢いよく上スワイプ → 展開
  if (velocity < -velocityThreshold) {
    if (currentY < halfHeight) return 'full';
    if (currentY < peekHeight) return 'half';
    return 'peek';
  }

  // 勢いよく下スワイプ → 閉じる
  if (velocity > velocityThreshold) {
    if (currentY > halfHeight) return 'peek';
    if (currentY > peekHeight) return 'closed';
    return 'half';
  }

  // 速度が遅い場合は最も近い状態へスナップ
  const distanceToClosed = Math.abs(currentY - closedHeight);
  const distanceToPeek = Math.abs(currentY - peekHeight);
  const distanceToHalf = Math.abs(currentY - halfHeight);
  const distanceToFull = Math.abs(currentY - fullHeight);

  const minDistance = Math.min(
    distanceToClosed,
    distanceToPeek,
    distanceToHalf,
    distanceToFull
  );

  if (minDistance === distanceToClosed) return 'closed';
  if (minDistance === distanceToPeek) return 'peek';
  if (minDistance === distanceToFull) return 'full';
  return 'half';
}

/**
 * ドラッグ制約を計算（シートが画面外に出ないように）
 */
export function getDragConstraints(viewportHeight: number): {
  top: number;
  bottom: number;
} {
  const fullHeight = getSheetHeight('full', viewportHeight);
  const closedHeight = getSheetHeight('closed', viewportHeight);

  return {
    top: -(fullHeight - closedHeight), // 最大まで上に引っ張れる
    bottom: 0, // 下には引っ張れない（closedが最小）
  };
}
