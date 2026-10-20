import { PrismaClient } from '@prisma/client';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

const POTENTIAL_PEARLS = [
  // Astral Coins Pearls (E to A+)
  
  { id: 'e-minus-pearl', name: 'E- Pearl', cost: 2000, description: 'Upgrades a Pokémon to E- potential.', category: 'potential' },
  { id: 'e-pearl', name: 'E Pearl', cost: 5000, description: 'Upgrades a Pokémon to E potential.', category: 'potential' },
  { id: 'e-plus-pearl', name: 'E+ Pearl', cost: 10000, description: 'Upgrades a Pokémon to E+ potential.', category: 'potential' },
  
  { id: 'd-minus-pearl', name: 'D- Pearl', cost: 20000, description: 'Upgrades a Pokémon to D- potential.', category: 'potential' },
  { id: 'd-pearl', name: 'D Pearl', cost: 50000, description: 'Upgrades a Pokémon to D potential.', category: 'potential' },
  { id: 'd-plus-pearl', name: 'D+ Pearl', cost: 100000, description: 'Upgrades a Pokémon to D+ potential.', category: 'potential' },
  
  { id: 'c-minus-pearl', name: 'C- Pearl', cost: 150000, description: 'Upgrades a Pokémon to C- potential.', category: 'potential' },
  { id: 'c-pearl', name: 'C Pearl', cost: 200000, description: 'Upgrades a Pokémon to C potential.', category: 'potential' },
  { id: 'c-plus-pearl', name: 'C+ Pearl', cost: 250000, description: 'Upgrades a Pokémon to C+ potential.', category: 'potential' },
  
  { id: 'b-minus-pearl', name: 'B- Pearl', cost: 300000, description: 'Upgrades a Pokémon to B- potential.', category: 'potential' },
  { id: 'b-pearl', name: 'B Pearl', cost: 400000, description: 'Upgrades a Pokémon to B potential.', category: 'potential' },
  { id: 'b-plus-pearl', name: 'B+ Pearl', cost: 500000, description: 'Upgrades a Pokémon to B+ potential.', category: 'potential' },
  
  { id: 'a-minus-pearl', name: 'A- Pearl', cost: 600000, description: 'Upgrades a Pokémon to A- potential.', category: 'potential' },
  { id: 'a-pearl', name: 'A Pearl', cost: 800000, description: 'Upgrades a Pokémon to A potential.', category: 'potential' },
  { id: 'a-plus-pearl', name: 'A+ Pearl', cost: 1000000, description: 'Upgrades a Pokémon to A+ potential.', category: 'potential' },

  // Infinity Coins Pearls (S- to SSS+)
  { id: 's-minus-pearl', name: 'S- Pearl', cost: 200, description: 'Upgrades a Pokémon to S- potential.', category: 'infinity-only' },
  { id: 's-pearl', name: 'S Pearl', cost: 500, description: 'Upgrades a Pokémon to S potential.', category: 'infinity-only' },
  { id: 's-plus-pearl', name: 'S+ Pearl', cost: 1000, description: 'Upgrades a Pokémon to S+ potential.', category: 'infinity-only' },
  
  { id: 'ss-minus-pearl', name: 'SS- Pearl', cost: 2000, description: 'Upgrades a Pokémon to SS- potential.', category: 'infinity-only' },
  { id: 'ss-pearl', name: 'SS Pearl', cost: 5000, description: 'Upgrades a Pokémon to SS potential.', category: 'infinity-only' },
  { id: 'ss-plus-pearl', name: 'SS+ Pearl', cost: 10000, description: 'Upgrades a Pokémon to SS+ potential.', category: 'infinity-only' },
  
  { id: 'sss-minus-pearl', name: 'SSS- Pearl', cost: 20000, description: 'Upgrades a Pokémon to SSS- potential.', category: 'infinity-only' },
  { id: 'sss-pearl', name: 'SSS Pearl', cost: 50000, description: 'Upgrades a Pokémon to SSS potential.', category: 'infinity-only' },
  { id: 'sss-plus-pearl', name: 'SSS+ Pearl', cost: 100000, description: 'Upgrades a Pokémon to SSS+ potential.', category: 'infinity-only' }
];

async function seedPearls() {
  console.log(`Seeding custom pearls...`);
  
  // Optional: clear old non-standard pearls if you want a clean slate, but upsert is fine.
  
  for (const pearl of POTENTIAL_PEARLS) {
    try {
      const { id, ...updateData } = pearl;
      
      // Use a generic placeholder or dynamic URL for these pearls
      // For now we'll just point it to a standard pearl sprite if they haven't uploaded specific ones yet
      const spriteUrl = `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/item/potential/epic-pearl.png`;

      const pearlWithSprite = {
        ...updateData,
        spriteUrl
      };
      
      await prisma.item.upsert({
        where: { id },
        update: pearlWithSprite,
        create: { id, ...pearlWithSprite }
      });
      console.log(`Seeded item: ${id} at cost ${pearl.cost} (${pearl.category})`);
    } catch (e) {
      console.error(`Error seeding custom item ${pearl.id}:`, e);
    }
  }
}

seedPearls().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
