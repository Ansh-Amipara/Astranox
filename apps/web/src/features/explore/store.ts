import { create } from 'zustand';
import { MapDirection } from '@astranox/game-map';
import { TurnEvent } from '@astranox/battle-engine';

export interface Position {
  x: number;
  y: number;
  facing: MapDirection;
}

export interface ExploreBattleState {
  battleId: string;
  turnNumber: number;
  playerActive: any;
  playerParty: any[];
  wildPokemon: any;
  outcome: string | null;
}

export interface BattleFinalResult {
  outcome: 'WON' | 'CAPTURED' | 'DEFEATED' | 'FLED';
  rewards?: {
    coins?: number;
    xp?: number;
    penaltyCoins?: number;
  };
  capturedPokemon?: {
    id: string;
    speciesId: number;
    speciesName: string;
    level: number;
    isParty: boolean;
  };
  respawnPosition?: {
    mapId: string;
    x: number;
    y: number;
  };
}

interface ExploreStoreState {
  mapId: string;
  playerPos: Position;
  serverPos: Position;
  lastSeq: number;
  activeBattle: ExploreBattleState | null;
  battleEvents: TurnEvent[];
  isEncounterTransition: boolean;
  finalOutcome: BattleFinalResult | null;
  isLoadingMap: boolean;

  setMapId: (mapId: string) => void;
  setPlayerPos: (pos: Position) => void;
  setServerPos: (pos: Position, seq: number) => void;
  reconcileRejected: (pos: Position, seq: number) => void;
  setActiveBattle: (battle: ExploreBattleState | null) => void;
  addBattleEvents: (events: TurnEvent[]) => void;
  setEncounterTransition: (active: boolean) => void;
  setFinalOutcome: (outcome: BattleFinalResult | null) => void;
  setIsLoadingMap: (loading: boolean) => void;
  resetExplore: () => void;
}

export const useExploreStore = create<ExploreStoreState>((set) => ({
  mapId: 'pallet-town',
  playerPos: { x: 5, y: 5, facing: 'DOWN' },
  serverPos: { x: 5, y: 5, facing: 'DOWN' },
  lastSeq: 0,
  activeBattle: null,
  battleEvents: [],
  isEncounterTransition: false,
  finalOutcome: null,
  isLoadingMap: true,

  setMapId: (mapId) => set({ mapId }),
  setPlayerPos: (playerPos) => set({ playerPos }),
  setServerPos: (serverPos, lastSeq) => set({ serverPos, playerPos: serverPos, lastSeq }),
  reconcileRejected: (serverPos, lastSeq) => set({ serverPos, playerPos: serverPos, lastSeq }),
  setActiveBattle: (activeBattle) => set({ activeBattle }),
  addBattleEvents: (events) => set((s) => ({ battleEvents: [...s.battleEvents, ...events] })),
  setEncounterTransition: (isEncounterTransition) => set({ isEncounterTransition }),
  setFinalOutcome: (finalOutcome) => set({ finalOutcome }),
  setIsLoadingMap: (isLoadingMap) => set({ isLoadingMap }),
  resetExplore: () =>
    set({
      activeBattle: null,
      battleEvents: [],
      finalOutcome: null,
      isEncounterTransition: false,
    }),
}));
