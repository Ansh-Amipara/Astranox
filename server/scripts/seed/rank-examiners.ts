import { PrismaClient, TrainerType } from '@prisma/client';

const prisma = new PrismaClient();

const EXAMINERS = [
  {
    name: 'Bronze Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 133, level: 25 }, // Eevee
      { speciesId: 25, level: 25 },  // Pikachu
    ]
  },
  {
    name: 'Silver Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 197, level: 45 }, // Umbreon
      { speciesId: 196, level: 45 }, // Espeon
      { speciesId: 448, level: 45 }, // Lucario
    ]
  },
  {
    name: 'Gold Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 3, level: 65 },   // Venusaur
      { speciesId: 6, level: 65 },   // Charizard
      { speciesId: 9, level: 65 },   // Blastoise
    ]
  },
  {
    name: 'Platinum Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 130, level: 85 }, // Gyarados
      { speciesId: 143, level: 85 }, // Snorlax
      { speciesId: 376, level: 85 }, // Metagross
    ]
  },
  {
    name: 'Diamond Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 445, level: 95 }, // Garchomp
      { speciesId: 635, level: 95 }, // Hydreigon
      { speciesId: 612, level: 95 }, // Haxorus
    ]
  },
  {
    name: 'Epic Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 144, level: 105 }, // Articuno
      { speciesId: 145, level: 105 }, // Zapdos
      { speciesId: 146, level: 105 }, // Moltres
    ]
  },
  {
    name: 'Legendary Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 243, level: 125 }, // Raikou
      { speciesId: 244, level: 125 }, // Entei
      { speciesId: 245, level: 125 }, // Suicune
    ]
  },
  {
    name: 'Mythical Examiner',
    trainerClass: 'Examiner',
    trainerType: TrainerType.NORMAL,
    region: 'Global',
    pokemon: [
      { speciesId: 382, level: 160 }, // Kyogre
      { speciesId: 383, level: 160 }, // Groudon
      { speciesId: 384, level: 160 }, // Rayquaza
    ]
  }
];

async function seedRankExaminers() {
  console.log('Seeding Rank Examiners...');
  
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
          spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/veteran.png',
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
