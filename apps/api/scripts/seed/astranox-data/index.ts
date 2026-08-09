import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'https://raw.githubusercontent.com/Ansh-Amipara/Astranox-data/feature/ansh';

async function fetchJSON(file: string) {
  console.log(`Fetching ${file} from GitHub...`);
  const response = await fetch(`${BASE_URL}/${file}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
  }
  return await response.json();
}

async function main() {
  console.log('Starting Astranox-data Seed Pipeline...');

  console.log('Clearing existing data (dropping entire database)...');
  await prisma.$runCommandRaw({ dropDatabase: 1 });

  // Types
  const types = await fetchJSON('types.json');
  console.log(`Seeding ${types.length} types...`);
  await prisma.type.createMany({ data: types });

  // Items
  const items = await fetchJSON('items.json');
  console.log(`Seeding ${items.length} items...`);
  await prisma.item.createMany({ data: items });

  // Moves
  const moves = await fetchJSON('moves.json');
  console.log(`Seeding ${moves.length} moves...`);
  await prisma.move.createMany({ data: moves });

  // Species
  const rawSpecies = await fetchJSON('species.json');
  console.log(`Seeding ${rawSpecies.length} species...`);
  const SPLIT_EVOLUTIONS: Record<number, number[]> = {
    133: [134, 135, 136, 196, 197, 470, 471, 700], // Eevee
    935: [936, 937], // Charcadet
    236: [106, 107, 237], // Tyrogue
    265: [266, 268], // Wurmple
    281: [282, 475], // Kirlia
    361: [362, 478], // Snorunt
    840: [841, 842, 1011], // Applin
  };

  const speciesMap = new Map();
  rawSpecies.forEach((s: any) => speciesMap.set(s.id, s));

  rawSpecies.forEach((s: any) => {
    let toIds: number[] = [];
    if (SPLIT_EVOLUTIONS[s.id]) {
      toIds = SPLIT_EVOLUTIONS[s.id];
    } else if (s.evolvesToId) {
      toIds = [s.evolvesToId];
    }

    toIds.forEach((targetId) => {
      const target = speciesMap.get(targetId);
      if (target) {
        target.evolvesFromId = s.id;
      }
    });
  });

  const species = rawSpecies.map((s: any) => {
    delete s.evolutionItem; // ensure this is stripped out just in case
    delete s.evolvesToId;
    s.megaEvolvesToIds = s.megaEvolvesToIds || [];
    s.gmaxEvolvesToIds = s.gmaxEvolvesToIds || [];
    return s;
  });
  await prisma.species.createMany({ data: species });

  // Learnsets
  const learnsets = await fetchJSON('learnsets.json');
  console.log(`Seeding ${learnsets.length} learnsets...`);
  const cleanLearnsets = learnsets.map((l: any) => {
    const { id, ...rest } = l;
    return rest;
  });
  await prisma.pokemonLearnset.createMany({ data: cleanLearnsets });

  // Shop
  const shop = await fetchJSON('shop.json');
  console.log(`Seeding ${shop.length} shop items...`);
  const cleanShop = shop.map((s: any) => {
    const { id, ...rest } = s;
    return rest;
  });
  await prisma.astralMoveShop.createMany({ data: cleanShop });

  console.log('Astranox-data Seed Pipeline Complete!');
}

main()
  .catch((err) => {
    console.error('Fatal error during seed pipeline:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
