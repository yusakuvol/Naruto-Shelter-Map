// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ShelterFeature } from '@/types/shelter';
import { ShelterDetailModal } from './ShelterDetailModal';

vi.mock('./ShelterDetailSections', () => ({
  FacilitiesSection: () => <div data-testid="facilities">Facilities</div>,
  AccessibilitySection: () => (
    <div data-testid="accessibility">Accessibility</div>
  ),
  PetSection: () => <div data-testid="pets">Pets</div>,
  OperationStatusSection: () => (
    <div data-testid="operation-status">OperationStatus</div>
  ),
}));

const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

function makeShelter(
  overrides: Partial<ShelterFeature['properties']> = {}
): ShelterFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [134.609, 34.173] },
    properties: {
      id: 's1',
      name: '鳴門市民会館',
      type: '指定避難所',
      address: '徳島県鳴門市撫養町南浜字東浜1-1',
      disasterTypes: ['洪水', '津波'],
      source: '国土地理院',
      updatedAt: '2026-01-01',
      ...overrides,
    },
  };
}

describe('ShelterDetailModal', () => {
  it('isOpen=true のとき避難所名を表示する', () => {
    render(
      <ShelterDetailModal
        shelter={makeShelter()}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('鳴門市民会館')).toBeInTheDocument();
  });

  it('isOpen=false のとき表示されない', () => {
    render(
      <ShelterDetailModal
        shelter={makeShelter()}
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByText('鳴門市民会館')).not.toBeInTheDocument();
  });

  it('住所・災害種別・データソースを表示する', () => {
    render(
      <ShelterDetailModal
        shelter={makeShelter()}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(
      screen.getByText('徳島県鳴門市撫養町南浜字東浜1-1')
    ).toBeInTheDocument();
    expect(screen.getByText('洪水')).toBeInTheDocument();
    expect(screen.getByText('津波')).toBeInTheDocument();
    expect(screen.getByText(/国土地理院/)).toBeInTheDocument();
  });

  it('収容人数がある場合のみ表示する', () => {
    render(
      <ShelterDetailModal
        shelter={makeShelter({ capacity: 500 })}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('500人')).toBeInTheDocument();
  });

  it('収容人数がない場合は表示しない', () => {
    render(
      <ShelterDetailModal
        shelter={makeShelter()}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByText('収容人数')).not.toBeInTheDocument();
  });

  it('連絡先がある場合のみ表示する', () => {
    render(
      <ShelterDetailModal
        shelter={makeShelter({ contact: '088-000-0000' })}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('088-000-0000')).toBeInTheDocument();
  });

  it('距離がある場合は所要時間を表示する', () => {
    render(
      <ShelterDetailModal
        shelter={makeShelter()}
        isOpen={true}
        onClose={vi.fn()}
        distance={1.5}
      />
    );
    expect(screen.getByText(/現在地から/)).toBeInTheDocument();
  });

  it('お気に入りボタンをクリックすると onToggleFavorite が呼ばれる', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <ShelterDetailModal
        shelter={makeShelter()}
        isOpen={true}
        onClose={vi.fn()}
        onToggleFavorite={onToggle}
      />
    );
    await user.click(screen.getByLabelText('お気に入りに追加'));
    expect(onToggle).toHaveBeenCalledWith('s1');
  });

  it('お気に入り状態のとき aria-label が変わる', () => {
    render(
      <ShelterDetailModal
        shelter={makeShelter()}
        isOpen={true}
        onClose={vi.fn()}
        isFavorite={true}
        onToggleFavorite={vi.fn()}
      />
    );
    expect(screen.getByLabelText('お気に入りから削除')).toBeInTheDocument();
  });

  it('経路案内ボタンで window.open が呼ばれる', async () => {
    const user = userEvent.setup();
    render(
      <ShelterDetailModal
        shelter={makeShelter()}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    await user.click(screen.getByText('経路案内を表示'));
    expect(windowOpenSpy).toHaveBeenCalledOnce();
    expect(windowOpenSpy.mock.calls[0]?.[0]).toContain('google.com/maps');
  });

  it('閉じるボタンで onClose が呼ばれる', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ShelterDetailModal
        shelter={makeShelter()}
        isOpen={true}
        onClose={onClose}
      />
    );
    await user.click(screen.getByLabelText('閉じる'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('facilities がある場合は FacilitiesSection を表示する', () => {
    const shelter = makeShelter();
    shelter.properties.facilities = { toilet: true };
    render(
      <ShelterDetailModal shelter={shelter} isOpen={true} onClose={vi.fn()} />
    );
    expect(screen.getByTestId('facilities')).toBeInTheDocument();
  });

  it('pets がある場合は PetSection を表示する', () => {
    const shelter = makeShelter();
    shelter.properties.pets = { allowed: true };
    render(
      <ShelterDetailModal shelter={shelter} isOpen={true} onClose={vi.fn()} />
    );
    expect(screen.getByTestId('pets')).toBeInTheDocument();
  });
});
