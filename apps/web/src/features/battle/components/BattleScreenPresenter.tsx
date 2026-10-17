import { getSpriteUrl } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/lib/axios';
import { BattleArena } from '@/features/battle/components/BattleArena';
import { BattleControls } from '@/features/battle/components/BattleControls';
import { BattleLog } from '@/features/battle/components/BattleLog';
import { BattleResultModal } from '@/features/battle/components/BattleResultModal';
import { TrainerSaveDto, ActivePokemonDto, OwnedPokemonDto, TurnEventDto } from '@astranox/types';;

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
    menu, setMenu, toastMsg, showToast, trainerSave, wild, opponentPartyData, player, playerPartyData,
    status, rawEvents, lastTurnEvents, isFinished, isWaitingSwitch, isPending, battleType, returnUrl, arenaTrainerId,
    onMoveSelect, onSkipMove, onRun, onOpenBag, onOpenParty, onSwitch, onUseItem
  } = props;

  return (
    <div className="relative h-[calc(100dvh-64px)] bg-black text-white transition-colors duration-200 flex flex-col overflow-hidden">
      
      {/* Top Row: Arena and Battle Log */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Left Column: Arena */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
          {/* Toast */}
          {toastMsg && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-neutral-900/95 text-white px-6 py-3 rounded-xl border border-neutral-800 z-[100] shadow-xl">
              {toastMsg}
            </div>
          )}

          <BattleArena 
            wild={wild}
            player={player}
            opponentPartyData={opponentPartyData}
            playerPartyData={playerPartyData}
          />
        </div>

        <BattleLog 
          lastTurnEvents={lastTurnEvents}
          status={status}
        />
      </div>

      {/* Bottom Row: Action Menu (Full Width) */}
      <div className="w-full shrink-0">
        <BattleControls 
          player={player}
          status={status}
          rawEvents={rawEvents}
          isPending={isPending}
          isFinished={isFinished}
          isWaitingSwitch={isWaitingSwitch}
          battleType={battleType}
          onMoveSelect={onMoveSelect}
          onSkipMove={onSkipMove}
          onRun={onRun}
          onOpenBag={onOpenBag}
          onOpenParty={onOpenParty}
        />
      </div>

      {/* Modal Overlays for Bag & Party */}
      {(menu === 'bag' || menu === 'party') && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isWaitingSwitch) {
              setMenu('main');
            }
          }}
        >
          <div className="bg-neutral-950 text-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-neutral-800 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">{menu === 'bag' ? 'Bag' : 'Pokémon Party'}</h2>
              {!isWaitingSwitch && (
                <button onClick={() => setMenu('main')} className="text-neutral-400 hover:text-white transition-colors px-2 text-3xl leading-none">&times;</button>
              )}
            </div>
            <div className="p-6 overflow-y-auto">
              {menu === 'bag' && (
                trainerSave?.inventory?.filter((inv) => inv.itemId.endsWith('ball') && inv.quantity > 0).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {trainerSave.inventory
                      .filter((inv) => inv.itemId.endsWith('ball') && inv.quantity > 0)
                      .map((inv) => (
                        <button
                          key={inv.itemId}
                          onClick={() => { onUseItem(inv.itemId); setMenu('main'); }}
                          disabled={isPending}
                          className="bg-neutral-900 hover:bg-neutral-800 text-white flex items-center gap-3 p-3 rounded-xl border border-neutral-800 shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                          {inv.item?.spriteUrl && <img src={inv.item.spriteUrl} alt={inv.item.name} className="w-10 h-10 object-contain drop-shadow" />}
                          <div className="flex flex-col items-start">
                            <span className="font-bold text-white capitalize">{inv.item?.name?.replace('-', ' ') || inv.itemId.replace('-', ' ')}</span>
                            <span className="text-sm font-bold text-neutral-400">x{inv.quantity}</span>
                          </div>
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="p-8 flex items-center justify-center text-xl text-neutral-400 font-bold">
                    You have no Pokéballs.
                  </div>
                )
              )}

              {menu === 'party' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {playerPartyData.map((p: OwnedPokemonDto & { currentHp: number; maxHp: number; name?: string }) => {
                    const isActive = p.id === player.id;
                    const isFainted = p.currentHp <= 0;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (isActive) {
                            showToast(`${p.name || p.speciesName} is already in battle!`);
                            return;
                          }
                          if (isFainted) {
                            showToast(`${p.name || p.speciesName} has no energy left to battle!`);
                            return;
                          }
                          onSwitch(p.id);
                          setMenu('main');
                        }}
                        disabled={isPending || isActive || isFainted}
                        className={`flex flex-col items-start p-4 rounded-xl border shadow-sm transition-all text-left ${isActive ? 'bg-neutral-800 border-white text-white' : isFainted ? 'bg-neutral-900 border-neutral-800 opacity-40 text-neutral-500' : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-600 text-white hover:-translate-y-0.5'}`}
                      >
                        <div className="flex flex-row gap-3 w-full items-center mb-3">
                          <img 
                            src={getSpriteUrl(p.species?.id || p.speciesId)} 
                            alt={p.name || p.speciesName} 
                            className="w-16 h-16 object-contain drop-shadow"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-white capitalize text-lg truncate">{p.name || p.speciesName}</span>
                              <span className="text-sm font-black text-neutral-400 shrink-0">Lv {p.level}</span>
                            </div>
                            <div className="flex gap-1 mt-1">
                              {p.types?.map((type: string) => (
                                <img key={type} src={getTypeSpriteUrl(type, true)} alt={type} className="h-5 object-contain drop-shadow-sm" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-neutral-950 rounded-full h-3 overflow-hidden relative border border-neutral-800">
                          <div 
                            className={`h-full ${p.currentHp / p.maxHp > 0.5 ? 'bg-white' : p.currentHp / p.maxHp > 0.2 ? 'bg-neutral-400' : 'bg-neutral-600'}`} 
                            style={{ width: `${Math.max(0, (p.currentHp / p.maxHp) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold mt-2 text-neutral-400">{p.currentHp} / {p.maxHp} HP</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
