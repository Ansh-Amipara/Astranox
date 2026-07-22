import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

export async function seedPokemonDBSpecies(prisma: PrismaClient) {
  console.log('Fetching PokemonDB species...');
  const res = await fetch('https://pokemondb.net/pokedex/all');
  const html = await res.text();
  const $ = cheerio.load(html);

  const rows = $('#pokedex tbody tr').toArray();
  console.log(`Found ${rows.length} Pokemon entries.`);

  // Load types map from DB to get IDs
  const dbTypes = await prisma.type.findMany();
  const typeToId = new Map(dbTypes.map(t => [t.name.toUpperCase(), t.id]));

  let count = 0;
  let formCounter = 0;

  for (const row of rows) {
    const $row = $(row);
    const cells = $row.find('td');
    
    // Dex Number
    const dexNumText = $(cells[0]).text().trim(); // e.g. "001"
    const dexNum = parseInt(dexNumText, 10);
    if (isNaN(dexNum)) continue;

    // Name
    const nameCell = $(cells[1]);
    const baseName = nameCell.find('.ent-name').text().trim();
    const subName = nameCell.find('.text-muted').text().trim();
    
    let fullName = baseName;
    let formName = null;
    let isMega = false;
    let isGmax = false;
    let baseSpeciesId = null;
    let syntheticId = dexNum;

    if (subName) {
      formName = subName;
      fullName = `${baseName} ${subName}`;
      baseSpeciesId = dexNum;
      formCounter++;
      
      if (subName.includes('Mega')) {
        isMega = true;
        syntheticId = 10000 + (dexNum * 10) + (subName.includes(' X') ? 1 : (subName.includes(' Y') ? 2 : 0));
      } else if (subName.includes('Gigantamax')) {
        isGmax = true;
        syntheticId = 20000 + dexNum;
      } else {
        // Other forms (Alolan, Galarian, Origin, etc)
        syntheticId = 30000 + formCounter;
      }
    }

    // Types
    const typeAnchors = $(cells[2]).find('a').toArray();
    const types = typeAnchors.map(a => $(a).text().trim().toUpperCase());
    
    const type1Id = typeToId.get(types[0]);
    const type2Id = types.length > 1 ? typeToId.get(types[1]) : null;

    if (!type1Id) {
      console.warn(`Missing type ID for ${types[0]} on ${fullName}`);
      continue;
    }

    // Stats
    const hp = parseInt($(cells[4]).text().trim());
    const attack = parseInt($(cells[5]).text().trim());
    const defense = parseInt($(cells[6]).text().trim());
    const spAtk = parseInt($(cells[7]).text().trim());
    const spDef = parseInt($(cells[8]).text().trim());
    const speed = parseInt($(cells[9]).text().trim());

    // We can extract image URL from PokemonDB if needed, or fallback to PokeAPI sprites
    const spriteName = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const spriteUrl = `https://img.pokemondb.net/sprites/home/normal/${spriteName}.png`;

    try {
      await prisma.species.upsert({
        where: { id: syntheticId },
        update: {
          name: fullName,
          hp, attack, defense, spAtk, spDef, speed,
          type1Id, type2Id,
          formName, isMega, isGmax, baseSpeciesId,
          pokedexNumber: dexNum
        },
        create: {
          id: syntheticId,
          name: fullName,
          spriteUrl,
          hp, attack, defense, spAtk, spDef, speed,
          type1Id, type2Id,
          formName, isMega, isGmax, baseSpeciesId,
          pokedexNumber: dexNum,
          catchRate: 45, // default
          baseExp: 100
        }
      });
      count++;
      if (count % 100 === 0) console.log(`Processed ${count} species...`);
    } catch (e) {
      console.error(`Error saving ${fullName}:`, e);
    }
  }

  console.log(`Finished species sync. Processed ${count} records.`);
}
