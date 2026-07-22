import { PrismaClient, TrainerType } from '@prisma/client';
import { env } from '../../src/config/env';

const prisma = new PrismaClient();

const EXAMINERS = [
  {
    name: 'E Rank Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 197, level: 61 }, // Umbreon
      { speciesId: 196, level: 61 }, // Espeon
      { speciesId: 448, level: 61 }, // Lucario
    ]
  },
  {
    name: 'D Rank Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 3, level: 121 },   // Venusaur
      { speciesId: 6, level: 121 },   // Charizard
      { speciesId: 9, level: 121 },   // Blastoise
    ]
  },
  {
    name: 'C Rank Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 130, level: 201 }, // Gyarados
      { speciesId: 143, level: 201 }, // Snorlax
      { speciesId: 376, level: 201 }, // Metagross
    ]
  },
  {
    name: 'B Rank Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 248, level: 401 }, // Tyranitar
      { speciesId: 373, level: 401 }, // Salamence
      { speciesId: 149, level: 401 }, // Dragonite
    ]
  },
  {
    name: 'A Rank Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 445, level: 701 }, // Garchomp
      { speciesId: 635, level: 701 }, // Hydreigon
      { speciesId: 612, level: 701 }, // Haxorus
    ]
  },
  {
    name: 'S Rank Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 468, level: 1101 }, // Togekiss
      { speciesId: 350, level: 1101 }, // Milotic
      { speciesId: 637, level: 1101 }, // Volcarona
    ]
  },
  {
    name: 'S+ Rank Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 144, level: 1401 }, // Articuno
      { speciesId: 145, level: 1401 }, // Zapdos
      { speciesId: 146, level: 1401 }, // Moltres
    ]
  },
  {
    name: 'SS Rank Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 243, level: 1701 }, // Raikou
      { speciesId: 244, level: 1701 }, // Entei
      { speciesId: 245, level: 1701 }, // Suicune
    ]
  },
  {
    name: 'SS+ Rank Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 377, level: 2001 }, // Regirock
      { speciesId: 378, level: 2001 }, // Regice
      { speciesId: 379, level: 2001 }, // Registeel
    ]
  },
  {
    name: 'SSS Rank Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 249, level: 3001 }, // Lugia
      { speciesId: 250, level: 3001 }, // Ho-Oh
      { speciesId: 251, level: 3001 }, // Celebi
    ]
  },
  {
    name: 'SSS+ Rank Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 483, level: 4001 }, // Dialga
      { speciesId: 484, level: 4001 }, // Palkia
      { speciesId: 487, level: 4001 }, // Giratina
    ]
  }
];

async function seedRankExaminers() {
  if (!env.CLOUDINARY_CLOUD_NAME) throw new Error('CLOUDINARY_CLOUD_NAME is required in .env');
  console.log('Seeding Rank Examiners (Cloudinary sprites)...');

  // Clear old examiners to avoid duplicates or orphaned levels
  await prisma.npcTrainer.deleteMany({
    where: { trainerClass: 'Examiner' }
  });

  for (const ex of EXAMINERS) {
    let trainer = await prisma.npcTrainer.findFirst({
      where: { name: ex.name, trainerClass: ex.trainerClass }
    });

    if (!trainer) {
      trainer = await prisma.npcTrainer.create({
        data: {
          name: ex.name,
          trainerClass: ex.trainerClass,
          trainerType: ex.trainerType,
          region: ex.region,
          spriteUrl: `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/trainers/veteran.png`,
          rewardMoney: 10000,
        }
      });

      for (let i = 0; i < ex.pokemon.length; i++) {
        const p = ex.pokemon[i];

        const npcPokemon = await prisma.npcTrainerPokemon.create({
          data: {
            npcTrainerId: trainer.id,
            speciesId: p.speciesId,
            level: p.level,
            position: i,
            ivHp: 31, ivAttack: 31, ivDefense: 31, ivSpAtk: 31, ivSpDef: 31, ivSpeed: 31,
          }
        });

        // Add tackle just to not crash, ideally we'd fetch real moves
        await prisma.npcTrainerPokemonMove.create({
          data: {
            npcTrainerPokemonId: npcPokemon.id,
            moveId: 33, // Tackle
            slot: 0
          }
        });
      }
      console.log(`Created ${ex.name}`);
    } else {
      console.log(`${ex.name} already exists.`);
    }
  }

  console.log('Done!');
}

seedRankExaminers().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
