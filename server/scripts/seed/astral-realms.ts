import { PrismaClient, TrainerRank } from '@prisma/client';

const RANK_LEVEL_BOUNDS: Record<TrainerRank, { min: number, max: number }> = {
  [TrainerRank.F_RANK]: { min: 1, max: 60 },
  [TrainerRank.E_RANK]: { min: 61, max: 120 },
  [TrainerRank.D_RANK]: { min: 121, max: 200 },
  [TrainerRank.C_RANK]: { min: 201, max: 400 },
  [TrainerRank.B_RANK]: { min: 401, max: 700 },
  [TrainerRank.A_RANK]: { min: 701, max: 1100 },
  [TrainerRank.S_RANK]: { min: 1101, max: 1400 },
  [TrainerRank.S_PLUS_RANK]: { min: 1401, max: 1700 },
  [TrainerRank.SS_RANK]: { min: 1701, max: 2000 },
  [TrainerRank.SS_PLUS_RANK]: { min: 2001, max: 3000 },
  [TrainerRank.SSS_RANK]: { min: 3001, max: 4000 },
  [TrainerRank.SSS_PLUS_RANK]: { min: 4001, max: 5000 },
};

const realmsData = [
  // Tier 1
  { name: 'Lost Cave Realm', tier: 1, requiredRank: TrainerRank.F_RANK, minLevel: 1, maxLevel: 30, boss: 'Phione', types: ['water', 'ice'] },
  { name: 'Dojo Realm', tier: 1, requiredRank: TrainerRank.F_RANK, minLevel: 1, maxLevel: 30, boss: 'Kubfu', types: ['fighting', 'normal'] },
  { name: 'Nebula Realm', tier: 1, requiredRank: TrainerRank.F_RANK, minLevel: 1, maxLevel: 30, boss: 'Cosmog', types: ['psychic', 'fairy'] },
  { name: 'Venom Hive Realm', tier: 1, requiredRank: TrainerRank.F_RANK, minLevel: 1, maxLevel: 30, boss: 'Poipole', types: ['poison', 'bug'] },
  { name: 'Synthetic Lab Realm', tier: 1, requiredRank: TrainerRank.F_RANK, minLevel: 1, maxLevel: 30, boss: 'Type: Null', types: ['normal', 'steel'] },
  { name: 'Scrap Yard Realm', tier: 1, requiredRank: TrainerRank.F_RANK, minLevel: 1, maxLevel: 30, boss: 'Meltan', types: ['steel', 'electric'] },

  // Tier 2
  { name: 'Regi Ruins Realm', tier: 2, requiredRank: TrainerRank.F_RANK, minLevel: 31, maxLevel: 60, boss: 'Regieleki', types: ['electric', 'rock'] },
  { name: 'Dragon Vault Realm', tier: 2, requiredRank: TrainerRank.F_RANK, minLevel: 31, maxLevel: 60, boss: 'Regidrago', types: ['dragon', 'ground'] },
  { name: 'Swordsman Realm', tier: 2, requiredRank: TrainerRank.F_RANK, minLevel: 31, maxLevel: 60, boss: 'Cobalion', types: ['steel', 'fighting'] },
  { name: 'Justice Realm', tier: 2, requiredRank: TrainerRank.F_RANK, minLevel: 31, maxLevel: 60, boss: 'Terrakion', types: ['rock', 'fighting'] },
  { name: 'Honor Realm', tier: 2, requiredRank: TrainerRank.F_RANK, minLevel: 31, maxLevel: 60, boss: 'Virizion', types: ['grass', 'fighting'] },
  { name: 'Cavalry Realm', tier: 2, requiredRank: TrainerRank.F_RANK, minLevel: 31, maxLevel: 60, boss: 'Keldeo', types: ['water', 'fighting'] },

  // Tier 3
  { name: 'Nature Shrine Realm', tier: 3, requiredRank: TrainerRank.E_RANK, minLevel: 61, maxLevel: 90, boss: 'Tapu Koko', types: ['electric', 'fairy'] },
  { name: 'Life Shrine Realm', tier: 3, requiredRank: TrainerRank.E_RANK, minLevel: 61, maxLevel: 90, boss: 'Tapu Lele', types: ['psychic', 'fairy'] },
  { name: 'Growth Shrine Realm', tier: 3, requiredRank: TrainerRank.E_RANK, minLevel: 61, maxLevel: 90, boss: 'Tapu Bulu', types: ['grass', 'fairy'] },
  { name: 'Ocean Shrine Realm', tier: 3, requiredRank: TrainerRank.E_RANK, minLevel: 61, maxLevel: 90, boss: 'Tapu Fini', types: ['water', 'fairy'] },
  { name: 'Crystal Cave Realm', tier: 3, requiredRank: TrainerRank.E_RANK, minLevel: 61, maxLevel: 90, boss: 'Nihilego', types: ['rock', 'poison'] },
  { name: 'Muscle Jungle Realm', tier: 3, requiredRank: TrainerRank.E_RANK, minLevel: 61, maxLevel: 90, boss: 'Buzzwole', types: ['bug', 'fighting'] },

  // Tier 4
  { name: 'Ancient Forest Realm', tier: 4, requiredRank: TrainerRank.E_RANK, minLevel: 91, maxLevel: 120, boss: 'Celebi', types: ['grass', 'psychic'] },
  { name: 'Iron Boulder Realm', tier: 4, requiredRank: TrainerRank.E_RANK, minLevel: 91, maxLevel: 120, boss: 'Regirock', types: ['rock', 'ground'] },
  { name: 'Frozen Peak Realm', tier: 4, requiredRank: TrainerRank.E_RANK, minLevel: 91, maxLevel: 120, boss: 'Regice', types: ['ice', 'water'] },
  { name: 'Steel Forge Realm', tier: 4, requiredRank: TrainerRank.E_RANK, minLevel: 91, maxLevel: 120, boss: 'Registeel', types: ['steel', 'fire'] },
  { name: 'Mystic Lake Realm', tier: 4, requiredRank: TrainerRank.E_RANK, minLevel: 91, maxLevel: 120, boss: 'Suicune', types: ['water', 'ice'] },
  { name: 'Scorched Earth Realm', tier: 4, requiredRank: TrainerRank.E_RANK, minLevel: 91, maxLevel: 120, boss: 'Entei', types: ['fire', 'ground'] },

  // Tier 5
  { name: 'Thunderstorm Realm', tier: 5, requiredRank: TrainerRank.D_RANK, minLevel: 121, maxLevel: 150, boss: 'Raikou', types: ['electric', 'flying'] },
  { name: 'Abyss Realm', tier: 5, requiredRank: TrainerRank.D_RANK, minLevel: 121, maxLevel: 150, boss: 'Darkrai', types: ['dark', 'ghost'] },
  { name: 'Radiant Meadow Realm', tier: 5, requiredRank: TrainerRank.D_RANK, minLevel: 121, maxLevel: 150, boss: 'Shaymin', types: ['grass', 'fairy'] },
  { name: 'Crescent Moon Realm', tier: 5, requiredRank: TrainerRank.D_RANK, minLevel: 121, maxLevel: 150, boss: 'Cresselia', types: ['psychic', 'dark'] },
  { name: 'Deep Sea Realm', tier: 5, requiredRank: TrainerRank.D_RANK, minLevel: 121, maxLevel: 150, boss: 'Manaphy', types: ['water', 'psychic'] },
  { name: 'Volcanic Core Realm', tier: 5, requiredRank: TrainerRank.D_RANK, minLevel: 121, maxLevel: 150, boss: 'Heatran', types: ['fire', 'steel'] },

  // Tier 6
  { name: 'Storm Realm', tier: 6, requiredRank: TrainerRank.D_RANK, minLevel: 151, maxLevel: 200, boss: 'Zapdos', types: ['electric', 'flying'] },
  { name: 'Blazing Sky Realm', tier: 6, requiredRank: TrainerRank.D_RANK, minLevel: 151, maxLevel: 200, boss: 'Moltres', types: ['fire', 'flying'] },
  { name: 'Freezing Gust Realm', tier: 6, requiredRank: TrainerRank.D_RANK, minLevel: 151, maxLevel: 200, boss: 'Articuno', types: ['ice', 'flying'] },
  { name: 'Ocean Trench Realm', tier: 6, requiredRank: TrainerRank.D_RANK, minLevel: 151, maxLevel: 200, boss: 'Lugia', types: ['psychic', 'water'] },
  { name: 'Rainbow Horizon Realm', tier: 6, requiredRank: TrainerRank.D_RANK, minLevel: 151, maxLevel: 200, boss: 'Ho-Oh', types: ['fire', 'fairy'] },
  { name: 'Eon Sky Realm', tier: 6, requiredRank: TrainerRank.D_RANK, minLevel: 151, maxLevel: 200, boss: 'Latios', types: ['dragon', 'psychic'] },

  // Tier 7
  { name: 'Time Realm', tier: 7, requiredRank: TrainerRank.C_RANK, minLevel: 201, maxLevel: 300, boss: 'Dialga', types: ['steel', 'dragon'] },
  { name: 'Space Realm', tier: 7, requiredRank: TrainerRank.C_RANK, minLevel: 201, maxLevel: 300, boss: 'Palkia', types: ['water', 'dragon'] },
  { name: 'Distortion Realm', tier: 7, requiredRank: TrainerRank.C_RANK, minLevel: 201, maxLevel: 300, boss: 'Giratina', types: ['ghost', 'dragon'] },
  { name: 'Frozen Tundra Realm', tier: 7, requiredRank: TrainerRank.C_RANK, minLevel: 201, maxLevel: 300, boss: 'Kyurem', types: ['dragon', 'ice'] },
  { name: 'Truth Realm', tier: 7, requiredRank: TrainerRank.C_RANK, minLevel: 201, maxLevel: 300, boss: 'Reshiram', types: ['dragon', 'fire'] },
  { name: 'Ideals Realm', tier: 7, requiredRank: TrainerRank.C_RANK, minLevel: 201, maxLevel: 300, boss: 'Zekrom', types: ['dragon', 'electric'] },

  // Tier 8
  { name: 'Dragon Peak Realm', tier: 8, requiredRank: TrainerRank.C_RANK, minLevel: 301, maxLevel: 400, boss: 'Rayquaza', types: ['dragon', 'flying'] },
  { name: 'Sun Core Realm', tier: 8, requiredRank: TrainerRank.C_RANK, minLevel: 301, maxLevel: 400, boss: 'Solgaleo', types: ['psychic', 'steel'] },
  { name: 'Moon Core Realm', tier: 8, requiredRank: TrainerRank.C_RANK, minLevel: 301, maxLevel: 400, boss: 'Lunala', types: ['psychic', 'ghost'] },
  { name: 'Life Tree Realm', tier: 8, requiredRank: TrainerRank.C_RANK, minLevel: 301, maxLevel: 400, boss: 'Xerneas', types: ['fairy', 'grass'] },
  { name: 'Death Valley Realm', tier: 8, requiredRank: TrainerRank.C_RANK, minLevel: 301, maxLevel: 400, boss: 'Yveltal', types: ['dark', 'flying'] },
  { name: 'Order Realm', tier: 8, requiredRank: TrainerRank.C_RANK, minLevel: 301, maxLevel: 400, boss: 'Zygarde', types: ['dragon', 'ground'] },

  // Tier 9
  { name: 'Eon Ocean Realm', tier: 9, requiredRank: TrainerRank.B_RANK, minLevel: 401, maxLevel: 500, boss: 'Latias', types: ['dragon', 'psychic'] },
  { name: 'Knowledge Realm', tier: 9, requiredRank: TrainerRank.B_RANK, minLevel: 401, maxLevel: 500, boss: 'Uxie', types: ['psychic', 'fairy'] },
  { name: 'Emotion Realm', tier: 9, requiredRank: TrainerRank.B_RANK, minLevel: 401, maxLevel: 500, boss: 'Mesprit', types: ['psychic', 'fairy'] },

  // Tier 10
  { name: 'Willpower Realm', tier: 10, requiredRank: TrainerRank.B_RANK, minLevel: 501, maxLevel: 700, boss: 'Azelf', types: ['psychic', 'fairy'] },
  { name: 'Cyclone Realm', tier: 10, requiredRank: TrainerRank.B_RANK, minLevel: 501, maxLevel: 700, boss: 'Tornadus', types: ['flying', 'electric'] },
  { name: 'Thunder Realm', tier: 10, requiredRank: TrainerRank.B_RANK, minLevel: 501, maxLevel: 700, boss: 'Thundurus', types: ['electric', 'flying'] },

  // Tier 11
  { name: 'Fertility Realm', tier: 11, requiredRank: TrainerRank.A_RANK, minLevel: 701, maxLevel: 900, boss: 'Landorus', types: ['ground', 'flying'] },
  { name: 'Magma Realm', tier: 11, requiredRank: TrainerRank.A_RANK, minLevel: 701, maxLevel: 900, boss: 'Groudon', types: ['ground', 'fire'] },
  { name: 'Oceanic Realm', tier: 11, requiredRank: TrainerRank.A_RANK, minLevel: 701, maxLevel: 900, boss: 'Kyogre', types: ['water', 'ice'] },

  // Tier 12
  { name: 'Titan Realm', tier: 12, requiredRank: TrainerRank.A_RANK, minLevel: 901, maxLevel: 1100, boss: 'Regigigas', types: ['normal', 'fighting'] },
  { name: 'Hero Sword Realm', tier: 12, requiredRank: TrainerRank.A_RANK, minLevel: 901, maxLevel: 1100, boss: 'Zacian', types: ['fairy', 'steel'] },
  { name: 'Hero Shield Realm', tier: 12, requiredRank: TrainerRank.A_RANK, minLevel: 901, maxLevel: 1100, boss: 'Zamazenta', types: ['fighting', 'steel'] },

  // Tier 13
  { name: 'Past Realm', tier: 13, requiredRank: TrainerRank.S_RANK, minLevel: 1101, maxLevel: 1400, boss: 'Koraidon', types: ['fighting', 'dragon'] },
  { name: 'Future Realm', tier: 13, requiredRank: TrainerRank.S_RANK, minLevel: 1101, maxLevel: 1400, boss: 'Miraidon', types: ['electric', 'dragon'] },

  // Tier 14
  { name: 'Crown Realm', tier: 14, requiredRank: TrainerRank.S_PLUS_RANK, minLevel: 1401, maxLevel: 1700, boss: 'Calyrex', types: ['psychic', 'grass'] },

  // Tier 15
  { name: 'Genetic Realm', tier: 15, requiredRank: TrainerRank.SS_RANK, minLevel: 1701, maxLevel: 2000, boss: 'Mewtwo', types: ['psychic', 'fighting'] },

  // Tier 16
  { name: 'Prism Realm', tier: 16, requiredRank: TrainerRank.SS_PLUS_RANK, minLevel: 2001, maxLevel: 3000, boss: 'Necrozma', types: ['psychic', 'steel'] },

  // Tier 17
  { name: 'Darkest Day Realm', tier: 17, requiredRank: TrainerRank.SSS_RANK, minLevel: 3001, maxLevel: 4000, boss: 'Eternatus', types: ['poison', 'dragon'] },

  // Tier 18
  { name: 'Creation Realm', tier: 18, requiredRank: TrainerRank.SSS_PLUS_RANK, minLevel: 4001, maxLevel: 5000, boss: 'Arceus', types: ['normal', 'psychic'] },
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
    let searchName = bossNameOverrides[realm.boss];
    if (!searchName) {
      searchName = realm.boss.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
    }

    const species = await prisma.species.findFirst({
      where: { name: searchName }
    });

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
        minLevel: RANK_LEVEL_BOUNDS[realm.requiredRank].min,
        maxLevel: RANK_LEVEL_BOUNDS[realm.requiredRank].max,
        bossSpeciesName: realm.boss,
        bossSpeciesId: species ? species.id : null,
        types: realm.types,
      }
    });

    if (!species) {
      console.warn(`  ⚠️ Boss Species not found: ${realm.boss} (normalized: ${searchName}) in ${realm.name}`);
    } else {
      console.log(`  ✅ Inserted Realm: ${realm.name} (Boss: ${realm.boss})`);
    }
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
