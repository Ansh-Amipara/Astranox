import { PrismaClient, TrainerRank } from '@prisma/client';

const realmsData = [
  // Tier 1: Black Iron
  { name: 'Lost Cave Realm', tier: 1, requiredRank: TrainerRank.BLACK_IRON, minLevel: 1, maxLevel: 20, boss: 'Phione', types: ['water', 'ice'] },
  { name: 'Dojo Realm', tier: 1, requiredRank: TrainerRank.BLACK_IRON, minLevel: 1, maxLevel: 20, boss: 'Kubfu', types: ['fighting', 'normal'] },
  { name: 'Nebula Realm', tier: 1, requiredRank: TrainerRank.BLACK_IRON, minLevel: 1, maxLevel: 20, boss: 'Cosmog', types: ['psychic', 'fairy'] },
  { name: 'Venom Hive Realm', tier: 1, requiredRank: TrainerRank.BLACK_IRON, minLevel: 1, maxLevel: 20, boss: 'Poipole', types: ['poison', 'bug'] },
  { name: 'Synthetic Lab Realm', tier: 1, requiredRank: TrainerRank.BLACK_IRON, minLevel: 1, maxLevel: 20, boss: 'Type: Null', types: ['normal', 'steel'] },
  { name: 'Scrap Yard Realm', tier: 1, requiredRank: TrainerRank.BLACK_IRON, minLevel: 1, maxLevel: 20, boss: 'Meltan', types: ['steel', 'electric'] },

  // Tier 2: Bronze
  { name: 'Regi Ruins Realm', tier: 2, requiredRank: TrainerRank.BRONZE, minLevel: 21, maxLevel: 40, boss: 'Regieleki', types: ['electric', 'rock'] },
  { name: 'Dragon Vault Realm', tier: 2, requiredRank: TrainerRank.BRONZE, minLevel: 21, maxLevel: 40, boss: 'Regidrago', types: ['dragon', 'ground'] },
  { name: 'Swordsman Realm', tier: 2, requiredRank: TrainerRank.BRONZE, minLevel: 21, maxLevel: 40, boss: 'Cobalion', types: ['steel', 'fighting'] },
  { name: 'Justice Realm', tier: 2, requiredRank: TrainerRank.BRONZE, minLevel: 21, maxLevel: 40, boss: 'Terrakion', types: ['rock', 'fighting'] },
  { name: 'Honor Realm', tier: 2, requiredRank: TrainerRank.BRONZE, minLevel: 21, maxLevel: 40, boss: 'Virizion', types: ['grass', 'fighting'] },
  { name: 'Cavalry Realm', tier: 2, requiredRank: TrainerRank.BRONZE, minLevel: 21, maxLevel: 40, boss: 'Keldeo', types: ['water', 'fighting'] },

  // Tier 3: Silver
  { name: 'Nature Shrine Realm', tier: 3, requiredRank: TrainerRank.SILVER, minLevel: 41, maxLevel: 60, boss: 'Tapu Koko', types: ['electric', 'fairy'] },
  { name: 'Life Shrine Realm', tier: 3, requiredRank: TrainerRank.SILVER, minLevel: 41, maxLevel: 60, boss: 'Tapu Lele', types: ['psychic', 'fairy'] },
  { name: 'Growth Shrine Realm', tier: 3, requiredRank: TrainerRank.SILVER, minLevel: 41, maxLevel: 60, boss: 'Tapu Bulu', types: ['grass', 'fairy'] },
  { name: 'Ocean Shrine Realm', tier: 3, requiredRank: TrainerRank.SILVER, minLevel: 41, maxLevel: 60, boss: 'Tapu Fini', types: ['water', 'fairy'] },
  { name: 'Crystal Cave Realm', tier: 3, requiredRank: TrainerRank.SILVER, minLevel: 41, maxLevel: 60, boss: 'Nihilego', types: ['rock', 'poison'] },
  { name: 'Muscle Jungle Realm', tier: 3, requiredRank: TrainerRank.SILVER, minLevel: 41, maxLevel: 60, boss: 'Buzzwole', types: ['bug', 'fighting'] },

  // Tier 4: Gold
  { name: 'Ancient Forest Realm', tier: 4, requiredRank: TrainerRank.GOLD, minLevel: 61, maxLevel: 80, boss: 'Celebi', types: ['grass', 'psychic'] },
  { name: 'Iron Boulder Realm', tier: 4, requiredRank: TrainerRank.GOLD, minLevel: 61, maxLevel: 80, boss: 'Regirock', types: ['rock', 'ground'] },
  { name: 'Frozen Peak Realm', tier: 4, requiredRank: TrainerRank.GOLD, minLevel: 61, maxLevel: 80, boss: 'Regice', types: ['ice', 'water'] },
  { name: 'Steel Forge Realm', tier: 4, requiredRank: TrainerRank.GOLD, minLevel: 61, maxLevel: 80, boss: 'Registeel', types: ['steel', 'fire'] },
  { name: 'Mystic Lake Realm', tier: 4, requiredRank: TrainerRank.GOLD, minLevel: 61, maxLevel: 80, boss: 'Suicune', types: ['water', 'ice'] },
  { name: 'Scorched Earth Realm', tier: 4, requiredRank: TrainerRank.GOLD, minLevel: 61, maxLevel: 80, boss: 'Entei', types: ['fire', 'ground'] },

  // Tier 5: Platinum
  { name: 'Thunderstorm Realm', tier: 5, requiredRank: TrainerRank.PLATINUM, minLevel: 81, maxLevel: 90, boss: 'Raikou', types: ['electric', 'flying'] },
  { name: 'Abyss Realm', tier: 5, requiredRank: TrainerRank.PLATINUM, minLevel: 81, maxLevel: 90, boss: 'Darkrai', types: ['dark', 'ghost'] },
  { name: 'Radiant Meadow Realm', tier: 5, requiredRank: TrainerRank.PLATINUM, minLevel: 81, maxLevel: 90, boss: 'Shaymin', types: ['grass', 'fairy'] },
  { name: 'Crescent Moon Realm', tier: 5, requiredRank: TrainerRank.PLATINUM, minLevel: 81, maxLevel: 90, boss: 'Cresselia', types: ['psychic', 'dark'] },
  { name: 'Deep Sea Realm', tier: 5, requiredRank: TrainerRank.PLATINUM, minLevel: 81, maxLevel: 90, boss: 'Manaphy', types: ['water', 'psychic'] },
  { name: 'Volcanic Core Realm', tier: 5, requiredRank: TrainerRank.PLATINUM, minLevel: 81, maxLevel: 90, boss: 'Heatran', types: ['fire', 'steel'] },

  // Tier 6: Diamond
  { name: 'Storm Realm', tier: 6, requiredRank: TrainerRank.DIAMOND, minLevel: 91, maxLevel: 100, boss: 'Zapdos', types: ['electric', 'flying'] },
  { name: 'Blazing Sky Realm', tier: 6, requiredRank: TrainerRank.DIAMOND, minLevel: 91, maxLevel: 100, boss: 'Moltres', types: ['fire', 'flying'] },
  { name: 'Freezing Gust Realm', tier: 6, requiredRank: TrainerRank.DIAMOND, minLevel: 91, maxLevel: 100, boss: 'Articuno', types: ['ice', 'flying'] },
  { name: 'Ocean Trench Realm', tier: 6, requiredRank: TrainerRank.DIAMOND, minLevel: 91, maxLevel: 100, boss: 'Lugia', types: ['psychic', 'water'] },
  { name: 'Rainbow Horizon Realm', tier: 6, requiredRank: TrainerRank.DIAMOND, minLevel: 91, maxLevel: 100, boss: 'Ho-Oh', types: ['fire', 'fairy'] },
  { name: 'Eon Sky Realm', tier: 6, requiredRank: TrainerRank.DIAMOND, minLevel: 91, maxLevel: 100, boss: 'Latios', types: ['dragon', 'psychic'] },

  // Tier 7: Epic
  { name: 'Time Realm', tier: 7, requiredRank: TrainerRank.EPIC, minLevel: 101, maxLevel: 120, boss: 'Dialga', types: ['steel', 'dragon'] },
  { name: 'Space Realm', tier: 7, requiredRank: TrainerRank.EPIC, minLevel: 101, maxLevel: 120, boss: 'Palkia', types: ['water', 'dragon'] },
  { name: 'Distortion Realm', tier: 7, requiredRank: TrainerRank.EPIC, minLevel: 101, maxLevel: 120, boss: 'Giratina', types: ['ghost', 'dragon'] },
  { name: 'Frozen Tundra Realm', tier: 7, requiredRank: TrainerRank.EPIC, minLevel: 101, maxLevel: 120, boss: 'Kyurem', types: ['dragon', 'ice'] },
  { name: 'Truth Realm', tier: 7, requiredRank: TrainerRank.EPIC, minLevel: 101, maxLevel: 120, boss: 'Reshiram', types: ['dragon', 'fire'] },
  { name: 'Ideals Realm', tier: 7, requiredRank: TrainerRank.EPIC, minLevel: 101, maxLevel: 120, boss: 'Zekrom', types: ['dragon', 'electric'] },

  // Tier 8: Legendary
  { name: 'Dragon Peak Realm', tier: 8, requiredRank: TrainerRank.LEGENDARY, minLevel: 121, maxLevel: 150, boss: 'Rayquaza', types: ['dragon', 'flying'] },
  { name: 'Sun Core Realm', tier: 8, requiredRank: TrainerRank.LEGENDARY, minLevel: 121, maxLevel: 150, boss: 'Solgaleo', types: ['psychic', 'steel'] },
  { name: 'Moon Core Realm', tier: 8, requiredRank: TrainerRank.LEGENDARY, minLevel: 121, maxLevel: 150, boss: 'Lunala', types: ['psychic', 'ghost'] },
  { name: 'Life Tree Realm', tier: 8, requiredRank: TrainerRank.LEGENDARY, minLevel: 121, maxLevel: 150, boss: 'Xerneas', types: ['fairy', 'grass'] },
  { name: 'Death Valley Realm', tier: 8, requiredRank: TrainerRank.LEGENDARY, minLevel: 121, maxLevel: 150, boss: 'Yveltal', types: ['dark', 'flying'] },
  { name: 'Order Realm', tier: 8, requiredRank: TrainerRank.LEGENDARY, minLevel: 121, maxLevel: 150, boss: 'Zygarde', types: ['dragon', 'ground'] },
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
  'Keldeo': 'keldeo-ordinary'
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
        minLevel: realm.minLevel,
        maxLevel: realm.maxLevel,
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
