import { execSync } from 'child_process';

function main() {
  console.log('Running Astranox-data seed...');
  execSync('npx tsx scripts/seed/astranox-data/index.ts', { stdio: 'inherit' });
  
  console.log('Running Realms seed...');
  execSync('npx tsx scripts/seed/seed-realms.ts', { stdio: 'inherit' });



  console.log('Running Admin seed...');
  execSync('npx tsx scripts/seed/admin.ts', { stdio: 'inherit' });
}

main();
