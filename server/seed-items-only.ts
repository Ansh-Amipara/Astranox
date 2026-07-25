import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedItems } from './scripts/seed/pokeapi/items.seed';

const prisma = new PrismaClient();

async function main() {
  await seedItems();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
