import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const dataDir = path.join(__dirname, '../../Astranox-data');

async function exportData() {
  console.log('Starting data export...');

  // Ensure directory exists
  await fs.mkdir(dataDir, { recursive: true });

  const exportConfig = [
    { name: 'types.json', model: prisma.type },
    { name: 'items.json', model: prisma.item },
    { name: 'moves.json', model: prisma.move },
    { name: 'species.json', model: prisma.species },
    { name: 'learnsets.json', model: prisma.pokemonLearnset },
    { name: 'shop.json', model: prisma.astralMoveShop }
  ];

  for (const { name, model } of exportConfig) {
    console.log(`Exporting ${name}...`);
    // @ts-ignore
    const data = await model.findMany();
    await fs.writeFile(
      path.join(dataDir, name),
      JSON.stringify(data, null, 2),
      'utf8'
    );
    console.log(`Finished exporting ${name}. Count: ${data.length}`);
  }

  console.log('Data export complete!');
}

exportData()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
