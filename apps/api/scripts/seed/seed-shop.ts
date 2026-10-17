import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { DEFAULT_SHOP_CATALOG, FEATURE_FLAGS } from '@astranox/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Shop Items from @astranox/constants ---');
  let createdCount = 0;
  let skippedCount = 0;

  for (const item of DEFAULT_SHOP_CATALOG) {
    const existing = await prisma.shopItem.findUnique({
      where: { key: item.key },
    });

    if (existing) {
      skippedCount++;
      continue;
    }

    await prisma.shopItem.create({
      data: {
        key: item.key,
        name: item.name,
        category: item.category,
        description: item.description,
        currency: item.currency,
        price: item.price,
        enabled: item.enabled ?? true,
        sortOrder: item.sortOrder,
        dataVersion: 1,
      },
    });
    createdCount++;
    console.log(`[+] Seeded shop item: ${item.key} (${item.name}) - ${item.price} ${item.currency}`);
  }

  console.log(`\nShopItem seeding complete. Created: ${createdCount}, Skipped: ${skippedCount}`);

  console.log('\n--- Seeding Feature Flags from @astranox/constants ---');
  for (const flag of FEATURE_FLAGS) {
    const existing = await prisma.featureFlag.findUnique({
      where: { key: flag.key },
    });

    if (!existing) {
      await prisma.featureFlag.create({
        data: {
          key: flag.key,
          name: flag.name,
          description: flag.description,
          enabled: flag.defaultValue,
        },
      });
      console.log(`[+] Seeded feature flag: ${flag.key} = ${flag.defaultValue}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Failed to seed shop items:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
