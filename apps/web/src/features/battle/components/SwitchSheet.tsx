import React from 'react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { HealthBar } from './HealthBar';
import { getSpriteUrl, getTypeSpriteUrl } from '@/lib/axios';
import { OwnedPokemonDto } from '@astranox/types';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playerPartyData: (OwnedPokemonDto & { currentHp: number; maxHp: number; name?: string })[];
  activePokemonId: string;
  isWaitingSwitch: boolean;
  isPending: boolean;
  onSwitch: (id: string) => void;
  showToast: (msg: string) => void;
}

export const SwitchSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  playerPartyData,
  activePokemonId,
  isWaitingSwitch,
  isPending,
  onSwitch,
  showToast,
}) => {
  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isWaitingSwitch) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader className="flex justify-between items-center bg-surface border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-base sm:text-lg font-bold uppercase tracking-wider text-foreground">
            {isWaitingSwitch ? 'Choose Next Pokémon' : 'Switch Pokémon'}
          </DialogTitle>
          {!isWaitingSwitch && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close switch dialog"
              className="w-10 h-10 -mr-2 flex items-center justify-center text-muted hover:text-foreground active:bg-surface-raised rounded-xl transition-colors touch-manipulation select-none"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </DialogHeader>

        <div className="p-3 sm:p-5 overflow-y-auto max-h-[65dvh] flex flex-col gap-2.5">
          {playerPartyData.map((p) => {
            const isActive = p.id === activePokemonId;
            const isFainted = p.currentHp <= 0;
            const isDisabled = isPending || isActive || isFainted;
            const monName = p.name || p.speciesName || (p.species as any)?.name || 'Pokémon';
            const speciesId = p.species?.id || p.speciesId;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (isActive) {
                    showToast(`${monName} is already in battle!`);
                    return;
                  }
                  if (isFainted) {
                    showToast(`${monName} has fainted and cannot battle!`);
                    return;
                  }
                  onSwitch(p.id);
                  onClose();
                }}
                disabled={isDisabled}
                className={`w-full p-3 rounded-2xl border transition-all text-left flex items-center gap-3 touch-manipulation select-none min-h-[64px] ${
                  isActive
                    ? 'bg-surface-raised border-border opacity-70 cursor-not-allowed'
                    : isFainted
                    ? 'bg-surface border-health-low/50 opacity-60 cursor-not-allowed'
                    : 'bg-surface hover:bg-surface-raised active:bg-surface-raised border-border hover:border-foreground/30 shadow-xs hover:shadow-md hover:-translate-y-0.5'
                }`}
                aria-label={`Select ${monName}, Level ${p.level}, ${p.currentHp} of ${p.maxHp} HP${
                  isActive ? ' (Currently in battle)' : isFainted ? ' (Fainted)' : ''
                }`}
              >
                {/* Sprite */}
                <img
                  src={getSpriteUrl(speciesId)}
                  alt=""
                  aria-hidden="true"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-xs shrink-0"
                  style={{ imageRendering: 'pixelated' }}
                />

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-sm sm:text-base capitalize text-foreground truncate">
                        {monName}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 bg-primary text-primary-foreground rounded shrink-0">
                          In Battle
                        </span>
                      )}
                      {isFainted && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 bg-health-low text-danger-foreground border border-health-low rounded shrink-0">
                          Fainted
                        </span>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-muted shrink-0">
                      Lv {p.level}
                    </span>
                  </div>

                  {/* Types */}
                  {p.types && p.types.length > 0 && (
                    <div className="flex gap-1" aria-hidden="true">
                      {p.types.map((type: string) => (
                        <img
                          key={type}
                          src={getTypeSpriteUrl(type, true)}
                          alt=""
                          className="h-3.5 w-auto object-contain"
                        />
                      ))}
                    </div>
                  )}

                  {/* HP Bar */}
                  <div className="w-full mt-0.5">
                    <HealthBar currentHp={p.currentHp} maxHp={p.maxHp} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </DialogRoot>
  );
};
