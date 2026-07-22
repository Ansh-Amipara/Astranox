import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

export async function seedPokemonDBMoves(prisma: PrismaClient) {
  console.log('Fetching PokemonDB moves...');
  const res = await fetch('https://pokemondb.net/move/all');
  const html = await res.text();
  const $ = cheerio.load(html);

  const rows = $('#moves tbody tr').toArray();
  console.log(`Found ${rows.length} moves.`);

  const dbTypes = await prisma.type.findMany();
  const typeToId = new Map(dbTypes.map(t => [t.name.toUpperCase(), t.id]));

  // Get max move ID to avoid conflicts if appending
  const maxMove = await prisma.move.aggregate({
    _max: { id: true }
  });
  let moveId = (maxMove._max.id || 0) + 1;
  let count = 0;

  for (const row of rows) {
    const $row = $(row);
    const cells = $row.find('td');

    const name = $(cells[0]).text().trim();
    const typeName = $(cells[1]).text().trim().toUpperCase();
    const category = $(cells[2]).text().trim().toLowerCase();
    
    let power = parseInt($(cells[3]).text().trim(), 10);
    let accuracy = parseInt($(cells[4]).text().trim(), 10);
    
    if (isNaN(power)) power = null as any;
    if (isNaN(accuracy)) accuracy = null as any;

    const typeId = typeToId.get(typeName);
    if (!typeId) {
      console.warn(`Missing type ID for ${typeName} on move ${name}`);
      continue;
    }

    try {
      const existingMove = await prisma.move.findUnique({ where: { name } });
      if (existingMove) {
        await prisma.move.update({
          where: { name },
          data: {
            typeId,
            power,
            accuracy,
            damageClass: category,
          }
        });
      } else {
        await prisma.move.create({
          data: {
            id: moveId++,
            name,
            typeId,
            power,
            accuracy,
            priority: 0,
            damageClass: category
          }
        });
      }
      count++;
      if (count % 100 === 0) console.log(`Processed ${count} moves...`);
    } catch (e) {
      console.error(`Error saving move ${name}:`, e);
    }
  }

  console.log(`Finished moves sync. Processed ${count} records.`);
}
