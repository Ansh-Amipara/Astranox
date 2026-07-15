import { PrismaClient } from '@prisma/client';
import { bossTrainers } from './data/boss-trainers';
import { villainTrainers } from './data/villains';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NPCs...');
  await prisma.npcTrainer.deleteMany(); // reset

  // Preload species to map names to IDs quickly
  const allSpecies = await prisma.species.findMany({ select: { id: true, name: true } });
  const speciesMap = new Map<string, number>();
  for (const s of allSpecies) {
    speciesMap.set(s.name.toLowerCase(), s.id);
  }

  let successCount = 0;

  const allTrainers = [...bossTrainers, ...villainTrainers];

  for (const trainer of allTrainers) {
    const partyCreateData: any[] = [];
    let position = 0;
    
    for (const [speciesName, level] of trainer.party) {
      const speciesId = speciesMap.get(speciesName.toLowerCase());
      if (speciesId === undefined) {
        console.warn(`[WARNING] Could not find species "${speciesName}" for trainer ${trainer.name}. Skipping this Pokemon.`);
        continue;
      }
      partyCreateData.push({
        speciesId,
        level,
        position
      });
      position++;
    }

    if (partyCreateData.length === 0) {
      console.warn(`[WARNING] Trainer ${trainer.name} has no valid Pokemon. Skipping trainer.`);
      continue;
    }

    // Seed the base version
    await prisma.npcTrainer.create({
      data: {
        name: trainer.name,
        region: trainer.region,
        spriteUrl: `https://play.pokemonshowdown.com/sprites/trainers/${trainer.spriteId}.png`,
        trainerClass: trainer.trainerClass,
        trainerType: trainer.trainerType,
        rewardMoney: trainer.rewardMoney,
        badgeName: trainer.badgeName,
        party: {
          create: partyCreateData
        }
      }
    });
    successCount++;

    // Generate scaled rematches for GYM / ELITE -> STRONG
    if (trainer.trainerType === 'GYM' || trainer.trainerType === 'ELITE') {
      const strongParty = partyCreateData.map(p => ({
        ...p,
        level: Math.floor(50 + (p.level / 70) * 25) // scales to roughly 50-75
      }));
      
      await prisma.npcTrainer.create({
        data: {
          name: `${trainer.name} (Strong)`,
          region: trainer.region,
          spriteUrl: `https://play.pokemonshowdown.com/sprites/trainers/${trainer.spriteId}.png`,
          trainerClass: `${trainer.trainerClass} Rematch`,
          trainerType: 'STRONG',
          rewardMoney: trainer.rewardMoney * 2,
          badgeName: trainer.badgeName,
          party: {
            create: strongParty
          }
        }
      });
      successCount++;
    }

    // Generate scaled rematches for CHAMPION -> SUPER
    if (trainer.trainerType === 'CHAMPION') {
      const superParty = partyCreateData.map(p => ({
        ...p,
        level: Math.floor(80 + (p.level / 80) * 10) // scales to roughly 80-90
      }));
      
      await prisma.npcTrainer.create({
        data: {
          name: `${trainer.name} (Super)`,
          region: trainer.region,
          spriteUrl: `https://play.pokemonshowdown.com/sprites/trainers/${trainer.spriteId}.png`,
          trainerClass: 'Super Champion',
          trainerType: 'SUPER',
          rewardMoney: trainer.rewardMoney * 3,
          party: {
            create: superParty
          }
        }
      });
      successCount++;
    }
  }

  console.log(`Successfully seeded ${successCount} NPCs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
