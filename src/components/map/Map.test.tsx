// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ShelterFeature } from '@/types/shelter';
import { ShelterMap } from './Map';

const mockFlyTo = vi.fn();
const mockGetZoom = vi.fn(() => 12);

vi.mock('react-map-gl/maplibre', () => {
  const MapGL = ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <div data-testid="map-gl">{children}</div>;
  const Marker = ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }): React.ReactElement => (
    <button type="button" data-testid="marker" onClick={onClick}>
      {children}
    </button>
  );
  const NavigationControl = (): null => null;
  const Popup = ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <div data-testid="popup">{children}</div>;
  const useMap = (): {
    current: { flyTo: typeof mockFlyTo; getZoom: typeof mockGetZoom };
  } => ({
    current: { flyTo: mockFlyTo, getZoom: mockGetZoom },
  });

  return { default: MapGL, MapGL, Marker, NavigationControl, Popup, useMap };
});

vi.mock('./ShelterPinMarker', () => ({
  ShelterPinMarker: ({
    shelter,
  }: {
    shelter: ShelterFeature;
  }): React.ReactElement => (
    <div data-testid={`pin-${shelter.properties.id}`}>
      {shelter.properties.name}
    </div>
  ),
}));

vi.mock('./ShelterPopup', () => ({
  ShelterPopup: ({
    shelter,
    onClose,
  }: {
    shelter: ShelterFeature;
    onClose: () => void;
  }): React.ReactElement => (
    <div data-testid="shelter-popup">
      <span>{shelter.properties.name}</span>
      <button type="button" onClick={onClose}>
        close
      </button>
    </div>
  ),
}));

vi.mock('./CurrentLocationButton', () => ({
  CurrentLocationButton: ({
    onClick,
  }: {
    onClick: () => void;
  }): React.ReactElement => (
    <button type="button" data-testid="location-btn" onClick={onClick}>
      現在地
    </button>
  ),
}));

vi.mock('./FilterButton', () => ({
  FilterButton: (): React.ReactElement => <div data-testid="filter-btn" />,
}));

vi.mock('@/components/ai/AISuggestionBanner', () => ({
  AISuggestionBanner: (): null => null,
}));

vi.mock('@/components/chat/ChatFab', () => ({
  ChatFab: ({ onClick }: { onClick: () => void }): React.ReactElement => (
    <button type="button" data-testid="chat-fab" onClick={onClick}>
      Chat
    </button>
  ),
}));

vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

function makeShelter(id: string, name: string): ShelterFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [134.5, 34.1] },
    properties: {
      id,
      name,
      type: '指定避難所',
      address: '徳島県鳴門市',
      disasterTypes: ['洪水'],
      source: '国土地理院',
      updatedAt: '2026-01-01',
    },
  };
}

describe('ShelterMap', () => {
  it('避難所マーカーをレンダリングする', () => {
    const shelters = [makeShelter('s1', 'A'), makeShelter('s2', 'B')];
    render(<ShelterMap shelters={shelters} />);
    expect(screen.getByTestId('pin-s1')).toBeInTheDocument();
    expect(screen.getByTestId('pin-s2')).toBeInTheDocument();
  });

  it('マーカークリックで onShelterSelect が呼ばれる', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ShelterMap
        shelters={[makeShelter('s1', 'A')]}
        onShelterSelect={onSelect}
      />
    );
    await user.click(screen.getByTestId('pin-s1'));
    expect(onSelect).toHaveBeenCalledWith('s1');
  });

  it('selectedShelterId があるときポップアップを表示する', () => {
    render(
      <ShelterMap shelters={[makeShelter('s1', 'A')]} selectedShelterId="s1" />
    );
    const popup = screen.getByTestId('shelter-popup');
    expect(popup).toBeInTheDocument();
    expect(popup).toHaveTextContent('A');
  });

  it('現在地ボタンクリックで onGetCurrentPosition が呼ばれる', async () => {
    const user = userEvent.setup();
    const onGetPos = vi.fn();
    render(<ShelterMap shelters={[]} onGetCurrentPosition={onGetPos} />);
    const buttons = screen.getAllByTestId('location-btn');
    await user.click(buttons[0] as HTMLElement);
    expect(onGetPos).toHaveBeenCalledOnce();
  });

  it('position があるとき現在地マーカーを表示する', () => {
    render(
      <ShelterMap
        shelters={[]}
        position={{ latitude: 34.1, longitude: 134.5 }}
      />
    );
    expect(screen.getByLabelText('現在地')).toBeInTheDocument();
  });

  it('position がないとき現在地マーカーを表示しない', () => {
    render(<ShelterMap shelters={[]} />);
    expect(screen.queryByLabelText('現在地')).not.toBeInTheDocument();
  });

  it('onRefresh があるとき更新ボタンを表示する', () => {
    render(<ShelterMap shelters={[]} onRefresh={vi.fn()} />);
    expect(
      screen.getByLabelText('避難所データを最新に更新')
    ).toBeInTheDocument();
  });

  it('更新ボタンクリックで onRefresh が呼ばれる', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    render(<ShelterMap shelters={[]} onRefresh={onRefresh} />);
    await user.click(screen.getByLabelText('避難所データを最新に更新'));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('onShowTerms があるとき利用規約ボタンを表示する', () => {
    render(<ShelterMap shelters={[]} onShowTerms={vi.fn()} />);
    expect(screen.getByLabelText('利用規約を表示')).toBeInTheDocument();
  });

  it('onOpenChat があるとき ChatFab を表示する', () => {
    render(<ShelterMap shelters={[]} onOpenChat={vi.fn()} />);
    expect(screen.getByTestId('chat-fab')).toBeInTheDocument();
  });

  it('スクリーンリーダー用のステータスが存在する', () => {
    render(<ShelterMap shelters={[]} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
