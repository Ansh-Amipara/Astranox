import { PrismaClient } from '@prisma/client';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

const POTENTIAL_PEARLS = [
  { id: 'epic-pearl', name: 'Epic Pearl', cost: 5000000, description: 'Upgrades a Crystal potential Pokémon to Epic potential.', category: 'potential' },
  { id: 'heroic-pearl', name: 'Heroic Pearl', cost: 10, description: 'Upgrades an Epic potential Pokémon to Heroic potential.', category: 'infinity-only' },
  { id: 'sovereign-pearl', name: 'Sovereign Pearl', cost: 25, description: 'Upgrades a Heroic potential Pokémon to Sovereign potential.', category: 'infinity-only' },
  { id: 'legendary-pearl', name: 'Legendary Pearl', cost: 50, description: 'Upgrades a Sovereign potential Pokémon to Legendary potential.', category: 'infinity-only' },
  { id: 'divine-pearl', name: 'Divine Pearl', cost: 100, description: 'Upgrades a Legendary potential Pokémon to Divine potential.', category: 'infinity-only' },
  { id: 'celestial-pearl', name: 'Celestial Pearl', cost: 250, description: 'Upgrades a Divine potential Pokémon to Celestial potential.', category: 'infinity-only' },
  { id: 'primordial-pearl', name: 'Primordial Pearl', cost: 500, description: 'Upgrades a Celestial potential Pokémon to Primordial potential.', category: 'infinity-only' },
  { id: 'mythical-pearl', name: 'Mythical Pearl', cost: 1000, description: 'Upgrades a Primordial potential Pokémon to Mythical potential.', category: 'infinity-only' },
  { id: 'infinity-pearl', name: 'Infinity Pearl', cost: 2500, description: 'Upgrades a Mythical potential Pokémon to Infinity potential.', category: 'infinity-only' },
  { id: 'eternal-pearl', name: 'Eternal Pearl', cost: 5000, description: 'Upgrades an Infinity potential Pokémon to Eternal potential.', category: 'infinity-only' }
];

async function seedPearls() {
  console.log(`Seeding custom pearls...`);
  for (const pearl of POTENTIAL_PEARLS) {
    try {
      const { id, ...updateData } = pearl;
      const spriteUrl = pearl.category === 'infinity-only' 
        ? `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/item/potential/epic-pearl.png`
        : `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/item/${pearl.category}/${id}.png`;

      const pearlWithSprite = {
        ...updateData,
        spriteUrl
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
}

seedPearls().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
