import { useCallback, useMemo } from 'react';
import { ShelterList } from '@/components/shelter/ShelterList';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { calculateDistance, toCoordinates } from '@/lib/geo';
import type { ShelterFeature } from '@/types/shelter';
import type { ShelterListButtonProps } from './ShelterListButton';

interface ShelterListDrawerProps extends ShelterListButtonProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShelterListDrawer({
  shelters,
  selectedShelterId,
  position,
  onShelterSelect,
  onShowDetail,
  isOpen,
  onOpenChange,
}: ShelterListDrawerProps): React.JSX.Element {
  const listShelters = useMemo(
    () =>
      shelters.map((shelter) => ({
        shelter,
        distance: position
          ? calculateDistance(
              position,
              toCoordinates(shelter.geometry.coordinates)
            )
          : null,
      })),
    [shelters, position]
  );

  const handleSelect = useCallback(
    (id: string) => {
      onShelterSelect?.(id);
      onOpenChange(false);
    },
    [onOpenChange, onShelterSelect]
  );

  const handleShowDetail = useCallback(
    (shelter: ShelterFeature) => {
      onOpenChange(false);
      onShowDetail?.(shelter);
    },
    [onOpenChange, onShowDetail]
  );

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[min(78vh,42rem)]">
        <DrawerHeader className="text-left">
          <DrawerTitle>避難所一覧</DrawerTitle>
          <DrawerDescription>
            条件に一致する避難所が{listShelters.length}件あります
          </DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 border-t">
          <ShelterList
            shelters={listShelters}
            selectedShelterId={selectedShelterId}
            onShelterSelect={handleSelect}
            onShowDetail={handleShowDetail}
            userPosition={position}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
