// Trigger IDE reload
import { PrismaClient } from '@prisma/client';
import { runInBatches } from './utils';

const prisma = new PrismaClient();

export async function seedMoves() {
  console.log('Seeding Moves... (this will take a minute)');
  
  // We fetch up to 937 moves per AGENTS.md requirements, but using pagination is safer
  let url: string | null = 'https://pokeapi.co/api/v2/move?limit=100';
  let totalSeeded = 0;
  
  while (url) {
    const res: any = await fetch(url);
    const data: any = await res.json();
    
    await runInBatches(data.results, 20, async (result: any) => {
      const moveRes = await fetch(result.url);
      const moveData = await moveRes.json();
      
      if (moveData.power == null || moveData.power < 1) return;
      if (moveData.type.name === 'shadow' || moveData.type.name === 'unknown') return;

      const typeId = parseInt(moveData.type.url.split('/').filter(Boolean).pop()!);
      
      await prisma.move.upsert({
        where: { id: moveData.id },
        update: {
          name: moveData.name,
          typeId: typeId,
          power: moveData.power,
          damageClass: moveData.damage_class?.name || 'physical',
        },
        create: {
          id: moveData.id,
          name: moveData.name,
          typeId: typeId,
          power: moveData.power,
          damageClass: moveData.damage_class?.name || 'physical',
        },
      });
    });

    totalSeeded += data.results.length;
    console.log(`Seeded ${totalSeeded} moves...`);
    url = data.next;
  }
  
  console.log('Successfully finished seeding moves.');
}
