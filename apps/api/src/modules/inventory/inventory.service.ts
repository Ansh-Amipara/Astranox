import { injectable } from 'tsyringe';
import { AppError } from '../../core/errors/AppError';
import { prisma } from '../../core/db/prisma';
import { XP_CANDY_VALUES } from '@astranox/constants';

@injectable()
export class InventoryService {

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
    const isCandy = inventoryItem.item.category === 'xp-candy' || inventoryItem.item.category === 'candies';
    if (isCandy) {
      let xpGainedPerItem: number | undefined;

      // Look up authoritative dynamic definition in ShopItem
      const shopItem = await prisma.shopItem.findUnique({
        where: { key: itemId },
        select: { effectType: true, effectConfig: true },
      });

      if (shopItem?.effectConfig && typeof shopItem.effectConfig === 'object') {
        const cfg = shopItem.effectConfig as Record<string, unknown>;
        if (typeof cfg.xpAmount === 'number' || typeof cfg.xpAmount === 'string') {
          xpGainedPerItem = Number(cfg.xpAmount);
        }
      }

      if (!xpGainedPerItem || isNaN(xpGainedPerItem)) {
        xpGainedPerItem = XP_CANDY_VALUES[itemId];
      }

      if (!xpGainedPerItem || xpGainedPerItem <= 0) {
        throw new AppError('Invalid XP Candy configuration.', 400);
      }

      const totalXpGained = xpGainedPerItem * quantityToUse;

      // Apply in a transaction to safely decrement item and update trainer's storedXp
      await prisma.$transaction([
        prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: { decrement: quantityToUse } },
        }),
        prisma.trainerSave.update({
          where: { id: trainerId },
          data: { storedXp: { increment: totalXpGained } },
        }),
        prisma.auditLog.create({
          data: {
            adminId: trainerId,
            action: 'ITEM_USE_CANDY',
            entityType: 'INVENTORY_ITEM',
            entityId: itemId,
            reason: `Used ${quantityToUse}x ${inventoryItem.item.name}`,
            afterValues: {
              itemId,
              quantity: quantityToUse,
              xpPerItem: xpGainedPerItem,
              totalXpGained,
            },
          },
        }),
      ]);

      return {
        success: true,
        message: `Used ${quantityToUse}x ${inventoryItem.item.name}. Gained ${totalXpGained} Stored XP!`,
        xpGained: totalXpGained,
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

