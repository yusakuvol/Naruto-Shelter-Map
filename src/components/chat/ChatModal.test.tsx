// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ShelterFeature } from '@/types/shelter';
import { ChatModal } from './ChatModal';

vi.mock('./ChatPanel', () => ({
  ChatPanel: () => <div data-testid="chat-panel">ChatPanel</div>,
}));

function makeShelter(): ShelterFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [134.5, 34.1] },
    properties: {
      id: 's1',
      name: 'テスト避難所',
      type: '指定避難所',
      address: '徳島県鳴門市',
      disasterTypes: ['洪水'],
      source: '国土地理院',
      updatedAt: '2026-01-01',
    },
  };
}

describe('ChatModal', () => {
  it('isOpen=true のとき表示される', () => {
    render(
      <ChatModal
        isOpen={true}
        onClose={vi.fn()}
        shelters={[makeShelter()]}
        userPosition={null}
      />
    );
    expect(screen.getByText('避難所について質問')).toBeInTheDocument();
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
  });

  it('isOpen=false のとき表示されない', () => {
    render(
      <ChatModal
        isOpen={false}
        onClose={vi.fn()}
        shelters={[]}
        userPosition={null}
      />
    );
    expect(screen.queryByText('避難所について質問')).not.toBeInTheDocument();
  });

  it('閉じるボタンで onClose が呼ばれる', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ChatModal
        isOpen={true}
        onClose={onClose}
        shelters={[]}
        userPosition={null}
      />
    );
    await user.click(screen.getByLabelText('閉じる'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
