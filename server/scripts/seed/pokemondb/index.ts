import { PrismaClient } from '@prisma/client';
import { seedPokemonDBSpecies } from './species.seed';
import { seedPokemonDBMoves } from './moves.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('--- PokemonDB Seed Start ---');
  
  // Note: Assuming Types are already seeded by PokeAPI or another initial seeder
  const typesCount = await prisma.type.count();
  if (typesCount === 0) {
    console.error('Error: Types not found in DB. Please run the base PokeAPI type seeder first.');
    process.exit(1);
  }

  await seedPokemonDBSpecies(prisma);
  await seedPokemonDBMoves(prisma);
  
  console.log('--- PokemonDB Seed Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
