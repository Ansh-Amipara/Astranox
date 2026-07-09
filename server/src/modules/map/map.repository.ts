import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MapRepository {
  async getHabitatsWithZones() {
    return prisma.habitat.findMany({
      include: {
        zones: {
          include: {
            encounters: {
              include: {
                species: true,
              }
            }
          }
        }
      }
    });
  }

  async getZoneById(zoneId: number) {
    return prisma.zone.findUnique({
      where: { id: zoneId },
      include: {
        encounters: {
          include: {
            species: {
              include: {
                type1: true,
                type2: true
              }
            }
          }
        }
      }
    });
  }
}
