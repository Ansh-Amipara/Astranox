// Trigger IDE reload
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export async function seedMoves() {
  console.log('Seeding Custom Moves... (Clearing existing data first)');
  
  // Wipe dependent tables first
  await prisma.pokemonEquippedMoves.deleteMany({});
  await prisma.playerUnlockedMoves.deleteMany({});
  await prisma.astralMoveShop.deleteMany({});
  await prisma.pokemonLearnset.deleteMany({});
  await prisma.move.deleteMany({});
  
  const mdPath = path.resolve(__dirname, '../../../../docs/story/Astranox Pokemon Moves.md');
  const mdContent = fs.readFileSync(mdPath, 'utf-8');

  // We need to fetch DB types to map type names to type IDs
  const dbTypes = await prisma.type.findMany();
  const typeMap = new Map(dbTypes.map(t => [t.name.toLowerCase(), t.id]));
  
  const movesToInsert = [];
  let currentType = '';
  let idCounter = 10000;
  
  const insertedNames = new Set();
  
  const lines = mdContent.split('\n');
  for (const line of lines) {
    const typeMatch = line.match(/^([a-z]+) type\s*:/i);
    if (typeMatch) {
      currentType = typeMatch[1].toLowerCase();
      continue;
    }
    
    // table row format: | 20 | Ember Strike | Flame Spark |
    const rowMatch = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
    if (rowMatch) {
      const power = parseInt(rowMatch[1], 10);
      let physicalName = rowMatch[2].trim();
      let specialName = rowMatch[3].trim();
      
      const typeId = typeMap.get(currentType);
      if (!typeId) {
        console.warn(`Type not found in DB: ${currentType}`);
        continue;
      }
      
      if (insertedNames.has(physicalName)) {
        physicalName = `${physicalName} (${currentType})`;
      }
      insertedNames.add(physicalName);

      if (insertedNames.has(specialName)) {
        specialName = `${specialName} (${currentType})`;
      }
      insertedNames.add(specialName);
      
      // We will store the original name exactly as it is in the MD file
      movesToInsert.push({
        id: idCounter++,
        name: physicalName,
        typeId,
        power,
        damageClass: 'physical'
      });
      
      movesToInsert.push({
        id: idCounter++,
        name: specialName,
        typeId,
        power,
        damageClass: 'special'
      });
    }
  }

  console.log(`Parsed ${movesToInsert.length} custom moves. Inserting...`);
  
  await prisma.move.createMany({
    data: movesToInsert,
  });

  console.log('Successfully seeded custom moves.');
}
