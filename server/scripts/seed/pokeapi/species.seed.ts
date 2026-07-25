import { PrismaClient } from '@prisma/client';
import { runInBatches } from './utils';
import { env } from '../../../src/config/env';

const prisma = new PrismaClient();
export function determineCategory(name: string, isLegendary: boolean, isMythical: boolean): string {
  const ultraBeasts = ['nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana', 'guzzlord', 'poipole', 'naganadel', 'stakataka', 'blacephalon'];
  const paradox = [
    'great-tusk', 'scream-tail', 'brute-bonnet', 'flutter-mane', 'slither-wing', 'sandy-shocks', 'iron-treads',
    'iron-bundle', 'iron-hands', 'iron-jugulis', 'iron-moth', 'iron-thorns', 'roaring-moon', 'iron-valiant',
    'walking-wake', 'iron-leaves', 'gouging-fire', 'raging-bolt', 'iron-boulder', 'iron-crown', 'koraidon', 'miraidon'
  ];
  const pseudoLegendaries = [
    'dratini', 'dragonair', 'dragonite', 'larvitar', 'pupitar', 'tyranitar', 'bagon', 'shelgon', 'salamence',
    'beldum', 'metang', 'metagross', 'gible', 'gabite', 'garchomp', 'deino', 'zweilous', 'hydreigon',
    'goomy', 'sliggoo', 'goodra', 'jangmo-o', 'hakamo-o', 'kommo-o', 'dreepy', 'drakloak', 'dragapult',
    'frigibax', 'arctibax', 'baxcalibur'
  ];

  if (isMythical) return 'Mythical';
  if (isLegendary) return 'Legendary';
  
  const baseName = name.split('-')[0];
  if (paradox.includes(name) || paradox.includes(baseName)) return 'Paradox';
  if (ultraBeasts.includes(name) || ultraBeasts.includes(baseName)) return 'Ultra Beast';
  if (pseudoLegendaries.includes(name) || pseudoLegendaries.includes(baseName)) return 'Pseudo Legendary';

  return 'Normal';
}

export async function seedSpecies() {
  if (!env.CLOUDINARY_CLOUD_NAME) throw new Error('CLOUDINARY_CLOUD_NAME is required in .env');
  console.log('Seeding 1025 Pokemon Species (Cloudinary sprites)... (this will take a few minutes)');

  // Create an array from 1 to 1025 (Gen 1-9 species)
  // Fetch ALL available Pokemon IDs directly from PokeAPI to ensure we don't miss any forms
  const allPokemonRes = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
  const allPokemonData = await allPokemonRes.json();
  const ids = allPokemonData.results.map((p: any) => {
    const urlParts = p.url.split('/').filter(Boolean);
    return parseInt(urlParts[urlParts.length - 1]);
  });

  await runInBatches(ids, 20, async (id: number) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!res.ok) return; // Skip if missing for some reason
      const data = await res.json();
      
      // Skip non-combat mount forms for Koraidon/Miraidon
      if (data.name.startsWith('koraidon-') || data.name.startsWith('miraidon-')) return;

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
      let isLegendaryRaw = false;
      let isMythicalRaw = false;
      try {
        const speciesUrl = data.species?.url;
        if (speciesUrl) {
          const speciesRes = await fetch(speciesUrl);
          if (speciesRes.ok) {
            const speciesData = await speciesRes.json();
            catchRate = speciesData.capture_rate || 255;
            isLegendaryRaw = speciesData.is_legendary || false;
            isMythicalRaw = speciesData.is_mythical || false;
          }
        }
      } catch (err) {
        console.error(`Failed to fetch species data for ${id}, defaulting catchRate to 255`, err);
      }

      const category = determineCategory(data.name, isLegendaryRaw, isMythicalRaw);

      // Extract form details
      let baseSpeciesId = id <= 1025 ? id : null;
      let pokedexNumber = id <= 1025 ? id : null;
      if (id > 1025 && data.species?.url) {
        const urlParts = data.species.url.split('/').filter(Boolean);
        baseSpeciesId = parseInt(urlParts[urlParts.length - 1]);
        pokedexNumber = baseSpeciesId;
      }
      const isMega = data.name.includes('-mega');
      const isGmax = data.name.includes('-gmax');
      const formName = data.name;

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
          category,
          type1Id, type2Id,
          baseSpeciesId,
          pokedexNumber,
          isMega,
          isGmax,
          formName,
        },
        create: {
          id,
          name: data.name,
          spriteUrl: localSpriteUrl,
          hp, attack, defense, spAtk, spDef, speed,
          catchRate,
          baseExp: baseExperience,
          category,
          type1Id, type2Id,
          baseSpeciesId,
          pokedexNumber,
          isMega,
          isGmax,
          formName,
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
          data: finalLearnset
        });
      }

    } catch (e) {
      console.error(`Failed seeding species ${id}`, e);
    }
  });

  console.log('Successfully seeded 1025 species with Cloudinary sprites.');
}
