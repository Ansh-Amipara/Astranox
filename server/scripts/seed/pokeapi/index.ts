import { seedTypes } from './types.seed';
import { seedMoves } from './moves.seed';
import { seedSpecies } from './species.seed';
import { seedItems } from './items.seed';
import { seedEvolutions } from './evolutions.seed';

const originalFetch = global.fetch;
global.fetch = async (...args) => {
  let retries = 5;
  while (retries > 0) {
    try {
      const res = await originalFetch(...args);
      // PokeAPI sometimes returns a 503 HTML page on rate limit
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        return res;
      }
      if (res.status === 404) return res; // Pass through 404s
      throw new Error(`Invalid response or rate limit (Status: ${res.status}, Type: ${contentType})`);
    } catch (e) {
      retries--;
      if (retries === 0) throw e;
      console.log(`PokeAPI fetch failed, retrying in 2 seconds... (${retries} retries left)`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return originalFetch(...args);
};

async function main() {
  console.log('Starting PokeAPI Seed Pipeline...');
  
  await seedTypes();
  await seedMoves();
  await seedSpecies();
  await seedItems();
  await seedEvolutions();
  
  console.log('PokeAPI Seed Pipeline Complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error during seed pipeline:', err);
  process.exit(1);
});
