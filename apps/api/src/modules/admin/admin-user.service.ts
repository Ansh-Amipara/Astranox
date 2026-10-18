import { injectable } from 'tsyringe';
import { prisma } from '../../core/db/prisma';
import { NotFoundError, BadRequestError } from '../../core/errors/AppError';
import { disconnectUserSockets } from '../../socket';
import type { BanUserInput, UnbanUserInput, AdminGrantCurrencyInput, AdminGrantItemInput } from '@astranox/types';

@injectable()
export class AdminUserService {
  async getUsers(page = 1, limit = 50, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search && search.trim().length > 0) {
      where.OR = [
        { username: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isBanned: true,
          banReason: true,
          bannedUntil: true,
          createdAt: true,
          trainerSave: {
            select: {
              id: true,
              astralCoins: true,
              infinityCoins: true,
              rank: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        isBanned: u.isBanned,
        banReason: u.banReason,
        bannedUntil: u.bannedUntil ? u.bannedUntil.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
        astralCoins: u.trainerSave?.astralCoins || 0,
        infinityCoins: u.trainerSave?.infinityCoins || 0,
        rank: u.trainerSave?.rank || 'F',
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isBanned: true,
        banReason: true,
        bannedUntil: true,
        createdAt: true,
        updatedAt: true,
        trainerSave: {
          include: {
            party: {
              include: {
                equippedMoves: { include: { move: true } },
              },
            },
            inventory: {
              include: { item: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const recentAudit = await prisma.auditLog.findMany({
      where: { entityId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned,
        banReason: user.banReason,
        bannedUntil: user.bannedUntil ? user.bannedUntil.toISOString() : null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      trainer: user.trainerSave,
      recentAuditLogs: recentAudit.map((a) => ({
        id: a.id,
        action: a.action,
        reason: a.reason,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  }

  async banUser(adminId: string, userId: string, input: BanUserInput, requestId?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found.');

    const [updated] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          banReason: input.reason,
          bannedUntil: input.expiresAt ? new Date(input.expiresAt) : null,
        },
      }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'USER_BAN',
          entityType: 'USER',
          entityId: userId,
          reason: input.reason,
          requestId: requestId || null,
          beforeValues: { isBanned: user.isBanned },
          afterValues: { isBanned: true, banReason: input.reason, bannedUntil: input.expiresAt },
        },
      }),
    ]);

    try {
      disconnectUserSockets(userId, 'ACCOUNT_BANNED');
    } catch {
      // Ignore if socket disconnect fails
    }

    return {
      id: updated.id,
      username: updated.username,
      isBanned: updated.isBanned,
      banReason: updated.banReason,
    };
  }

  async unbanUser(adminId: string, userId: string, input: UnbanUserInput, requestId?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found.');

    const [updated] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: false,
          banReason: null,
          bannedUntil: null,
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'USER_UNBAN',
          entityType: 'USER',
          entityId: userId,
          reason: input.reason,
          requestId: requestId || null,
          beforeValues: { isBanned: user.isBanned, banReason: user.banReason },
          afterValues: { isBanned: false },
        },
      }),
    ]);

    return {
      id: updated.id,
      username: updated.username,
      isBanned: updated.isBanned,
    };
  }

  async grantCurrency(adminId: string, userId: string, input: AdminGrantCurrencyInput, requestId?: string) {
    const { amount, currencyType, reason } = input;
    const trainer = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!trainer) throw new NotFoundError('Trainer save not found.');

    const currentCoins = currencyType === 'infinityCoins' ? trainer.infinityCoins : trainer.astralCoins;
    if (amount < 0 && currentCoins + amount < 0) {
      throw new BadRequestError(`Cannot deduct more ${currencyType} than the user possesses.`);
    }

    const updateData =
      currencyType === 'infinityCoins'
        ? { infinityCoins: { increment: amount } }
        : { astralCoins: { increment: amount } };

    const [updated] = await prisma.$transaction([
      prisma.trainerSave.update({
        where: { id: trainer.id },
        data: updateData,
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: amount >= 0 ? 'GRANT_CURRENCY' : 'DEDUCT_CURRENCY',
          entityType: 'USER',
          entityId: userId,
          reason,
          requestId: requestId || null,
          beforeValues: { [currencyType]: currentCoins },
          afterValues: { [currencyType]: currentCoins + amount, amount },
        },
      }),
    ]);

    return {
      userId,
      astralCoins: updated.astralCoins,
      infinityCoins: updated.infinityCoins,
    };
  }

  async grantItem(adminId: string, userId: string, input: AdminGrantItemInput, requestId?: string) {
    const { itemId, quantity, reason } = input;
    const trainer = await prisma.trainerSave.findUnique({
      where: { userId },
      include: { inventory: true },
    });
    if (!trainer) throw new NotFoundError('Trainer save not found.');

    const invItem = trainer.inventory.find((i) => i.itemId === itemId);
    const currentQty = invItem?.quantity || 0;

    if (quantity < 0 && currentQty + quantity < 0) {
      throw new BadRequestError('Cannot deduct more items than the user possesses.');
    }

    const [updatedInv] = await prisma.$transaction([
      prisma.inventoryItem.upsert({
        where: {
          trainerId_itemId: {
            trainerId: trainer.id,
            itemId,
          },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          trainerId: trainer.id,
          itemId,
          quantity: Math.max(0, quantity),
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: quantity >= 0 ? 'GRANT_ITEM' : 'DEDUCT_ITEM',
          entityType: 'INVENTORY_ITEM',
          entityId: itemId,
          reason,
          requestId: requestId || null,
          beforeValues: { itemId, quantity: currentQty },
          afterValues: { itemId, quantity: currentQty + quantity, change: quantity },
        },
      }),
    ]);

    return {
      userId,
      itemId,
      quantity: updatedInv.quantity,
    };
  }
}
