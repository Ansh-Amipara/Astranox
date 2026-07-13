import { PrismaClient } from '@prisma/client';
import { runInBatches } from './utils';

const prisma = new PrismaClient();

export async function seedEvolutions() {
  console.log('Seeding Evolutions... (this will take a minute)');
  
  // PokeAPI currently has around 541 evolution chains.
  // We'll safely loop up to 600 just in case.
  const ids = Array.from({ length: 600 }, (_, i) => i + 1);

  await runInBatches(ids, 20, async (id: number) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${id}`);
      if (!res.ok) return; // Skip if missing or empty
      const data = await res.json();
      
      const chain = data.chain;
      await processEvolutionNode(chain);
    } catch (e) {
      // Ignore 404s for gaps in evolution-chain IDs
    }
  });

  console.log('Successfully seeded evolutions.');
}

async function processEvolutionNode(node: any) {
  if (!node || !node.evolves_to || node.evolves_to.length === 0) return;

  const currentSpeciesId = parseInt(node.species.url.split('/').filter(Boolean).pop()!);

  for (const evolution of node.evolves_to) {
    const evolvesToId = parseInt(evolution.species.url.split('/').filter(Boolean).pop()!);
    const details = evolution.evolution_details[0]; // Take the first method

    if (!details) {
      await processEvolutionNode(evolution);
      continue;
    }

    let evolutionLevel = null;
    let evolutionItem = null;

    if (details.trigger?.name === 'level-up') {
      evolutionLevel = details.min_level; // Might be null if it's happiness/time based
    } else if (details.trigger?.name === 'use-item') {
      evolutionItem = details.item?.name;
    }

    // Only set if we have a valid criteria (level or item)
    if (evolutionLevel || evolutionItem) {
      try {
        await prisma.species.update({
          where: { id: currentSpeciesId },
          data: {
            evolutionLevel,
            evolutionItem,
            evolvesToId
          }
        });
      } catch (e) {
        // Ignored if species doesn't exist in DB (e.g. later gen not seeded)
      }
    }

    // Recursively process next tier (e.g. Bulbasaur -> Ivysaur -> Venusaur)
    await processEvolutionNode(evolution);
  }
}
