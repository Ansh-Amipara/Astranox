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

const realmsData = [
  { name: 'Lost Cave Realm', tier: 1, requiredRank: TrainerRank.F_RANK, types: ['water', 'ice', 'normal'] },
  { name: 'Dojo Realm', tier: 1, requiredRank: TrainerRank.F_RANK, types: ['fighting', 'normal', 'normal'] },
  { name: 'Nebula Realm', tier: 1, requiredRank: TrainerRank.F_RANK, types: ['psychic', 'fairy', 'normal'] },
  { name: 'Venom Hive Realm', tier: 2, requiredRank: TrainerRank.E_RANK, types: ['poison', 'bug', 'normal'] },
  { name: 'Synthetic Lab Realm', tier: 2, requiredRank: TrainerRank.E_RANK, types: ['normal', 'steel', 'normal'] },
  { name: 'Scrap Yard Realm', tier: 3, requiredRank: TrainerRank.D_RANK, types: ['steel', 'electric', 'normal'] },

  { name: 'Regi Ruins Realm', tier: 3, requiredRank: TrainerRank.D_RANK, types: ['electric', 'rock', 'normal'] },
  { name: 'Dragon Vault Realm', tier: 3, requiredRank: TrainerRank.D_RANK, types: ['dragon', 'ground', 'normal'] },
  { name: 'Swordsman Realm', tier: 4, requiredRank: TrainerRank.C_RANK, types: ['steel', 'fighting', 'normal'] },
  { name: 'Justice Realm', tier: 4, requiredRank: TrainerRank.C_RANK, types: ['rock', 'fighting', 'normal'] },
  { name: 'Honor Realm', tier: 5, requiredRank: TrainerRank.B_RANK, types: ['grass', 'fighting', 'normal'] },
  { name: 'Cavalry Realm', tier: 5, requiredRank: TrainerRank.B_RANK, types: ['water', 'fighting', 'normal'] },

  { name: 'Nature Shrine Realm', tier: 5, requiredRank: TrainerRank.B_RANK, types: ['electric', 'fairy', 'normal'] },
  { name: 'Life Shrine Realm', tier: 6, requiredRank: TrainerRank.A_RANK, types: ['psychic', 'fairy', 'normal'] },
  { name: 'Growth Shrine Realm', tier: 6, requiredRank: TrainerRank.A_RANK, types: ['grass', 'fairy', 'normal'] },
  { name: 'Ocean Shrine Realm', tier: 7, requiredRank: TrainerRank.AA_RANK, types: ['water', 'fairy', 'normal'] },
  { name: 'Crystal Cave Realm', tier: 7, requiredRank: TrainerRank.AA_RANK, types: ['rock', 'poison', 'normal'] },
  { name: 'Muscle Jungle Realm', tier: 7, requiredRank: TrainerRank.AA_RANK, types: ['bug', 'fighting', 'normal'] },

  { name: 'Ancient Forest Realm', tier: 8, requiredRank: TrainerRank.AAA_RANK, types: ['grass', 'psychic', 'normal'] },
  { name: 'Iron Boulder Realm', tier: 8, requiredRank: TrainerRank.AAA_RANK, types: ['rock', 'ground', 'normal'] },
  { name: 'Frozen Peak Realm', tier: 9, requiredRank: TrainerRank.S_RANK, types: ['ice', 'water', 'normal'] },
  { name: 'Steel Forge Realm', tier: 9, requiredRank: TrainerRank.S_RANK, types: ['steel', 'fire', 'normal'] },
  { name: 'Mystic Lake Realm', tier: 9, requiredRank: TrainerRank.S_RANK, types: ['water', 'ice', 'normal'] },
  { name: 'Scorched Earth Realm', tier: 10, requiredRank: TrainerRank.S_PLUS_RANK, types: ['fire', 'ground', 'normal'] },

  { name: 'Thunderstorm Realm', tier: 10, requiredRank: TrainerRank.S_PLUS_RANK, types: ['electric', 'flying', 'normal'] },
  { name: 'Abyss Realm', tier: 11, requiredRank: TrainerRank.SS_RANK, types: ['dark', 'ghost', 'normal'] },
  { name: 'Radiant Meadow Realm', tier: 11, requiredRank: TrainerRank.SS_RANK, types: ['grass', 'fairy', 'normal'] },
  { name: 'Crescent Moon Realm', tier: 11, requiredRank: TrainerRank.SS_RANK, types: ['psychic', 'dark', 'normal'] },
  { name: 'Deep Sea Realm', tier: 12, requiredRank: TrainerRank.SS_PLUS_RANK, types: ['water', 'psychic', 'normal'] },
  { name: 'Volcanic Core Realm', tier: 12, requiredRank: TrainerRank.SS_PLUS_RANK, types: ['fire', 'steel', 'normal'] },

  { name: 'Storm Realm', tier: 13, requiredRank: TrainerRank.SSS_RANK, types: ['electric', 'flying', 'normal'] },
  { name: 'Blazing Sky Realm', tier: 13, requiredRank: TrainerRank.SSS_RANK, types: ['fire', 'flying', 'normal'] },
  { name: 'Freezing Gust Realm', tier: 13, requiredRank: TrainerRank.SSS_RANK, types: ['ice', 'flying', 'normal'] },
  { name: 'Ocean Trench Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['psychic', 'water', 'normal'] },
  { name: 'Rainbow Horizon Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['fire', 'fairy', 'normal'] },
  { name: 'Eon Sky Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['dragon', 'psychic', 'normal'] },

  { name: 'Time Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['steel', 'dragon', 'normal'] },
  { name: 'Space Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['water', 'dragon', 'normal'] },
  { name: 'Distortion Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['ghost', 'dragon', 'normal'] },
  { name: 'Frozen Tundra Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['dragon', 'ice', 'normal'] },
  { name: 'Truth Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['dragon', 'fire', 'normal'] },
  { name: 'Ideals Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['dragon', 'electric', 'normal'] },

  { name: 'Dragon Peak Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['dragon', 'flying', 'normal'] },
  { name: 'Sun Core Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['psychic', 'steel', 'normal'] },
  { name: 'Moon Core Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['psychic', 'ghost', 'normal'] },
  { name: 'Life Tree Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['fairy', 'grass', 'normal'] },
  { name: 'Death Valley Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['dark', 'flying', 'normal'] },
  { name: 'Order Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['dragon', 'ground', 'normal'] },

  { name: 'Eon Ocean Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['dragon', 'psychic', 'normal'] },
  { name: 'Knowledge Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['psychic', 'fairy', 'normal'] },
  { name: 'Emotion Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['psychic', 'fairy', 'normal'] },

  { name: 'Willpower Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['psychic', 'fairy', 'normal'] },
  { name: 'Cyclone Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['flying', 'electric', 'normal'] },
  { name: 'Thunder Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['electric', 'flying', 'normal'] },

  { name: 'Fertility Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['ground', 'flying', 'normal'] },
  { name: 'Magma Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['ground', 'fire', 'normal'] },
  { name: 'Oceanic Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['water', 'ice', 'normal'] },

  { name: 'Titan Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['normal', 'fighting', 'normal'] },
  { name: 'Hero Sword Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['fairy', 'steel', 'normal'] },
  { name: 'Hero Shield Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['fighting', 'steel', 'normal'] },

  { name: 'Past Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['fighting', 'dragon', 'normal'] },
  { name: 'Future Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['electric', 'dragon', 'normal'] },

  { name: 'Crown Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['psychic', 'grass', 'normal'] },

  { name: 'Genetic Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['psychic', 'fighting', 'normal'] },

  { name: 'Prism Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['psychic', 'steel', 'normal'] },

  { name: 'Darkest Day Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['poison', 'dragon', 'normal'] },

  { name: 'Creation Realm', tier: 14, requiredRank: TrainerRank.SSS_PLUS_RANK, types: ['normal', 'psychic', 'normal'] },
];

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
