import { PrismaClient } from '@prisma/client';
import { NpcMapper } from './dto/mapper';
import type { NpcDto } from './dto/response/NpcDto';

const prisma = new PrismaClient();

export class NpcsService {
  async listNpcs(userId: string): Promise<NpcDto[]> {
    const trainerSave = await prisma.trainerSave.findUnique({
      where: { userId },
      include: { defeatedNpcs: true }
    });

    const npcs = await prisma.npcTrainer.findMany({
      include: { party: true },
      orderBy: { rewardMoney: 'asc' }
    });

    return npcs.map(npc => NpcMapper.toNpcDto({
      ...npc,
      isDefeated: trainerSave?.defeatedNpcs.some(d => d.npcTrainerId === npc.id) || false
    }));
  }
}
