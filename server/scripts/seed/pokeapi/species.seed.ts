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
      
      const baseExperience = data.base_experience || 0;

      // Fetch species data for catch rate and legendary status
      let catchRate = 255;
      let isLegendary = false;
      let isMythical = false;
      try {
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        if (speciesRes.ok) {
          const speciesData = await speciesRes.json();
          catchRate = speciesData.capture_rate || 255;
          isLegendary = speciesData.is_legendary || false;
          isMythical = speciesData.is_mythical || false;
        }
      } catch (err) {
        console.error(`Failed to fetch species data for ${id}, defaulting catchRate to 255`, err);
      }

      // Download sprite locally
      const remoteSpriteUrl = data.sprites?.front_default;
      const localSpriteUrl = await downloadSprite(remoteSpriteUrl, id);

      await prisma.species.upsert({
        where: { id },
        update: {
          name: data.name,
          spriteUrl: localSpriteUrl,
          hp, attack, defense, spAtk, spDef, speed,
          catchRate,
          baseExp: baseExperience,
          isLegendary,
          isMythical,
          type1Id, type2Id,
        },
        create: {
          id,
          name: data.name,
          spriteUrl: localSpriteUrl,
          hp, attack, defense, spAtk, spDef, speed,
          catchRate,
          baseExp: baseExperience,
          isLegendary,
          isMythical,
          type1Id, type2Id,
        },
      });

      // Parse Learnsets
      const learnsetEntries: any[] = [];
      for (const moveData of data.moves) {
        const moveId = parseInt(moveData.move.url.split('/').filter(Boolean).pop()!);
        
        // Find Gen 9 or fallback
        const vgDetails = moveData.version_group_details;
        let targetDetail = vgDetails.find((d: any) => d.version_group.name === 'scarlet-violet' && d.move_learn_method.name === 'level-up');
        if (!targetDetail) targetDetail = vgDetails.find((d: any) => d.version_group.name === 'sword-shield' && d.move_learn_method.name === 'level-up');
        if (!targetDetail) targetDetail = vgDetails.find((d: any) => d.version_group.name === 'ultra-sun-ultra-moon' && d.move_learn_method.name === 'level-up');
        if (!targetDetail) targetDetail = vgDetails.find((d: any) => d.move_learn_method.name === 'level-up'); // Ultimate fallback

        if (targetDetail && targetDetail.level_learned_at > 0) {
          learnsetEntries.push({
            speciesId: id,
            moveId,
            level: targetDetail.level_learned_at,
          });
        }
      }

      // Sort by level ASC, then assign learnOrder
      learnsetEntries.sort((a, b) => a.level - b.level);
      
      const uniqueMoves = new Set();
      const finalLearnset = [];
      let currentOrder = 1;

      for (const entry of learnsetEntries) {
        // Prevent duplicate move entries for the same species/level (sometimes happens in PokeAPI)
        const key = `${entry.moveId}-${entry.level}`;
        if (!uniqueMoves.has(key)) {
          uniqueMoves.add(key);
          finalLearnset.push({
            ...entry,
            learnOrder: currentOrder++
          });
        }
      }

      // Insert Learnset
      if (finalLearnset.length > 0) {
        // We delete existing learnsets for this species to ensure idempotency
        await prisma.learnset.deleteMany({ where: { speciesId: id } });
        await prisma.learnset.createMany({
          data: finalLearnset,
          skipDuplicates: true
        });
      }

    } catch (e) {
      console.error(`Failed seeding species ${id}`, e);
    }
  });

  console.log('Successfully seeded 1025 species and downloaded sprites.');
}
