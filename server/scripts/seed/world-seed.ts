import { PrismaClient, AreaType } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Starting Custom 2D World Map seed...');

  // 1. Wipe existing world data
  await prisma.worldConnection.deleteMany();
  await prisma.spawnEntry.deleteMany();
  await prisma.spawnGroup.deleteMany();
  await prisma.gameMap.deleteMany();
  await prisma.area.deleteMany();
  await prisma.region.deleteMany();
  await prisma.continent.deleteMany();
  await prisma.world.deleteMany();

  // 2. Create World
  const world = await prisma.world.create({
    data: {
      name: 'Astranox',
      description: 'A vast world filled with mysteries and Pokémon.'
    }
  });
  console.log('Created World:', world.name);

  // 3. Create Continent
  const continent = await prisma.continent.create({
    data: {
      name: 'Aethelgard',
      description: 'The central continent where your journey begins.',
      worldId: world.id
    }
  });

  // 4. Create Regions
  const starterRegion = await prisma.region.create({
    data: { 
      name: 'Starter Plains', 
      description: 'Gentle grassy plains.', 
      continentId: continent.id,
      imageUrl: '/maps/starter_plains_1783758561849.png'
    }
  });
  const caveRegion = await prisma.region.create({
    data: { 
      name: 'Crystal Cave', 
      description: 'Underground network.', 
      continentId: continent.id,
      imageUrl: '/maps/crystal_cave_1783758574862.png'
    }
  });
  const volcanoRegion = await prisma.region.create({
    data: { 
      name: 'Volcano Island', 
      description: 'Active volcano.', 
      continentId: continent.id,
      imageUrl: '/maps/volcano_island_1783758586490.png'
    }
  });

  // Helper to fetch actual species from the DB to ensure they exist
  const speciesMap: Record<string, number> = {};
  const commonNames = ['pidgey', 'rattata', 'caterpie', 'weedle', 'zubat', 'geodude', 'magmar'];
  for (const name of commonNames) {
    const s = await prisma.species.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
    if (s) speciesMap[name] = s.id;
  }
  const getSpeciesId = (name: string) => speciesMap[name.toLowerCase()] || 1;

  // 5. Create Areas
  const routeArea = await prisma.area.create({
    data: { name: 'Route 1', areaType: AreaType.ROUTE, regionId: starterRegion.id }
  });
  const townArea = await prisma.area.create({
    data: { name: 'Oak Town', areaType: AreaType.TOWN, regionId: starterRegion.id }
  });
  const forestArea = await prisma.area.create({
    data: { name: 'Forest', areaType: AreaType.WILDERNESS, regionId: starterRegion.id }
  });
  const caveArea = await prisma.area.create({
    data: { name: 'Mt. Moon', areaType: AreaType.CAVE, regionId: caveRegion.id }
  });
  const volcanoArea = await prisma.area.create({
    data: { name: 'Cinnabar Volcano', areaType: AreaType.DUNGEON, regionId: volcanoRegion.id }
  });

  // 6. Create Maps with X, Y coordinates
  const route1 = await prisma.gameMap.create({
    data: {
      name: 'Route 1',
      theme: 'Grassland',
      areaId: routeArea.id,
      worldX: 400,
      worldY: 500,
      difficulty: 1,
      mapImage: '/maps/starter_plains_1783758561849.png',
      spawnGroups: {
        create: [{ name: 'Tall Grass', entries: { create: [{ speciesId: getSpeciesId('pidgey'), minLevel: 2, maxLevel: 4, spawnRate: 100 }] } }]
      }
    }
  });

  const oakTown = await prisma.gameMap.create({
    data: {
      name: 'Oak Town',
      theme: 'Town',
      areaId: townArea.id,
      worldX: 400,
      worldY: 400,
      difficulty: 1,
      mapImage: '/maps/starter_plains_1783758561849.png',
    }
  });

  const forestRoute = await prisma.gameMap.create({
    data: {
      name: 'Forest Route',
      theme: 'Forest',
      areaId: forestArea.id,
      worldX: 400,
      worldY: 300,
      difficulty: 1,
      mapImage: '/maps/forest_route_1783758598030.png',
      spawnGroups: {
        create: [{ name: 'Deep Forest', entries: { create: [{ speciesId: getSpeciesId('caterpie'), minLevel: 3, maxLevel: 6, spawnRate: 100 }] } }]
      }
    }
  });

  const flowerGarden = await prisma.gameMap.create({
    data: {
      name: 'Flower Garden',
      theme: 'Grassland',
      areaId: forestArea.id,
      worldX: 600,
      worldY: 300,
      difficulty: 1,
      mapImage: '/maps/forest_route_1783758598030.png',
      spawnGroups: {
        create: [{ name: 'Flower Beds', entries: { create: [{ speciesId: getSpeciesId('weedle'), minLevel: 3, maxLevel: 5, spawnRate: 100 }] } }]
      }
    }
  });

  const crystalCave = await prisma.gameMap.create({
    data: {
      name: 'Crystal Cave',
      theme: 'Cave',
      areaId: caveArea.id,
      worldX: 400,
      worldY: 150,
      difficulty: 1,
      mapImage: '/maps/crystal_cave_1783758574862.png',
      spawnGroups: {
        create: [{ name: 'Cave Floor', entries: { create: [{ speciesId: getSpeciesId('zubat'), minLevel: 5, maxLevel: 8, spawnRate: 60 }, { speciesId: getSpeciesId('geodude'), minLevel: 5, maxLevel: 8, spawnRate: 40 }] } }]
      }
    }
  });

  const volcanoPeak = await prisma.gameMap.create({
    data: {
      name: 'Volcano Peak',
      theme: 'Volcano',
      areaId: volcanoArea.id,
      worldX: 400,
      worldY: 50,
      difficulty: 1,
      mapImage: '/maps/volcano_island_1783758586490.png',
      spawnGroups: {
        create: [{ name: 'Lava Pools', entries: { create: [{ speciesId: getSpeciesId('magmar'), minLevel: 25, maxLevel: 30, spawnRate: 100 }] } }]
      }
    }
  });

  // 7. Add Connections with pathData
  const createConnection = async (sourceId: string, targetId: string, type: any, path: any) => {
    await prisma.worldConnection.create({
      data: {
        sourceMapId: sourceId,
        targetMapId: targetId,
        connectionType: type,
        pathData: path
      }
    });
  };

  await createConnection(route1.id, oakTown.id, 'ROAD', [{ x: 400, y: 500 }, { x: 400, y: 400 }]);
  await createConnection(oakTown.id, route1.id, 'ROAD', [{ x: 400, y: 400 }, { x: 400, y: 500 }]);

  await createConnection(oakTown.id, forestRoute.id, 'ROAD', [{ x: 400, y: 400 }, { x: 400, y: 300 }]);
  await createConnection(forestRoute.id, oakTown.id, 'ROAD', [{ x: 400, y: 300 }, { x: 400, y: 400 }]);

  await createConnection(forestRoute.id, flowerGarden.id, 'ROAD', [{ x: 400, y: 300 }, { x: 600, y: 300 }]);
  await createConnection(flowerGarden.id, forestRoute.id, 'ROAD', [{ x: 600, y: 300 }, { x: 400, y: 300 }]);

  // Curved path example for the cave
  await createConnection(forestRoute.id, crystalCave.id, 'CAVE', [{ x: 400, y: 300 }, { x: 350, y: 225 }, { x: 400, y: 150 }]);
  await createConnection(crystalCave.id, forestRoute.id, 'CAVE', [{ x: 400, y: 150 }, { x: 350, y: 225 }, { x: 400, y: 300 }]);

  await createConnection(crystalCave.id, volcanoPeak.id, 'STAIRS', [{ x: 400, y: 150 }, { x: 400, y: 50 }]);
  await createConnection(volcanoPeak.id, crystalCave.id, 'STAIRS', [{ x: 400, y: 50 }, { x: 400, y: 150 }]);

  console.log('World Map seed completed successfully!');
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
