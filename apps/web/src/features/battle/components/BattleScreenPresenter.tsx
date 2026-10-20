import { useState } from 'react';
import { BattleStage } from '@/features/battle/components/BattleStage';
import { BattleControls } from '@/features/battle/components/BattleControls';
import { BattleLog } from '@/features/battle/components/BattleLog';
import { SwitchSheet } from '@/features/battle/components/SwitchSheet';
import { BagSheet } from '@/features/battle/components/BagSheet';
import { BattleResultModal } from '@/features/battle/components/BattleResultModal';
import { DialogRoot, DialogContent } from '@/components/ui/Dialog';
import { TrainerSaveDto, ActivePokemonDto, OwnedPokemonDto, TurnEventDto } from '@astranox/types';

export interface BattleScreenPresenterProps {
  menu: 'main' | 'fight' | 'bag' | 'party';
  setMenu: (m: 'main' | 'fight' | 'bag' | 'party') => void;
  toastMsg: string | null;
  showToast: (msg: string) => void;
  trainerSave: TrainerSaveDto;
  wild: ActivePokemonDto & { name?: string; speciesName?: string; isCorrupted?: boolean; statusAilment?: string };
  opponentPartyData: (OwnedPokemonDto & { currentHp: number; maxHp: number; name?: string })[];
  player: ActivePokemonDto & { name?: string; nickname?: string; speciesName?: string; statusAilment?: string };
  playerPartyData: (OwnedPokemonDto & { currentHp: number; maxHp: number; name?: string })[];
  status: string;
  rawEvents: TurnEventDto[];
  lastTurnEvents: string[];
  isFinished: boolean;
  isWaitingSwitch: boolean;
  isPending: boolean;
  battleType: string;
  returnUrl: string;
  onMoveSelect: (action: string) => void;
  onSkipMove: () => void;
  onRun: () => void;
  onOpenBag: () => void;
  onOpenParty: () => void;
  onSwitch: (id: string) => void;
  onUseItem: (itemId: string) => void;
  arenaTrainerId?: string | null;
}

export function BattleScreenPresenter(props: BattleScreenPresenterProps) {
  const {
    menu,
    setMenu,
    toastMsg,
    showToast,
    trainerSave,
    wild,
    opponentPartyData,
    player,
    playerPartyData,
    status,
    rawEvents,
    lastTurnEvents,
    isFinished,
    isWaitingSwitch,
    isPending,
    battleType,
    returnUrl,
    arenaTrainerId,
    onMoveSelect,
    onSkipMove,
    onRun,
    onOpenBag,
    onOpenParty,
    onSwitch,
    onUseItem,
  } = props;

  const [isMobileLogOpen, setIsMobileLogOpen] = useState(false);

  return (
    <div className="relative h-[calc(100dvh-64px)] lg:h-[calc(100dvh-72px)] w-full max-w-full bg-background text-foreground transition-colors duration-200 flex flex-col md:flex-row overflow-hidden">
      {/* Toast Overlay */}
      {toastMsg && (
        <div
          role="alert"
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-surface text-foreground px-4 py-2 sm:px-6 sm:py-3 rounded-2xl border border-border z-[100] shadow-xl text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {toastMsg}
        </div>
      )}

      {/* Main Arena & Controls Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative h-full overflow-hidden">
        {/* Battle Stage (Upper area, scaled) */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <BattleStage
            wild={wild}
            player={player}
            opponentPartyData={opponentPartyData}
            playerPartyData={playerPartyData}
          />
        </div>

        {/* Battle Controls (Bottom Action Area) */}
        <div className="w-full shrink-0">
          <BattleControls
            player={player}
            status={status}
            rawEvents={rawEvents}
            isPending={isPending}
            isFinished={isFinished}
            isWaitingSwitch={isWaitingSwitch}
            battleType={battleType}
            lastTurnEvents={lastTurnEvents}
            onMoveSelect={onMoveSelect}
            onSkipMove={onSkipMove}
            onRun={onRun}
            onOpenBag={onOpenBag}
            onOpenParty={onOpenParty}
            onOpenMobileLog={() => setIsMobileLogOpen(true)}
          />
        </div>
      </div>

      {/* Desktop Battle Log (Side Panel on md and wider) */}
      <aside
        className="hidden md:flex w-72 lg:w-80 xl:w-96 shrink-0 h-full border-l border-border bg-surface z-10"
        aria-label="Battle log sidebar"
      >
        <BattleLog
          lastTurnEvents={lastTurnEvents}
          status={status}
          className="w-full h-full"
        />
      </aside>

      {/* Mobile Collapsible Battle Log Bottom Sheet (on < md) */}
      <DialogRoot open={isMobileLogOpen} onOpenChange={setIsMobileLogOpen}>
        <DialogContent className="md:hidden max-h-[75dvh] p-0 overflow-hidden border-border bg-surface">
          <BattleLog
            lastTurnEvents={lastTurnEvents}
            status={status}
            isMobileOpen={isMobileLogOpen}
            onCloseMobile={() => setIsMobileLogOpen(false)}
            className="w-full h-full max-h-[70dvh]"
          />
        </DialogContent>
      </DialogRoot>

      {/* Switch Party Picker Sheet */}
      <SwitchSheet
        isOpen={menu === 'party' || isWaitingSwitch}
        onClose={() => setMenu('main')}
        playerPartyData={playerPartyData}
        activePokemonId={player.id}
        isWaitingSwitch={isWaitingSwitch}
        isPending={isPending}
        onSwitch={onSwitch}
        showToast={showToast}
      />

      {/* Bag Items Sheet */}
      <BagSheet
        isOpen={menu === 'bag'}
        onClose={() => setMenu('main')}
        trainerSave={trainerSave}
        isPending={isPending}
        onUseItem={onUseItem}
      />

      {/* Battle Result Modal */}
      <BattleResultModal
        isFinished={isFinished}
        status={status}
        battleType={battleType}
        lastTurnEvents={lastTurnEvents}
        wildSpeciesName={wild.name || wild.speciesName}
        returnUrl={returnUrl}
        arenaTrainerId={arenaTrainerId}
      />
    </div>
  );
}
