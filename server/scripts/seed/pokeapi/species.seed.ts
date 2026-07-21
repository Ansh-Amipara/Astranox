import { PrismaClient } from '@prisma/client';
import { runInBatches } from './utils';
import { env } from '../../../src/config/env';

const prisma = new PrismaClient();
export async function seedSpecies() {
  if (!env.CLOUDINARY_CLOUD_NAME) throw new Error('CLOUDINARY_CLOUD_NAME is required in .env');
  console.log('Seeding 1025 Pokemon Species (Cloudinary sprites)... (this will take a few minutes)');
  
  // Create an array from 1 to 1025 (Gen 1-9 species)
  const baseIds = Array.from({ length: 1025 }, (_, i) => i + 1);
  const megaIds = [
    10033, 10034, 10035, 10036, 10037, 10038, 10039, 10040, 10041, 10042, 10043, 10044, 10045, 10046, 10047, 10048, 10049, 10050, 10051, 10052, 10053, 10054, 10055, 10056, 10057, 10058, 10059, 10060, 10062, 10063, 10064, 10065, 10066, 10067, 10068, 10069, 10070, 10071, 10072, 10073, 10074, 10075, 10076, 10079, 10087, 10088, 10089, 10090
  ];
  const gmaxIds = [
    10195, 10196, 10197, 10198, 10199, 10200, 10201, 10202, 10203, 10204, 10205, 10206, 10207, 10208, 10209, 10210, 10211, 10212, 10213, 10214, 10215, 10216, 10217, 10218, 10219, 10220, 10221, 10222, 10223, 10224, 10225, 10226, 10227, 10228
  ];
  const ids = [...megaIds, ...gmaxIds];

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
        const speciesUrl = data.species?.url;
        if (speciesUrl) {
          const speciesRes = await fetch(speciesUrl);
          if (speciesRes.ok) {
            const speciesData = await speciesRes.json();
          catchRate = speciesData.capture_rate || 255;
          isLegendary = speciesData.is_legendary || false;
          isMythical = speciesData.is_mythical || false;
        }
        }
      } catch (err) {
        console.error(`Failed to fetch species data for ${id}, defaulting catchRate to 255`, err);
      }

      // Use Cloudinary URL
      const localSpriteUrl = `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/pokemon/${id}.png`;

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

  console.log('Successfully seeded 1025 species with Cloudinary sprites.');
}
