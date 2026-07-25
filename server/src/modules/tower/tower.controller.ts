import { Request, Response, NextFunction } from 'express';
import { TowerService } from './tower.service';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const service = new TowerService();
const prisma = new PrismaClient();

const getTrainerId = async (userId: string) => {
  const trainer = await prisma.trainerSave.findUnique({ where: { userId } });
  if (!trainer) throw new Error('Trainer not found');
  return trainer.id;
};

export const getTowerState = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = await getTrainerId(req.user!.id);
    const state = await service.getState(trainerId);
    res.json({ success: true, data: state });
  } catch (error) {
    next(error);
  }
};

export const startFloor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = await getTrainerId(req.user!.id);
    const encounter = await service.generateNextFloorEncounter(trainerId);
    res.json({ success: true, data: encounter });
  } catch (error) {
    next(error);
  }
};

export const startBattle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = await getTrainerId(req.user!.id);
    const bodySchema = z.object({
      playerActivePokemonId: z.string().optional()
    });
    const { playerActivePokemonId } = bodySchema.parse(req.body);
    const battle = await service.startBattle(trainerId, playerActivePokemonId);
    res.json({ success: true, data: battle });
  } catch (error) {
    next(error);
  }
};

export const completeBattle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = await getTrainerId(req.user!.id);
    const bodySchema = z.object({
      result: z.enum(['WON', 'LOST'])
    });
    const { result } = bodySchema.parse(req.body);
    const newState = await service.completeBattle(trainerId, result);
    res.json({ success: true, data: newState });
  } catch (error) {
    next(error);
  }
};
export const skipFloors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = await getTrainerId(req.user!.id);
    const newState = await service.skipFloors(trainerId);
    res.json({ success: true, data: newState });
  } catch (error) {
    next(error);
  }
};
