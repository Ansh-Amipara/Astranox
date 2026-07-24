import { execSync } from 'child_process';

function main() {
  console.log('Running PokeAPI seed...');
  execSync('npx tsx scripts/seed/pokeapi/index.ts', { stdio: 'inherit' });
  
  // console.log('Running World seed...');
  // execSync('npx tsx scripts/seed/world-seed.ts', { stdio: 'inherit' });



  console.log('Running Admin seed...');
  execSync('npx tsx scripts/seed/admin.ts', { stdio: 'inherit' });
}

main();
