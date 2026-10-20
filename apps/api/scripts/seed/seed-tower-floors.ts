import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { generateTowerConfig } from '../../src/game/tower/generator';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding 1000 Infinity Tower Floors into DungeonFloorRule ---');

  const existingFloors = await prisma.dungeonFloorRule.findMany({
    where: {
      dungeonType: 'INFINITY_TOWER',
    },
    select: {
      floorNumber: true,
    },
  });

  const existingSet = new Set(existingFloors.map((f) => f.floorNumber));
  console.log(`Found ${existingSet.size} existing tower floors in database.`);

  const toCreate = [];
  for (let floor = 1; floor <= 1000; floor++) {
    if (existingSet.has(floor)) {
      continue;
    }

    const config = generateTowerConfig(floor);
    const enemyPool = {
      teamSize: config.teamSize,
      level: config.level,
      ivs: config.ivs,
      evolutionStage: config.evolutionStage,
      allowLegendaryMythical: config.allowLegendaryMythical,
      allowPseudoLegendary: config.allowPseudoLegendary,
      allowParadoxUltraBeast: config.allowParadoxUltraBeast,
      allowMega: config.allowMega,
      allowGmax: config.allowGmax,
    };

    const title = config.isMegaBoss
      ? `Floor ${floor} - Mega Boss`
      : config.isBoss
      ? `Floor ${floor} - Boss`
      : config.isMiniBoss
      ? `Floor ${floor} - Mini Boss`
      : `Floor ${floor}`;

    toCreate.push({
      dungeonType: 'INFINITY_TOWER' as const,
      floorNumber: floor,
      title,
      enemyPool,
      scalingFactor: 1.0,
      rewardCoins: 0,
      rewardInfinityCoins: config.rewardCoins,
      rewardXp: config.rewardXp,
      isBossFloor: config.isBoss || config.isMegaBoss,
      enabled: true,
      isArchived: false,
      sortOrder: floor,
      dataVersion: 1,
      updatedBy: 'system-seed',
    });
  }

  console.log(`Creating ${toCreate.length} missing tower floors in batches of 50...`);

  const BATCH_SIZE = 50;
  let createdCount = 0;

  for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
    const batch = toCreate.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(
      batch.map((data) =>
        prisma.dungeonFloorRule.create({
          data,
        })
      )
    );
    createdCount += batch.length;
    process.stdout.write(`\rProgress: ${createdCount} / ${toCreate.length} floors created`);
  }

  console.log('\n--- Infinity Tower Floor Seeding Complete! ---');
  console.log(`Total floors in database: ${existingSet.size + createdCount} / 1000`);
}

main()
  .catch((e) => {
    console.error('Tower seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
