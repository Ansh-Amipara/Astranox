import { injectable } from 'tsyringe';
import { PrismaClient, TradeStatus } from '@prisma/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../../core/errors/AppError';
import { TradeMapper } from './dto/mapper';
import { TrainerMapper } from '../trainers/dto/mapper';
import type { TradeRequestDto } from './dto/response/TradeRequestDto';
import type { OwnedPokemonDto } from '../trainers/dto/response/OwnedPokemonDto';
import type { RequestTradeDto } from './dto/request/RequestTradeDto';
import { prisma } from '../../core/db/prisma';



@injectable()
export class TradesService {
  async toggleForTrade(userId: string, pokemonId: string): Promise<OwnedPokemonDto> {
    const trainer = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!trainer) throw new NotFoundError('Trainer not found.');

    const pokemon = await prisma.ownedPokemon.findUnique({
      where: { id: pokemonId }
    });

    if (!pokemon) throw new NotFoundError('Pokemon not found.');
    if (pokemon.trainerId !== trainer.id) throw new ForbiddenError('You can only modify your own Pokemon.');

    const updated = await prisma.ownedPokemon.update({
      where: { id: pokemonId },
      data: { isForTrade: !pokemon.isForTrade },
      include: { species: true }
    });
    return TrainerMapper.toOwnedPokemonDto(updated);
  }

  async getTradeablePokemon(targetUserId: string): Promise<OwnedPokemonDto[]> {
    const targetTrainer = await prisma.trainerSave.findUnique({
      where: { userId: targetUserId }
    });

    if (!targetTrainer) throw new NotFoundError('Trainer not found.');

    const pokemon = await prisma.ownedPokemon.findMany({
      where: {
        trainerId: targetTrainer.id,
        isForTrade: true
      },
      include: {
        species: { include: { type1: true, type2: true } }, equippedMoves: { include: { move: { include: { type: true } } } }
      },
      orderBy: { level: 'desc' }
    });

    return pokemon.map(TrainerMapper.toOwnedPokemonDto);
  }

  async requestTrade(userId: string, dto: RequestTradeDto): Promise<TradeRequestDto> {
    const { targetUserId, offeredPokemonId, requestedPokemonId } = dto;
    const initiatorTrainer = await prisma.trainerSave.findUnique({ where: { userId } });
    const targetTrainer = await prisma.trainerSave.findUnique({ where: { userId: targetUserId } });

    if (!initiatorTrainer || !targetTrainer) throw new NotFoundError('Trainer not found.');
    if (initiatorTrainer.id === targetTrainer.id) throw new ValidationError('You cannot trade with yourself.');

    const offeredPokemon = await prisma.ownedPokemon.findUnique({ where: { id: dto.offeredPokemonId } });
    const requestedPokemon = await prisma.ownedPokemon.findUnique({ where: { id: dto.requestedPokemonId } });

    if (!offeredPokemon || offeredPokemon.trainerId !== initiatorTrainer.id) {
      throw new ValidationError('Invalid offered Pokemon.');
    }
    if (!requestedPokemon || requestedPokemon.trainerId !== targetTrainer.id) {
      throw new ValidationError('Invalid requested Pokemon.');
    }

    if (offeredPokemon.isBound) {
      throw new ValidationError('Bound Pokemon cannot be traded.');
    }
    if (requestedPokemon.isBound) {
      throw new ValidationError('Cannot request a Bound Pokemon in trade.');
    }

    if (!offeredPokemon.isForTrade || !requestedPokemon.isForTrade) {
      throw new ValidationError('One or both of these Pokemon are not available for trade.');
    }

    // Check if there is already a pending trade for these exact two pokemon between these two trainers
    const existing = await prisma.tradeRequest.findFirst({
      where: {
        initiatorId: initiatorTrainer.id,
        receiverId: targetTrainer.id,
        offeredPokemonId,
        requestedPokemonId,
        status: TradeStatus.PENDING
      }
    });

    if (existing) throw new ValidationError('A trade request for these Pokemon already exists.');

    const trade = await prisma.tradeRequest.create({
      data: {
        initiatorId: initiatorTrainer.id,
        receiverId: targetTrainer.id,
        offeredPokemonId,
        requestedPokemonId,
        status: TradeStatus.PENDING
      },
      include: {
        offeredPokemon: { include: { species: true } },
        requestedPokemon: { include: { species: true } },
        initiator: { include: { user: { select: { username: true } } } },
        receiver: { include: { user: { select: { username: true } } } }
      }
    });
    return TradeMapper.toTradeRequestDto(trade);
  }

  async acceptTrade(userId: string, tradeId: string): Promise<{ success: boolean }> {
    const receiverTrainer = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!receiverTrainer) throw new NotFoundError('Trainer not found.');

    return prisma.$transaction(async (tx) => {
      const trade = await tx.tradeRequest.findUnique({
        where: { id: tradeId },
        include: { offeredPokemon: true, requestedPokemon: true }
      });

      if (!trade) throw new NotFoundError('Trade request not found.');
      if (trade.receiverId !== receiverTrainer.id) throw new ForbiddenError('You can only accept trades sent to you.');
      if (trade.status !== TradeStatus.PENDING) throw new ValidationError('This trade is no longer pending.');

      // Double check ownership in case they were traded away already
      if (trade.offeredPokemon.trainerId !== trade.initiatorId) throw new ValidationError('The offered Pokemon is no longer available.');
      if (trade.requestedPokemon.trainerId !== trade.receiverId) throw new ValidationError('The requested Pokemon is no longer available.');

      // Execute Swap
      await tx.ownedPokemon.update({
        where: { id: trade.offeredPokemonId },
        data: {
          trainerId: trade.receiverId,
          isParty: false,
          boxNumber: 1, // Default to box 1 for simplicity when received
          position: 0,
          isForTrade: false
        }
      });

      await tx.ownedPokemon.update({
        where: { id: trade.requestedPokemonId },
        data: {
          trainerId: trade.initiatorId,
          isParty: false,
          boxNumber: 1,
          position: 0,
          isForTrade: false
        }
      });

      // Mark this trade completed
      await tx.tradeRequest.update({
        where: { id: tradeId },
        data: { status: TradeStatus.COMPLETED }
      });

      // Cancel any other pending trades involving either of these pokemon
      await tx.tradeRequest.updateMany({
        where: {
          status: TradeStatus.PENDING,
          OR: [
            { offeredPokemonId: trade.offeredPokemonId },
            { requestedPokemonId: trade.offeredPokemonId },
            { offeredPokemonId: trade.requestedPokemonId },
            { requestedPokemonId: trade.requestedPokemonId }
          ]
        },
        data: { status: TradeStatus.CANCELLED }
      });

      return { success: true };
    });
  }

  async rejectTrade(userId: string, tradeId: string): Promise<TradeRequestDto> {
    const trainer = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!trainer) throw new NotFoundError('Trainer not found.');

    const trade = await prisma.tradeRequest.findUnique({ where: { id: tradeId } });
    if (!trade) throw new NotFoundError('Trade request not found.');

    if (trade.initiatorId !== trainer.id && trade.receiverId !== trainer.id) {
      throw new ForbiddenError('You can only reject or cancel your own trades.');
    }
    
    if (trade.status !== TradeStatus.PENDING) throw new ValidationError('Trade is no longer pending.');

    const newStatus = trade.initiatorId === trainer.id ? TradeStatus.CANCELLED : TradeStatus.REJECTED;

    const updated = await prisma.tradeRequest.update({
      where: { id: tradeId },
      data: { status: newStatus },
      include: {
        offeredPokemon: { include: { species: true } },
        requestedPokemon: { include: { species: true } },
        initiator: { include: { user: { select: { username: true } } } },
        receiver: { include: { user: { select: { username: true } } } }
      }
    });
    return TradeMapper.toTradeRequestDto(updated);
  }

  async getIncomingTrades(userId: string): Promise<TradeRequestDto[]> {
    const trainer = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!trainer) return [];

    const trades = await prisma.tradeRequest.findMany({
      where: { receiverId: trainer.id, status: TradeStatus.PENDING },
      include: {
        offeredPokemon: { include: { species: true } },
        requestedPokemon: { include: { species: true } },
        initiator: { include: { user: { select: { username: true } } } },
        receiver: { include: { user: { select: { username: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return trades.map(TradeMapper.toTradeRequestDto);
  }

  async getOutgoingTrades(userId: string): Promise<TradeRequestDto[]> {
    const trainer = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!trainer) return [];

    const trades = await prisma.tradeRequest.findMany({
      where: { initiatorId: trainer.id, status: TradeStatus.PENDING },
      include: {
        offeredPokemon: { include: { species: true } },
        requestedPokemon: { include: { species: true } },
        initiator: { include: { user: { select: { username: true } } } },
        receiver: { include: { user: { select: { username: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return trades.map(TradeMapper.toTradeRequestDto);
  }
}
