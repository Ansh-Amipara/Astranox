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

  const allMoves = await prisma.move.findMany({ select: { id: true, typeId: true, power: true } });

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

      // Determine Max Learnset Power based on BST and Category
      const bst = hp + attack + defense + spAtk + spDef + speed;
      let maxPower = 40; // Baby default
      
      if (bst < 300) maxPower = 40;
      else if (bst < 350) maxPower = 60;
      else if (bst < 400) maxPower = 80;
      else if (bst < 450) maxPower = 100;
      else if (bst < 500) maxPower = 125;
      else if (bst < 530) maxPower = 150;
      else maxPower = 175; 
      
      if (category === 'Pseudo Legendary') maxPower = 200;
      else if (category === 'Ultra Beast') maxPower = 275;
      else if (category === 'Paradox') maxPower = 275;
      else if (category === 'Mythical') maxPower = 325;
      else if (category === 'Legendary') {
         if (bst >= 680) maxPower = 400;
         else maxPower = 350;
      }
      
      // Signature overrides
      const baseNameForSig = data.name.split('-')[0];
      const starters = ['venusaur', 'charizard', 'blastoise', 'meganium', 'typhlosion', 'feraligatr', 'sceptile', 'blaziken', 'swampert', 'torterra', 'infernape', 'empoleon', 'serperior', 'emboar', 'samurott', 'chesnaught', 'delphox', 'greninja', 'decidueye', 'incineroar', 'primarina', 'rillaboom', 'cinderace', 'inteleon', 'meowscarada', 'skeledirge', 'quaquaval'];
      const signatures175 = ['gengar', 'alakazam', 'machamp', 'gyarados', 'snorlax', 'lapras', 'arcanine', 'scizor', 'heracross', 'kingdra', 'houndoom', 'skarmory', 'gardevoir', 'gallade', 'aggron', 'flygon', 'milotic', 'absol', 'lucario', 'weavile', 'togekiss', 'electivire', 'magmortar', 'rhyperior', 'dusknoir', 'froslass', 'gliscor', 'rotom', 'zoroark', 'volcarona', 'haxorus', 'chandelure', 'bisharp', 'excadrill', 'talonflame', 'noivern', 'sylveon', 'mimikyu', 'lycanroc', 'toxapex', 'golisopod', 'vikavolt', 'corviknight', 'grimmsnarl', 'toxtricity', 'hatterene', 'copperajah', 'sirfetchd', 'ceruledge', 'armarouge'];
      const exceptional200 = ['slaking', 'aegislash', 'palafin-hero', 'wishiwashi-school', 'ursaluna', 'ursaluna-bloodmoon', 'kingambit', 'annihilape', 'archaludon', 'goodra-hisui', 'arcanine-hisui'];

      if (starters.includes(baseNameForSig) || signatures175.includes(baseNameForSig)) {
         maxPower = 175;
      }
      if (exceptional200.includes(data.name) || exceptional200.includes(baseNameForSig)) {
         maxPower = 200;
      }

      // Parse Learnsets
      const learnsetEntries: any[] = [];
      const typesToLearn = [type1Id];
      if (type2Id) typesToLearn.push(type2Id);

      for (const move of allMoves) {
         if (!move.power) continue;
         if (typesToLearn.includes(move.typeId) && move.power <= maxPower) {
             const unlockLevel = Math.max(1, Math.floor(move.power / 5));
             learnsetEntries.push({
                speciesId: id,
                moveId: move.id,
                unlockLevel,
             });
         }
      }

      // Sort by level ASC
      learnsetEntries.sort((a, b) => a.unlockLevel - b.unlockLevel);

      const uniqueMoves = new Set();
      const finalLearnset = [];

      for (const entry of learnsetEntries) {
        // Prevent duplicate move entries for the same species/level
        const key = `${entry.moveId}-${entry.unlockLevel}`;
        if (!uniqueMoves.has(key)) {
          uniqueMoves.add(key);
          finalLearnset.push(entry);
        }
      }

      // Insert PokemonLearnset
      if (finalLearnset.length > 0) {
        await prisma.pokemonLearnset.deleteMany({ where: { speciesId: id } });
        await prisma.pokemonLearnset.createMany({
          data: finalLearnset
        });
      }

    } catch (e) {
      console.error(`Failed seeding species ${id}`, e);
    }
  });

  console.log('Successfully seeded 1025 species with Cloudinary sprites.');
}
