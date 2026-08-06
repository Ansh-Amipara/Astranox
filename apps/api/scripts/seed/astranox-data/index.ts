import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'https://raw.githubusercontent.com/Ansh-Amipara/Astranox-data/main';

async function fetchJSON(file: string) {
  console.log(`Fetching ${file}...`);
  const response = await fetch(`${BASE_URL}/${file}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
  }
  return response.json();
}

async function main() {
  console.log('Starting Astranox-data Seed Pipeline...');

  // Types
  const types = await fetchJSON('types.json');
  console.log(`Seeding ${types.length} types...`);
  await prisma.type.deleteMany();
  await prisma.type.createMany({ data: types });

  // Items
  const items = await fetchJSON('items.json');
  console.log(`Seeding ${items.length} items...`);
  await prisma.item.deleteMany();
  await prisma.item.createMany({ data: items });

  // Moves
  const moves = await fetchJSON('moves.json');
  console.log(`Seeding ${moves.length} moves...`);
  await prisma.move.deleteMany();
  await prisma.move.createMany({ data: moves });

  // Species
  const species = await fetchJSON('species.json');
  console.log(`Seeding ${species.length} species...`);
  await prisma.species.deleteMany();
  await prisma.species.createMany({ data: species });

  // Learnsets
  const learnsets = await fetchJSON('learnsets.json');
  console.log(`Seeding ${learnsets.length} learnsets...`);
  // Remove objectid from learnsets before inserting
  const cleanLearnsets = learnsets.map((l: any) => {
    const { id, ...rest } = l;
    return rest;
  });
  await prisma.pokemonLearnset.deleteMany();
  await prisma.pokemonLearnset.createMany({ data: cleanLearnsets });

  // Shop
  const shop = await fetchJSON('shop.json');
  console.log(`Seeding ${shop.length} shop items...`);
  const cleanShop = shop.map((s: any) => {
    const { id, ...rest } = s;
    return rest;
  });
  await prisma.astralMoveShop.deleteMany();
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
