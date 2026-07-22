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

const POTENTIAL_CRYSTALS = [
  { id: 'bronze-crystal', name: 'Bronze Crystal', cost: 100000, description: 'Upgrades a Black Iron potential Pokémon to Bronze potential.', category: 'potential' },
  { id: 'silver-crystal', name: 'Silver Crystal', cost: 250000, description: 'Upgrades a Bronze potential Pokémon to Silver potential.', category: 'potential' },
  { id: 'gold-crystal', name: 'Gold Crystal', cost: 500000, description: 'Upgrades a Silver potential Pokémon to Gold potential.', category: 'potential' },
  { id: 'platinum-crystal', name: 'Platinum Crystal', cost: 1000000, description: 'Upgrades a Gold potential Pokémon to Platinum potential.', category: 'potential' },
  { id: 'diamond-crystal', name: 'Diamond Crystal', cost: 2500000, description: 'Upgrades a Platinum potential Pokémon to Diamond potential.', category: 'potential' }
];

const IV_CRYSTALS = [
  { id: 'black-iron-iv-crystal', name: 'Black Iron IV Crystal', cost: 10000, description: 'Upgrades a specific IV (0-5) to 6.', category: 'iv' },
  { id: 'bronze-iv-crystal', name: 'Bronze IV Crystal', cost: 20000, description: 'Upgrades a specific IV (6-10) to 11.', category: 'iv' },
  { id: 'silver-iv-crystal', name: 'Silver IV Crystal', cost: 50000, description: 'Upgrades a specific IV (11-15) to 16.', category: 'iv' },
  { id: 'gold-iv-crystal', name: 'Gold IV Crystal', cost: 100000, description: 'Upgrades a specific IV (16-20) to 21.', category: 'iv' },
  { id: 'platinum-iv-crystal', name: 'Platinum IV Crystal', cost: 200000, description: 'Upgrades a specific IV (21-25) to 26.', category: 'iv' },
  { id: 'diamond-iv-crystal', name: 'Diamond IV Crystal', cost: 500000, description: 'Upgrades a specific IV (26-30) to 31.', category: 'iv' }
];

export async function seedItems() {
  if (!env.CLOUDINARY_CLOUD_NAME) throw new Error('CLOUDINARY_CLOUD_NAME is required in .env');
  console.log('Seeding Items (Cloudinary sprites)...');

  for (const itemName of ITEMS_TO_SEED) {
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

      const category = itemName.includes('ball') ? 'pokeball' : itemName.includes('stone') ? 'evolution' : 'misc';

      await prisma.item.upsert({
        where: { id: itemName },
        update: {
          name: data.names.find((n: any) => n.language.name === 'en')?.name || data.name,
          cost: data.cost * 10,
          description: enFlavorText,
          spriteUrl: `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/items/${category}/${data.name}.png`,
          category,
        },
        create: {
          id: itemName,
          name: data.names.find((n: any) => n.language.name === 'en')?.name || data.name,
          cost: data.cost * 10,
          description: enFlavorText,
          spriteUrl: `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/items/${category}/${data.name}.png`,
          category,
        }
      });
      console.log(`Seeded item: ${itemName}`);
    } catch (e) {
      console.error(`Error seeding item ${itemName}:`, e);
    }
  }

  console.log(`Seeding custom items...`);
  for (const crystal of POTENTIAL_CRYSTALS) {
    try {
      const crystalWithSprite = {
        ...crystal,
        spriteUrl: `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/items/misc/${crystal.id}.png`
      };
      await prisma.item.upsert({
        where: { id: crystal.id },
        update: crystalWithSprite,
        create: crystalWithSprite
      });
      console.log(`Seeded item: ${crystal.id}`);
    } catch (e) {
      console.error(`Error seeding custom item ${crystal.id}:`, e);
    }
  }

  for (const crystal of IV_CRYSTALS) {
    try {
      const crystalWithSprite = {
        ...crystal,
        spriteUrl: `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/items/misc/${crystal.id}.png`
      };
      await prisma.item.upsert({
        where: { id: crystal.id },
        update: crystalWithSprite,
        create: crystalWithSprite
      });
      console.log(`Seeded item: ${crystal.id}`);
    } catch (e) {
      console.error(`Error seeding custom item ${crystal.id}:`, e);
    }
  }

  console.log(`Successfully seeded items.`);
}
