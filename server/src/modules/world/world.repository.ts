import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WorldRepository {
  async getMacroLayout() {
    return prisma.world.findMany({
      include: {
        continents: {
          include: {
            regions: {
              include: {
                areas: {
                  include: {
                    gameMaps: {
                      select: {
                        id: true,
                        name: true,
                        theme: true,
                        difficulty: true,
                        mapImage: true,
                        secretArea: true,
                        areaId: true,
                        worldX: true,
                        worldY: true,
                        connectionsOut: {
                          select: {
                            targetMapId: true,
                            connectionType: true,
                            pathData: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  async getMapDetails(gameMapId: string) {
    return prisma.gameMap.findUnique({
      where: { id: gameMapId },
      include: {
        area: {
          include: {
            region: {
              include: {
                continent: true
              }
            }
          }
        },
        connectionsOut: {
          include: {
            targetMap: {
              select: { id: true, name: true }
            },
            unlockRequirements: true
          }
        },
        spawnGroups: {
          include: {
            entries: {
              include: { species: true }
            }
          }
        },
        npcs: true,
        npcTrainers: {
          include: {
            party: true
          }
        },
        weatherProfile: true,
        seasonProfile: true,
        music: true
      }
    });
  }
}
