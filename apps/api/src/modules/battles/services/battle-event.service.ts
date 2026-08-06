import { injectable } from 'tsyringe';
@injectable()
export class BattleEventService {
  createFledEvent(pokemonId: string) {
    return { type: 'fled' as const, pokemonId };
  }

  createSwitchEvent(pokemonId: string, targetId: string, name: string, isPlayer: boolean) {
    return { type: 'switch' as const, pokemonId, targetPokemonId: targetId, name, isPlayer };
  }

  createLearnedMoveEvent(pokemonId: string, moveName: string) {
    return { type: 'learned_move' as const, pokemonId, moveName };
  }

  createSkippedMoveEvent(pokemonId: string) {
    return { type: 'skipped_move' as const, pokemonId };
  }

  createPromptLearnMoveEvent(pokemonId: string, moveId: number, moveName: string) {
    return { type: 'prompt_learn_move' as const, pokemonId, moveId, moveName };
  }
}
