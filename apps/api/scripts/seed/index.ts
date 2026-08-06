import { execSync } from 'child_process';

function main() {
  console.log('Running Astranox-data seed...');
  execSync('npx tsx scripts/seed/astranox-data/index.ts', { stdio: 'inherit' });
  
  // console.log('Running World seed...');
  // execSync('npx tsx scripts/seed/world-seed.ts', { stdio: 'inherit' });



  console.log('Running Admin seed...');
  execSync('npx tsx scripts/seed/admin.ts', { stdio: 'inherit' });
}

main();
