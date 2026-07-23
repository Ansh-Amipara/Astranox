import { PrismaClient } from '@prisma/client';
import { env } from '../../../src/config/env';

const prisma = new PrismaClient();

const ITEMS_TO_SEED = [
  'poke-ball',
  'great-ball',
  'ultra-ball',
  'master-ball',
  'luxury-ball',
  'fire-stone',
  'water-stone',
  'thunder-stone',
  'leaf-stone',
  'moon-stone',
  'sun-stone',
  'shiny-stone',
  'dusk-stone',
  'dawn-stone',
  'ice-stone'
];

const MEGA_STONES = [
  'abomasite', 'absolite', 'aerodactylite', 'aggronite', 'alakazite', 'altarianite', 
  'ampharosite', 'audinite', 'banettite', 'beedrillite', 'blastoisinite', 'blazikenite', 
  'cameruptite', 'charizardite-x', 'charizardite-y', 'diancite', 'galladite', 'garchompite', 
  'gardevoirite', 'gengarite', 'glalitite', 'gyaradosite', 'heracrossite', 'houndoominite', 
  'kangaskhanite', 'latiasite', 'latiosite', 'lopunnite', 'lucarionite', 'manectite', 
  'mawilite', 'medichamite', 'metagrossite', 'mewtwonite-x', 'mewtwonite-y', 'pidgeotite', 
  'pinsirite', 'sablenite', 'salamencite', 'sceptilite', 'scizorite', 'sharpedonite', 
  'slowbronite', 'steelixite', 'swampertite', 'tyranitarite', 'venusaurite'
];

const BOTTLE_CAPS = [
  'bottle-cap',
  'gold-bottle-cap'
];

const POTENTIAL_PEARLS = [
  { id: 'bronze-pearl', name: 'Bronze Pearl', cost: 50000, description: 'Upgrades a Black Iron potential Pokémon to Bronze potential.', category: 'potential' },
  { id: 'silver-pearl', name: 'Silver Pearl', cost: 100000, description: 'Upgrades a Bronze potential Pokémon to Silver potential.', category: 'potential' },
  { id: 'gold-pearl', name: 'Gold Pearl', cost: 250000, description: 'Upgrades a Silver potential Pokémon to Gold potential.', category: 'potential' },
  { id: 'platinum-pearl', name: 'Platinum Pearl', cost: 500000, description: 'Upgrades a Gold potential Pokémon to Platinum potential.', category: 'potential' },
  { id: 'adamantite-pearl', name: 'Adamantite Pearl', cost: 1000000, description: 'Upgrades a Platinum potential Pokémon to Adamantite potential.', category: 'potential' },
  { id: 'diamond-pearl', name: 'Diamond Pearl', cost: 2000000, description: 'Upgrades an Adamantite potential Pokémon to Diamond potential.', category: 'potential' },
  { id: 'crystal-pearl', name: 'Crystal Pearl', cost: 3500000, description: 'Upgrades a Diamond potential Pokémon to Crystal potential.', category: 'potential' },
  { id: 'epic-pearl', name: 'Epic Pearl', cost: 5000000, description: 'Upgrades a Crystal potential Pokémon to Epic potential.', category: 'potential' }
];



export async function seedItems() {
  if (!env.CLOUDINARY_CLOUD_NAME) throw new Error('CLOUDINARY_CLOUD_NAME is required in .env');
  console.log('Seeding Items (Cloudinary sprites)...');

  const ALL_POKEAPI_ITEMS = [...ITEMS_TO_SEED, ...MEGA_STONES, ...BOTTLE_CAPS];

  for (const itemName of ALL_POKEAPI_ITEMS) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/item/${itemName}`);
      if (!res.ok) {
        console.warn(`Failed to fetch item: ${itemName}`);
        continue;
      }
      const data = await res.json();

      const enFlavorText = data.flavor_text_entries.find(
        (entry: any) => entry.language.name === 'en'
      )?.text?.replace(/\n|\f/g, ' ') || 'A tool for catching wild Pokémon.';

      let category = 'misc';
      if (MEGA_STONES.includes(itemName)) category = 'mega';
      else if (BOTTLE_CAPS.includes(itemName)) category = 'iv';
      else if (itemName.includes('ball')) category = 'pokeball';
      else if (itemName.includes('stone')) category = 'evolution';

      // PokeAPI costs can be weird, let's fix the custom pricing for our new items
      let cost = data.cost * 10;
      if (category === 'evolution') cost = 50000;
      if (BOTTLE_CAPS.includes(itemName)) cost = itemName === 'gold-bottle-cap' ? 250000 : 50000;
      if (MEGA_STONES.includes(itemName)) cost = 100000;

      await prisma.item.upsert({
        where: { id: itemName },
        update: {
          name: data.names.find((n: any) => n.language.name === 'en')?.name || data.name,
          cost,
          description: enFlavorText,
          spriteUrl: `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/item/${category}/${data.name}.png`,
          category,
        },
        create: {
          id: itemName,
          name: data.names.find((n: any) => n.language.name === 'en')?.name || data.name,
          cost,
          description: enFlavorText,
          spriteUrl: `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/item/${category}/${data.name}.png`,
          category,
        }
      });
      console.log(`Seeded item: ${itemName}`);
    } catch (e) {
      console.error(`Error seeding item ${itemName}:`, e);
    }
  }

  console.log(`Seeding custom items...`);
  for (const pearl of POTENTIAL_PEARLS) {
    try {
      const { id, ...updateData } = pearl;
      const pearlWithSprite = {
        ...updateData,
        spriteUrl: `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/item/${pearl.category}/${id}.png`
      };
      await prisma.item.upsert({
        where: { id },
        update: pearlWithSprite,
        create: { id, ...pearlWithSprite }
      });
      console.log(`Seeded item: ${id}`);
    } catch (e) {
      console.error(`Error seeding custom item ${pearl.id}:`, e);
    }
  }



  console.log(`Successfully seeded items.`);
}
