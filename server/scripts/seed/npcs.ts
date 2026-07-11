import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NPCs...');
  await prisma.npcTrainer.deleteMany(); // reset

  const brock = await prisma.npcTrainer.create({
    data: {
      name: 'Brock',
      spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/brock.png',
      trainerClass: 'Gym Leader',
      rewardMoney: 1500,
      badgeName: 'Boulder Badge',
      party: {
        create: [
          { speciesId: 74, level: 12, position: 0, move1: 'tackle', move2: 'defense-curl' },
          { speciesId: 95, level: 14, position: 1, move1: 'tackle', move2: 'bind' }
        ]
      }
    }
  });

  const misty = await prisma.npcTrainer.create({
    data: {
      name: 'Misty',
      spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/misty.png',
      trainerClass: 'Gym Leader',
      rewardMoney: 2100,
      badgeName: 'Cascade Badge',
      party: {
        create: [
          { speciesId: 120, level: 18, position: 0, move1: 'tackle', move2: 'water-gun' },
          { speciesId: 121, level: 21, position: 1, move1: 'tackle', move2: 'water-gun', move3: 'bubble-beam' }
        ]
      }
    }
  });

  const surge = await prisma.npcTrainer.create({
    data: {
      name: 'Lt. Surge',
      spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/surge.png',
      trainerClass: 'Gym Leader',
      rewardMoney: 2400,
      badgeName: 'Thunder Badge',
      party: {
        create: [
          { speciesId: 100, level: 21, position: 0, move1: 'tackle', move2: 'thunder-shock' },
          { speciesId: 25, level: 18, position: 1, move1: 'tackle', move2: 'thunder-shock' },
          { speciesId: 26, level: 24, position: 2, move1: 'tackle', move2: 'thunderbolt' }
        ]
      }
    }
  });
  
  const erika = await prisma.npcTrainer.create({
    data: {
      name: 'Erika',
      spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/erika.png',
      trainerClass: 'Gym Leader',
      rewardMoney: 2900,
      badgeName: 'Rainbow Badge',
      party: {
        create: [
          { speciesId: 71, level: 29, position: 0, move1: 'tackle', move2: 'razor-leaf' },
          { speciesId: 114, level: 24, position: 1, move1: 'tackle', move2: 'vine-whip' },
          { speciesId: 45, level: 29, position: 2, move1: 'tackle', move2: 'petal-dance' }
        ]
      }
    }
  });

  console.log('NPCs seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
