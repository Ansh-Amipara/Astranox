import { seedTypes } from './types.seed';
import { seedMoves } from './moves.seed';
import { seedSpecies } from './species.seed';
import { seedItems } from './items.seed';

async function main() {
  console.log('Starting PokeAPI Seed Pipeline...');
  
  await seedTypes();
  await seedMoves();
  await seedSpecies();
  await seedItems();
  
  console.log('PokeAPI Seed Pipeline Complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error during seed pipeline:', err);
  process.exit(1);
});
