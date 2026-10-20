import { memo } from 'react';
import { BattleStage } from './BattleStage';
import { ActivePokemonDto, OwnedPokemonDto } from '@astranox/types';

interface Props {
  wild: ActivePokemonDto & { name?: string; isCorrupted?: boolean; statusAilment?: string };
  player: ActivePokemonDto & { name?: string; nickname?: string; statusAilment?: string };
  opponentPartyData: (OwnedPokemonDto & { currentHp: number; maxHp: number; name?: string })[];
  playerPartyData: (OwnedPokemonDto & { currentHp: number; maxHp: number; name?: string })[];
}

export const BattleArena = memo(function BattleArena({
  wild,
  player,
  opponentPartyData,
  playerPartyData,
}: Props) {
  return (
    <BattleStage
      wild={wild}
      player={player}
      opponentPartyData={opponentPartyData}
      playerPartyData={playerPartyData}
    />
  );
});
