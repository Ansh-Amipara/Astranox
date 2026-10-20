import React from 'react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { TrainerSaveDto } from '@astranox/types';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trainerSave?: TrainerSaveDto;
  isPending: boolean;
  onUseItem: (itemId: string) => void;
}

export const BagSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  trainerSave,
  isPending,
  onUseItem,
}) => {
  const balls = (trainerSave?.inventory || []).filter(
    (inv) => inv.itemId.endsWith('ball') && inv.quantity > 0
  );

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader className="flex justify-between items-center bg-surface border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-base sm:text-lg font-bold uppercase tracking-wider text-foreground">
            Trainer Bag
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag dialog"
            className="w-10 h-10 -mr-2 flex items-center justify-center text-muted hover:text-foreground active:bg-surface-raised rounded-xl transition-colors touch-manipulation select-none"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[65dvh]">
          {balls.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {balls.map((inv) => {
                const itemName = (inv.item?.name || inv.itemId).replace(/-/g, ' ');
                return (
                  <button
                    key={inv.itemId}
                    type="button"
                    onClick={() => {
                      onUseItem(inv.itemId);
                      onClose();
                    }}
                    disabled={isPending}
                    className="bg-surface hover:bg-surface-raised active:bg-surface-raised text-foreground flex items-center gap-3 p-3 min-h-[52px] rounded-2xl border border-border shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 touch-manipulation select-none"
                  >
                    {inv.item?.spriteUrl && (
                      <img
                        src={inv.item.spriteUrl}
                        alt=""
                        aria-hidden="true"
                        className="w-10 h-10 object-contain drop-shadow-xs shrink-0"
                      />
                    )}
                    <div className="flex flex-col items-start min-w-0">
                      <span className="font-bold text-sm sm:text-base text-foreground capitalize truncate">
                        {itemName}
                      </span>
                      <span className="text-xs font-bold text-muted">
                        x{inv.quantity}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <p className="text-sm sm:text-base text-muted font-bold">
                You have no Pokéballs in your bag.
              </p>
              <p className="text-xs text-subtle mt-1">
                Visit the Pokémart to restock your capture supplies.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </DialogRoot>
  );
};
