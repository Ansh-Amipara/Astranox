import { injectable } from 'tsyringe';
import { AppError } from '../../core/errors/AppError';
import { getMaxLevelForPotential } from '../../game/instance/PokemonInstance';
import { prisma } from '../../core/db/prisma';



// Map of XP Candy IDs to the amount of XP they grant
const XP_CANDY_VALUES: Record<string, number> = {
  'exp-candy-xs': 100,
  'exp-candy-s': 800,
  'exp-candy-m': 3000,
  'exp-candy-l': 10000,
  'exp-candy-xl': 30000,
};

@injectable()
export class InventoryService {
  /**
   * Helper to determine XP required for a level using Medium Fast growth rate (Level^3)
   */
  private getXpForLevel(level: number): number {
    return Math.pow(level, 3);
  }

  /**
   * Helper to determine Level from XP using Medium Fast growth rate
   */
  private getLevelFromXp(xp: number, maxLevel: number): number {
    const level = Math.floor(Math.cbrt(xp));
    return Math.min(Math.max(level, 1), maxLevel);
  }

  async useItem(trainerId: string, itemId: string, targetPokemonId?: string, quantityToUse: number = 1) {
    // 1. Verify item existence and quantity
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        trainerId_itemId: {
          trainerId,
          itemId,
        }
      },
      include: { item: true }
    });

    if (!inventoryItem || inventoryItem.quantity < quantityToUse) {
      throw new AppError('You do not have enough of this item.', 400);
    }

    // 2. Handle item effects
    if (inventoryItem.item.category === 'xp-candy') {
      const xpGainedPerItem = XP_CANDY_VALUES[itemId];
      if (!xpGainedPerItem) throw new AppError('Invalid XP Candy.', 400);

      const totalXpGained = xpGainedPerItem * quantityToUse;

      // Apply in a transaction to safely decrement item and update trainer's storedXp
      await prisma.$transaction([
        prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: { decrement: quantityToUse } }
        }),
        prisma.trainerSave.update({
          where: { id: trainerId },
          data: { storedXp: { increment: totalXpGained } }
        })
      ]);

      return {
        success: true,
        message: `Used ${quantityToUse}x ${inventoryItem.item.name}. Gained ${totalXpGained} Stored XP!`,
        xpGained: totalXpGained
      };
    }

    // 3. For future items that require a Pokemon
    if (!targetPokemonId) {
      throw new AppError('This item requires a target Pokémon.', 400);
    }

    const pokemon = await prisma.ownedPokemon.findFirst({
      where: {
        id: targetPokemonId,
        trainerId
      },
      include: { species: true }
    });

    if (!pokemon) {
      throw new AppError('Pokémon not found in your collection.', 404);
    }

    if (inventoryItem.item.category === 'dynamax') {
      if (pokemon.species.isGmax) {
        throw new AppError('This Pokémon is already capable of Gigantamaxing!', 400);
      }

      const gmaxSpecies = await prisma.species.findUnique({
        where: { name: `${pokemon.species.name}-gmax` }
      });

      if (!gmaxSpecies) {
        throw new AppError('This Pokémon does not have a Gigantamax form.', 400);
      }

      await prisma.$transaction([
        prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: { decrement: quantityToUse } }
        }),
        prisma.ownedPokemon.update({
          where: { id: pokemon.id },
          data: { speciesId: gmaxSpecies.id }
        })
      ]);

      return {
        success: true,
        message: `${pokemon.nickname || pokemon.species.name} unlocked its Gigantamax potential!`
      };
    }

    throw new AppError('This item cannot be used this way yet.', 400);
  }
}

