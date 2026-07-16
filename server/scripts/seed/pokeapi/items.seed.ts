import { PrismaClient } from '@prisma/client';

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
  { id: 'bronze-crystal', name: 'Bronze Crystal', cost: 50000, description: 'Upgrades a Black Iron potential Pokémon to Bronze potential.', spriteUrl: null, category: 'potential' },
  { id: 'silver-crystal', name: 'Silver Crystal', cost: 125000, description: 'Upgrades a Bronze potential Pokémon to Silver potential.', spriteUrl: null, category: 'potential' },
  { id: 'gold-crystal', name: 'Gold Crystal', cost: 250000, description: 'Upgrades a Silver potential Pokémon to Gold potential.', spriteUrl: null, category: 'potential' },
  { id: 'platinum-crystal', name: 'Platinum Crystal', cost: 500000, description: 'Upgrades a Gold potential Pokémon to Platinum potential.', spriteUrl: null, category: 'potential' },
  { id: 'diamond-crystal', name: 'Diamond Crystal', cost: 1250000, description: 'Upgrades a Platinum potential Pokémon to Diamond potential.', spriteUrl: null, category: 'potential' }
];

export async function seedItems() {
  console.log('Seeding Items...');

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

      await prisma.item.upsert({
        where: { id: itemName },
        update: {
          name: data.names.find((n: any) => n.language.name === 'en')?.name || data.name,
          cost: data.cost,
          description: enFlavorText,
          spriteUrl: data.sprites.default,
        },
        create: {
          id: itemName,
          name: data.names.find((n: any) => n.language.name === 'en')?.name || data.name,
          cost: data.cost,
          description: enFlavorText,
          spriteUrl: data.sprites.default,
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
      await prisma.item.upsert({
        where: { id: crystal.id },
        update: crystal,
        create: crystal
      });
      console.log(`Seeded item: ${crystal.id}`);
    } catch (e) {
      console.error(`Error seeding custom item ${crystal.id}:`, e);
    }
  }

  console.log(`Successfully seeded items.`);
}
