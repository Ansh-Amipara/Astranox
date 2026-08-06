import { seedMoves } from './moves.seed';
import { seedRanksAndLearnsets } from './learnset-generator';
import { seedAstralMoveShop } from './shop.seed';

async function main() {
  console.log('Starting Custom Moves and Learnset Seeding...');
  await seedMoves();
  await seedRanksAndLearnsets();
  await seedAstralMoveShop();
  console.log('Custom Seeding Pipeline Completed!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
