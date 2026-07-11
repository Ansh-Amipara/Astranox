import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class NpcsService {
  async listNpcs(userId: string) {
    const trainerSave = await prisma.trainerSave.findUnique({
      where: { userId },
      include: { defeatedNpcs: true }
    });

    const npcs = await prisma.npcTrainer.findMany({
      include: { party: true },
      orderBy: { rewardMoney: 'asc' } // basic ordering
    });

    return npcs.map(npc => ({
      ...npc,
      isDefeated: trainerSave?.defeatedNpcs.some(d => d.npcTrainerId === npc.id) || false
    }));
  }
}
