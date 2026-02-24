import {
  AlertTriangleIcon,
  CheckIcon,
  CopyIcon,
  HeartIcon,
  LocateIcon,
  MapIcon,
  MapPinIcon,
  PhoneIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import type { Coordinates } from '@/lib/geo';
import { formatDistance } from '@/lib/geo';
import { generateNavigationURL } from '@/lib/navigation';
import type { ShelterFeature } from '@/types/shelter';
import {
  AccessibilitySection,
  FacilitiesSection,
  OperationStatusSection,
  PetSection,
} from './ShelterDetailSections';

interface ShelterDetailModalProps {
  shelter: ShelterFeature;
  isOpen: boolean;
  onClose: () => void;
  distance?: number | null | undefined;
  userPosition?: Coordinates | null | undefined;
  isFavorite?: boolean;
  onToggleFavorite?: ((id: string) => void) | undefined;
}

export function ShelterDetailModal({
  shelter,
  isOpen,
  onClose,
  distance,
  isFavorite = false,
  onToggleFavorite,
}: ShelterDetailModalProps): React.ReactNode {
  const { name, address, disasterTypes, capacity, contact, id } =
    shelter.properties;
  const { state: copyState, copy: copyAddress } = useCopyToClipboard();

  const [lng, lat] = shelter.geometry.coordinates;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="bottom-0 left-0 right-0 top-auto max-h-[90vh] w-full max-w-lg translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-t-2xl border-0 p-0 shadow-2xl sm:bottom-auto sm:left-[50%] sm:right-auto sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl"
      >
        {/* ヘッダー */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-2xl border-b border-border bg-card p-4">
          <div className="flex-1">
            <DialogTitle className="text-lg font-bold text-foreground leading-tight">
              {name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {name}の避難所詳細情報
            </DialogDescription>
          </div>

          {/* お気に入り + 閉じるボタン */}
          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(id)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                aria-label={
                  isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'
                }
              >
                <HeartIcon
                  className={`h-6 w-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground/70'}`}
                  aria-hidden="true"
                />
              </button>
            )}
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 rounded-full"
                aria-label="閉じる"
              >
                <XIcon className="size-6" aria-hidden="true" />
              </Button>
            </DialogClose>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-4">
          {/* 住所 */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
              <MapPinIcon
                className="h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
              所在地
            </h3>
            <button
              type="button"
              onClick={() => copyAddress(address)}
              className="group flex items-center gap-2 text-sm text-foreground/80 hover:text-primary transition-colors rounded focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              aria-label={`住所をコピー: ${address}`}
            >
              <span>{address}</span>
              {copyState === 'copied' ? (
                <CheckIcon
                  className="h-4 w-4 shrink-0 text-green-500"
                  aria-hidden="true"
                />
              ) : (
                <CopyIcon
                  className="h-4 w-4 shrink-0 text-muted-foreground/70 group-hover:text-primary transition-colors"
                  aria-hidden="true"
                />
              )}
            </button>
          </section>

          {/* 距離（ある場合のみ） */}
          {distance !== null && distance !== undefined && (
            <section className="rounded-lg bg-primary/10 p-3">
              <p className="flex items-center gap-2 text-sm text-primary">
                <LocateIcon className="h-5 w-5" aria-hidden="true" />
                <span className="font-medium">
                  現在地から {formatDistance(distance)}
                </span>
              </p>
            </section>
          )}

          {/* 災害種別 */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
              <AlertTriangleIcon
                className="h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
              対応災害種別
            </h3>
            <div className="flex flex-wrap gap-2">
              {disasterTypes.map((disasterType) => (
                <Badge
                  key={disasterType}
                  variant="outline"
                  className="bg-orange-50 text-orange-900 border-orange-200"
                >
                  {disasterType}
                </Badge>
              ))}
            </div>
          </section>

          {/* 収容人数（ある場合のみ） */}
          {capacity && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
                <UsersIcon
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                />
                収容人数
              </h3>
              <p className="text-sm text-foreground/80">{capacity}人</p>
            </section>
          )}

          {/* 連絡先（ある場合のみ） */}
          {contact && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
                <PhoneIcon
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                />
                連絡先
              </h3>
              <a
                href={`tel:${contact}`}
                className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded"
              >
                {contact}
              </a>
            </section>
          )}

          {shelter.properties.facilities && (
            <FacilitiesSection facilities={shelter.properties.facilities} />
          )}

          {shelter.properties.accessibility && (
            <AccessibilitySection
              accessibility={shelter.properties.accessibility}
            />
          )}

          {shelter.properties.pets && (
            <PetSection pets={shelter.properties.pets} />
          )}

          {shelter.properties.operationStatus && (
            <OperationStatusSection
              operationStatus={shelter.properties.operationStatus}
            />
          )}

          {/* データソース */}
          <section className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              データ提供: {shelter.properties.source}
              <br />
              更新日: {shelter.properties.updatedAt}
            </p>
          </section>
        </div>

        {/* フッター: アクションボタン */}
        <div className="sticky bottom-0 border-t border-border bg-card p-4">
          <Button
            className="w-full py-3"
            size="lg"
            onClick={() => {
              const url = generateNavigationURL(
                { latitude: lat, longitude: lng },
                undefined,
                'walking'
              );
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
          >
            <MapIcon className="size-5" aria-hidden="true" />
            経路案内を表示
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
