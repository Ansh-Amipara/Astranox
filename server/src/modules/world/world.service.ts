import { WorldRepository } from './world.repository';
import { TrainersRepository } from '../trainers/trainers.repository';
import { NotFoundError } from '../../common/errors/AppError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WorldService {
  private repository: WorldRepository;
  private trainersRepo: TrainersRepository;

  constructor() {
    this.repository = new WorldRepository();
    this.trainersRepo = new TrainersRepository();
  }

  async getMacroLayout() {
    return this.repository.getMacroLayout();
  }

  async getMapDetails(gameMapId: string) {
    const map = await this.repository.getMapDetails(gameMapId);
    if (!map) {
      throw new NotFoundError('Map not found');
    }
    return map;
  }

  async travel(userId: string, targetMapId: string, _connectionId?: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) {
      throw new NotFoundError('Trainer save not found');
    }

    // 1. Verify target map exists
    const targetMap = await this.repository.getMapDetails(targetMapId);
    if (!targetMap) {
      throw new NotFoundError('Target map not found');
    }

    // 2. If a specific connection is provided, we would validate UnlockRequirements here.
    // For now, we assume simple travel is allowed.
    // E.g. Check badges, items, quests, etc.

    // 3. Update TrainerSave location
    const updated = await prisma.trainerSave.update({
      where: { id: trainerSave.id },
      data: {
        gameMapId: targetMapId,
        areaId: targetMap.areaId,
        regionId: targetMap.area.regionId,
        continentId: targetMap.area.region.continentId,
        positionX: 0,
        positionY: 0
      }
    });

    return updated;
  }

  async savePosition(userId: string, mapId: string, x: number, y: number) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) {
      throw new NotFoundError('Trainer save not found');
    }

    const updated = await prisma.trainerSave.update({
      where: { id: trainerSave.id },
      data: {
        gameMapId: mapId,
        positionX: Math.round(x),
        positionY: Math.round(y)
      }
    });

    return updated;
  }

  async getExplorationProgress(userId: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) throw new NotFoundError('Trainer not found');

    return prisma.explorationProgress.findMany({
      where: { trainerId: trainerSave.id },
      include: {
        gameMap: { select: { name: true, id: true } }
      }
    });
  }
}
