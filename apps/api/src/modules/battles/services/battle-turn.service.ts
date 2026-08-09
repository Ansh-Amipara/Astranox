import { injectable } from 'tsyringe';
import { BattleAction } from '../../../game/battle-state/types';
import { resolveTurn } from '../../../game/battle-state/turn-resolver';
import { Prisma } from '@prisma/client';
import { BattleValidatorService } from './battle-validator.service';

@injectable()
export class BattleTurnService {
  constructor(private validator: BattleValidatorService) {}

  async getOpponentAction(wildPokemon: any, playerPokemon: any, tx: Prisma.TransactionClient): Promise<BattleAction> {
    const opponentMoves = wildPokemon.moves && wildPokemon.moves.length > 0 ? wildPokemon.moves : [{ moveId: 10714 }]; // 10714 is Tackle

    const randomMove = opponentMoves[Math.floor(Math.random() * opponentMoves.length)];

    const wildMoveData = await tx.move.findUnique({
      where: { id: randomMove.moveId },
      include: { type: true }
    }) || await tx.move.findUnique({ where: { name: 'Tackle' }, include: { type: true } });

    if (!wildMoveData) {
      throw new Error('Fallback move Tackle not found in database.');
    }

    return {
      type: 'move',
      pokemonId: wildPokemon.id,
      typeEffectivenessMultiplier: this.validator.calculateTypeMultiplier(wildMoveData.type, playerPokemon.types),
      move: {
        name: wildMoveData.name,
        power: wildMoveData.power,
        type: wildMoveData.type.name,
        damageClass: wildMoveData.damageClass as any
      }
    };
  }

  executeTurn(playerPokemon: any, playerAction: BattleAction, opponentPokemon: any, opponentAction: BattleAction) {
    return resolveTurn(playerPokemon, playerAction, opponentPokemon, opponentAction);
  }
}
