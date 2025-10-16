import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Testing Library のクリーンアップ
afterEach(() => {
  cleanup();
});

// カスタムマッチャー拡張（必要に応じて追加）
expect.extend({
  // 将来的にカスタムマッチャーを追加する場合はここに記述
});
