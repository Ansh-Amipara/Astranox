import { seedRanksAndLearnsets } from './learnset-generator';

async function main() {
  await seedRanksAndLearnsets();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
