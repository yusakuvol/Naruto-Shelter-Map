import { ListIcon } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Coordinates } from '@/lib/geo';
import type { ShelterFeature } from '@/types/shelter';

const ShelterListDrawer = lazy(() =>
  import('./ShelterListDrawer').then((module) => ({
    default: module.ShelterListDrawer,
  }))
);

export interface ShelterListButtonProps {
  shelters: ShelterFeature[];
  selectedShelterId?: string | null | undefined;
  position: Coordinates | null;
  onShelterSelect?: ((id: string | null) => void) | undefined;
  onShowDetail?: ((shelter: ShelterFeature) => void) | undefined;
}

/** モバイルのキーボード・スクリーンリーダー利用者向け避難所一覧 */
export function ShelterListButton(
  props: ShelterListButtonProps
): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="rounded-full bg-card shadow-lg hover:shadow-xl"
        aria-label="避難所一覧を表示"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <ListIcon className="size-4" aria-hidden="true" />
        <span>一覧</span>
      </Button>
      {isOpen && (
        <Suspense fallback={null}>
          <ShelterListDrawer
            {...props}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
          />
        </Suspense>
      )}
    </>
  );
}
