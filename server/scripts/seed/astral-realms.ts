import { PrismaClient, TrainerRank } from '@prisma/client';

const RANK_LEVEL_BOUNDS: Record<TrainerRank, { min: number, max: number }> = {
  [TrainerRank.F_RANK]: { min: 1, max: 60 },
  [TrainerRank.E_RANK]: { min: 61, max: 120 },
  [TrainerRank.D_RANK]: { min: 121, max: 200 },
  [TrainerRank.C_RANK]: { min: 201, max: 400 },
  [TrainerRank.B_RANK]: { min: 401, max: 500 },
  [TrainerRank.A_RANK]: { min: 501, max: 700 },
  [TrainerRank.AA_RANK]: { min: 701, max: 900 },
  [TrainerRank.AAA_RANK]: { min: 901, max: 1100 },
  [TrainerRank.S_RANK]: { min: 1101, max: 1400 },
  [TrainerRank.S_PLUS_RANK]: { min: 1401, max: 1700 },
  [TrainerRank.SS_RANK]: { min: 1701, max: 2000 },
  [TrainerRank.SS_PLUS_RANK]: { min: 2001, max: 3000 },
  [TrainerRank.SSS_RANK]: { min: 3001, max: 4000 },
  [TrainerRank.SSS_PLUS_RANK]: { min: 4001, max: 5000 },
};

import * as fs from 'fs';
import * as path from 'path';

const realmsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'realms/realms.json'), 'utf-8'));

const bossNameOverrides: Record<string, string> = {
  'Type: Null': 'type-null',
  'Ho-Oh': 'ho-oh',
  'Tapu Koko': 'tapu-koko',
  'Tapu Lele': 'tapu-lele',
  'Tapu Bulu': 'tapu-bulu',
  'Tapu Fini': 'tapu-fini',
  'Shaymin': 'shaymin-land',
  'Giratina': 'giratina-altered',
  'Zygarde': 'zygarde-50',
  'Keldeo': 'keldeo-ordinary',
  'Tornadus': 'tornadus-incarnate',
  'Thundurus': 'thundurus-incarnate',
  'Landorus': 'landorus-incarnate'
};

export async function seedAstralRealms(prisma: PrismaClient) {
  console.log('Seeding Astral Realms...');

  for (const realm of realmsData) {

    // Delete if exists to make script idempotent
    const existing = await prisma.astralRealm.findFirst({
      where: { name: realm.name }
    });
    if (existing) {
      await prisma.astralRealm.delete({ where: { id: existing.id } });
    }

    await prisma.astralRealm.create({
      data: {
        name: realm.name,
        tier: realm.tier,
        requiredRank: realm.requiredRank,
        types: realm.types,
        environment: realm.environment,
        habitats: realm.habitats,
        legendarySpawns: realm.legendarySpawns
      }
    });

    console.log(`  ✅ Inserted Realm: ${realm.name}`);
  }

  console.log('Finished seeding Astral Realms!');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedAstralRealms(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
