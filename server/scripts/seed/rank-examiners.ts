import { PrismaClient, TrainerType } from '@prisma/client';
import { env } from '../../src/config/env';

const prisma = new PrismaClient();

const EXAMINERS = [
  {
    name: 'Bronze Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 133, level: 20 }, // Eevee
      { speciesId: 25, level: 20 },  // Pikachu
      { speciesId: 52, level: 20 },  // Meowth
    ]
  },
  {
    name: 'Silver Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 197, level: 40 }, // Umbreon
      { speciesId: 196, level: 40 }, // Espeon
      { speciesId: 448, level: 40 }, // Lucario
    ]
  },
  {
    name: 'Gold Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 3, level: 60 },   // Venusaur
      { speciesId: 6, level: 60 },   // Charizard
      { speciesId: 9, level: 60 },   // Blastoise
    ]
  },
  {
    name: 'Platinum Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 130, level: 80 }, // Gyarados
      { speciesId: 143, level: 80 }, // Snorlax
      { speciesId: 376, level: 80 }, // Metagross
    ]
  },
  {
    name: 'Adamantite Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 248, level: 100 }, // Tyranitar
      { speciesId: 373, level: 100 }, // Salamence
      { speciesId: 149, level: 100 }, // Dragonite
    ]
  },
  {
    name: 'Diamond Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 445, level: 120 }, // Garchomp
      { speciesId: 635, level: 120 }, // Hydreigon
      { speciesId: 612, level: 120 }, // Haxorus
    ]
  },
  {
    name: 'Crystal Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 468, level: 140 }, // Togekiss
      { speciesId: 350, level: 140 }, // Milotic
      { speciesId: 637, level: 140 }, // Volcarona
    ]
  },
  {
    name: 'Epic Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 144, level: 160 }, // Articuno
      { speciesId: 145, level: 160 }, // Zapdos
      { speciesId: 146, level: 160 }, // Moltres
    ]
  },
  {
    name: 'Heroic Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 243, level: 180 }, // Raikou
      { speciesId: 244, level: 180 }, // Entei
      { speciesId: 245, level: 180 }, // Suicune
    ]
  },
  {
    name: 'Sovereign Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 377, level: 200 }, // Regirock
      { speciesId: 378, level: 200 }, // Regice
      { speciesId: 379, level: 200 }, // Registeel
    ]
  },
  {
    name: 'Legendary Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 249, level: 250 }, // Lugia
      { speciesId: 250, level: 250 }, // Ho-Oh
      { speciesId: 251, level: 250 }, // Celebi
    ]
  },
  {
    name: 'Divine Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 483, level: 300 }, // Dialga
      { speciesId: 484, level: 300 }, // Palkia
      { speciesId: 487, level: 300 }, // Giratina
    ]
  },
  {
    name: 'Celestial Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 643, level: 350 }, // Reshiram
      { speciesId: 644, level: 350 }, // Zekrom
      { speciesId: 646, level: 350 }, // Kyurem
    ]
  },
  {
    name: 'Primordial Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 383, level: 400 }, // Groudon
      { speciesId: 382, level: 400 }, // Kyogre
      { speciesId: 384, level: 400 }, // Rayquaza
    ]
  },
  {
    name: 'Mythical Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 150, level: 500 }, // Mewtwo
      { speciesId: 151, level: 500 }, // Mew
      { speciesId: 386, level: 500 }, // Deoxys
    ]
  },
  {
    name: 'Infinity Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 716, level: 750 }, // Xerneas
      { speciesId: 717, level: 750 }, // Yveltal
      { speciesId: 718, level: 750 }, // Zygarde
    ]
  },
  {
    name: 'Eternal Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 888, level: 1000 }, // Zacian
      { speciesId: 889, level: 1000 }, // Zamazenta
      { speciesId: 890, level: 1000 }, // Eternatus
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
