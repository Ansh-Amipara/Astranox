import { PrismaClient } from '@prisma/client';
import { runInBatches } from './utils';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const SPRITE_DIR = path.join(__dirname, '../../../../server/public/sprites');

// Ensure directory exists
if (!fs.existsSync(SPRITE_DIR)) {
  fs.mkdirSync(SPRITE_DIR, { recursive: true });
}

async function downloadSprite(url: string, id: number): Promise<string> {
  const spriteName = `${id}.png`;
  const spritePath = path.join(SPRITE_DIR, spriteName);
  
  if (fs.existsSync(spritePath)) {
    return `/sprites/${spriteName}`; // Already downloaded
  }

  if (!url) return ''; // Some pokemon might lack sprites

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch sprite for ${id}`);
    
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(spritePath, buffer);
    
    return `/sprites/${spriteName}`;
  } catch (err) {
    console.error(`Error downloading sprite for ${id}:`, err);
    return '';
  }
}

export async function seedSpecies() {
  console.log('Seeding 1025 Pokemon Species & Sprites... (this will take a few minutes)');
  
  // Create an array from 1 to 1025 (Gen 1-9 species)
  const ids = Array.from({ length: 1025 }, (_, i) => i + 1);

  await runInBatches(ids, 20, async (id: number) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!res.ok) return; // Skip if missing for some reason
      const data = await res.json();
      
      const hp = data.stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 0;
      const attack = data.stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 0;
      const defense = data.stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 0;
      const spAtk = data.stats.find((s: any) => s.stat.name === 'special-attack')?.base_stat || 0;
      const spDef = data.stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat || 0;
      const speed = data.stats.find((s: any) => s.stat.name === 'speed')?.base_stat || 0;
      
      const type1Id = parseInt(data.types.find((t: any) => t.slot === 1).type.url.split('/').filter(Boolean).pop()!);
      const type2Info = data.types.find((t: any) => t.slot === 2);
      const type2Id = type2Info ? parseInt(type2Info.type.url.split('/').filter(Boolean).pop()!) : null;

      // Download sprite locally
      const remoteSpriteUrl = data.sprites?.front_default;
      const localSpriteUrl = await downloadSprite(remoteSpriteUrl, id);

      await prisma.species.upsert({
        where: { id },
        update: {
          name: data.name,
          spriteUrl: localSpriteUrl,
          hp, attack, defense, spAtk, spDef, speed,
          type1Id, type2Id,
        },
        create: {
          id,
          name: data.name,
          spriteUrl: localSpriteUrl,
          hp, attack, defense, spAtk, spDef, speed,
          type1Id, type2Id,
        },
      });
    } catch (e) {
      console.error(`Failed seeding species ${id}`, e);
    }
  });

  console.log('Successfully seeded 1025 species and downloaded sprites.');
}
