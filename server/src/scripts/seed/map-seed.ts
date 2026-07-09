import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Map Habitats & Zones...');

  const grassland = await prisma.habitat.upsert({
    where: { name: 'Grassland' },
    update: {},
    create: { name: 'Grassland' }
  });

  const water = await prisma.habitat.upsert({
    where: { name: 'Water' },
    update: {},
    create: { name: 'Water' }
  });

  const route1 = await prisma.zone.upsert({
    where: { name: 'Route 1' },
    update: {},
    create: {
      name: 'Route 1',
      habitatId: grassland.id,
      minLevel: 2,
      maxLevel: 5,
    }
  });

  const lakeOfRage = await prisma.zone.upsert({
    where: { name: 'Lake of Rage' },
    update: {},
    create: {
      name: 'Lake of Rage',
      habitatId: water.id,
      minLevel: 15,
      maxLevel: 20,
    }
  });

  // Seed Encounters for Route 1 (Pidgey=16, Rattata=19)
  await prisma.zoneEncounter.deleteMany({ where: { zoneId: route1.id } });
  await prisma.zoneEncounter.createMany({
    data: [
      { zoneId: route1.id, speciesId: 16, encounterRate: 0.5 }, // 50% Pidgey
      { zoneId: route1.id, speciesId: 19, encounterRate: 0.5 }, // 50% Rattata
    ]
  });

  // Seed Encounters for Lake of Rage (Magikarp=129, Gyarados=130)
  await prisma.zoneEncounter.deleteMany({ where: { zoneId: lakeOfRage.id } });
  await prisma.zoneEncounter.createMany({
    data: [
      { zoneId: lakeOfRage.id, speciesId: 129, encounterRate: 0.8 }, // 80% Magikarp
      { zoneId: lakeOfRage.id, speciesId: 130, encounterRate: 0.2 }, // 20% Gyarados
    ]
  });

  console.log('Map seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
