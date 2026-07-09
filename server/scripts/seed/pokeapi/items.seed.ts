import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ITEMS_TO_SEED = [
  'poke-ball',
  'great-ball',
  'ultra-ball',
  'master-ball',
  'luxury-ball'
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
  
  console.log(`Successfully seeded items.`);
}
