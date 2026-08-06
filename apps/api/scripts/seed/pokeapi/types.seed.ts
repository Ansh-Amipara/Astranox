import { PrismaClient } from '@prisma/client';
import { runInBatches } from './utils';

const prisma = new PrismaClient();

export async function seedTypes() {
  console.log('Seeding Types...');
  const res = await fetch('https://pokeapi.co/api/v2/type?limit=100');
  const data = await res.json();
  
  await runInBatches(data.results, 5, async (result: any) => {
    const typeRes = await fetch(result.url);
    const typeData = await typeRes.json();
    
    // We ingest all types from PokeAPI (including 'unknown' and 'shadow' if they exist)
    await prisma.type.upsert({
      where: { id: typeData.id },
      update: {
        name: typeData.name,
        damageRelations: typeData.damage_relations,
      },
      create: {
        id: typeData.id,
        name: typeData.name,
        damageRelations: typeData.damage_relations,
      },
    });
  });

  console.log(`Successfully seeded ${data.results.length} types.`);
}
