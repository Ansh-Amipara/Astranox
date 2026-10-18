import { injectable } from 'tsyringe';
import { prisma } from '../../core/db/prisma';
import { NotFoundError, BadRequestError } from '../../core/errors/AppError';
import { CacheService } from '../../core/services/cache.service';
import type {
  EventChallengeDto,
  CreateEventInput,
  UpdateEventInput,
} from '@astranox/types';

@injectable()
export class AdminEventsService {
  constructor(private cache: CacheService) {}

  private mapEventToDto(event: any): EventChallengeDto {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      isActive: event.isActive,
      isArchived: event.isArchived ?? false,
      taskType: event.taskType,
      taskConfig: event.taskConfig,
      rewardConfig: event.rewardConfig,
      pokemonPool: event.pokemonPool || null,
      dataVersion: event.dataVersion,
      updatedBy: event.updatedBy,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  }

  async getAllEvents(isArchived?: string): Promise<EventChallengeDto[]> {
    const where: any = {};
    if (isArchived === 'true') {
      where.isArchived = true;
    } else if (isArchived === 'all') {
      // both
    } else {
      where.isArchived = false;
    }

    const events = await prisma.eventChallenge.findMany({
      where,
      orderBy: [{ startDate: 'desc' }],
    });

    return events.map((e) => this.mapEventToDto(e));
  }

  async createEvent(
    adminId: string,
    input: CreateEventInput,
    requestId?: string
  ): Promise<EventChallengeDto> {
    if (new Date(input.endDate).getTime() <= new Date(input.startDate).getTime()) {
      throw new BadRequestError('Event end date must be strictly after start date.');
    }

    if (input.isActive) {
      await prisma.eventChallenge.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const [created] = await prisma.$transaction([
      prisma.eventChallenge.create({
        data: {
          name: input.name,
          description: input.description,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          isActive: input.isActive ?? false,
          isArchived: false,
          taskType: input.taskType as any,
          taskConfig: input.taskConfig || {},
          rewardConfig: input.rewardConfig || {},
          pokemonPool: input.pokemonPool || null,
          dataVersion: 1,
          updatedBy: adminId,
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'EVENT_CHALLENGE_CREATE',
          entityType: 'EVENT_CHALLENGE',
          entityId: input.name,
          reason: input.reason,
          requestId: requestId || null,
          beforeValues: null,
          afterValues: input,
        },
      }),
    ]);

    await this.cache.del('events:active');
    return this.mapEventToDto(created);
  }

  async updateEvent(
    adminId: string,
    id: string,
    input: UpdateEventInput,
    requestId?: string
  ): Promise<EventChallengeDto> {
    const existing = await prisma.eventChallenge.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Event challenge with ID '${id}' not found.`);
    }

    const beforeValues = {
      name: existing.name,
      description: existing.description,
      startDate: existing.startDate,
      endDate: existing.endDate,
      isActive: existing.isActive,
      isArchived: existing.isArchived,
      taskType: existing.taskType,
      taskConfig: existing.taskConfig,
      rewardConfig: existing.rewardConfig,
      pokemonPool: existing.pokemonPool,
    };

    if (input.isActive) {
      await prisma.eventChallenge.updateMany({
        where: { id: { not: id }, isActive: true },
        data: { isActive: false },
      });
    }

    const updateData: any = {
      dataVersion: { increment: 1 },
      updatedBy: adminId,
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.startDate !== undefined) updateData.startDate = new Date(input.startDate);
    if (input.endDate !== undefined) updateData.endDate = new Date(input.endDate);
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.isArchived !== undefined) updateData.isArchived = input.isArchived;
    if (input.taskType !== undefined) updateData.taskType = input.taskType as any;
    if (input.taskConfig !== undefined) updateData.taskConfig = input.taskConfig;
    if (input.rewardConfig !== undefined) updateData.rewardConfig = input.rewardConfig;
    if (input.pokemonPool !== undefined) updateData.pokemonPool = input.pokemonPool;

    const [updated] = await prisma.$transaction([
      prisma.eventChallenge.update({
        where: { id },
        data: updateData,
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'EVENT_CHALLENGE_UPDATE',
          entityType: 'EVENT_CHALLENGE',
          entityId: id,
          reason: input.reason,
          requestId: requestId || null,
          beforeValues,
          afterValues: updateData,
        },
      }),
    ]);

    await this.cache.del('events:active');
    return this.mapEventToDto(updated);
  }

  async archiveEvent(
    adminId: string,
    id: string,
    reason: string,
    requestId?: string
  ): Promise<EventChallengeDto> {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A reason of at least 5 characters is required to archive an event.');
    }

    const existing = await prisma.eventChallenge.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Event challenge with ID '${id}' not found.`);
    }

    const [updated] = await prisma.$transaction([
      prisma.eventChallenge.update({
        where: { id },
        data: {
          isArchived: true,
          isActive: false,
          updatedBy: adminId,
          dataVersion: { increment: 1 },
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'EVENT_CHALLENGE_ARCHIVE',
          entityType: 'EVENT_CHALLENGE',
          entityId: id,
          reason,
          requestId: requestId || null,
          beforeValues: { isArchived: existing.isArchived, isActive: existing.isActive },
          afterValues: { isArchived: true, isActive: false },
        },
      }),
    ]);

    await this.cache.del('events:active');
    return this.mapEventToDto(updated);
  }

  async unarchiveEvent(
    adminId: string,
    id: string,
    reason: string,
    requestId?: string
  ): Promise<EventChallengeDto> {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A reason of at least 5 characters is required to restore an event.');
    }

    const existing = await prisma.eventChallenge.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Event challenge with ID '${id}' not found.`);
    }

    const [updated] = await prisma.$transaction([
      prisma.eventChallenge.update({
        where: { id },
        data: {
          isArchived: false,
          updatedBy: adminId,
          dataVersion: { increment: 1 },
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'EVENT_CHALLENGE_RESTORE',
          entityType: 'EVENT_CHALLENGE',
          entityId: id,
          reason,
          requestId: requestId || null,
          beforeValues: { isArchived: existing.isArchived },
          afterValues: { isArchived: false },
        },
      }),
    ]);

    await this.cache.del('events:active');
    return this.mapEventToDto(updated);
  }
}
