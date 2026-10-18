import { injectable } from 'tsyringe';
import { prisma } from '../../core/db/prisma';

@injectable()
export class EventsRepository {
  private prisma = prisma;

  async getActiveEvent() {
    return this.prisma.eventChallenge.findFirst({
      where: { isActive: true }
    });
  }

  async getEventProgress(trainerId: string, eventChallengeId: string) {
    return this.prisma.playerEventProgress.findUnique({
      where: {
        trainerId_eventChallengeId: {
          trainerId,
          eventChallengeId
        }
      }
    });
  }

  async createOrIncrementProgress(trainerId: string, eventChallengeId: string) {
    return this.prisma.playerEventProgress.upsert({
      where: {
        trainerId_eventChallengeId: {
          trainerId,
          eventChallengeId
        }
      },
      update: {
        progress: { increment: 1 }
      },
      create: {
        trainerId,
        eventChallengeId,
        progress: 1
      }
    });
  }

  async markAsClaimed(trainerId: string, eventChallengeId: string) {
    return this.prisma.playerEventProgress.update({
      where: {
        trainerId_eventChallengeId: {
          trainerId,
          eventChallengeId
        }
      },
      data: {
        isClaimed: true
      }
    });
  }

  // Admin methods
  async createEvent(data: any) {
    return this.prisma.eventChallenge.create({ data });
  }

  async updateEvent(id: string, data: any) {
    return this.prisma.eventChallenge.update({ where: { id }, data });
  }

  async deleteEvent(id: string) {
    return this.prisma.eventChallenge.delete({ where: { id } });
  }

  async getEventById(id: string) {
    return this.prisma.eventChallenge.findUnique({ where: { id } });
  }

  async getAllEvents() {
    return this.prisma.eventChallenge.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async deactivateAllEvents() {
    return this.prisma.eventChallenge.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });
  }
}
