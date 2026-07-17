import fs from 'fs';
import path from 'path';
import { PrismaClient, TrainerType } from '@prisma/client';

const prisma = new PrismaClient();

// Define expected interfaces
interface ParsedPokemon {
  speciesName: string;
  level: number;
  isAce: boolean;
  ivs: string;
  heldItem: string | null;
  moves: string[];
}

interface ParsedTrainer {
  name: string;
  trainerClass: string;
  trainerType: TrainerType;
  region: string;
  pokemon: ParsedPokemon[];
}

function parseMarkdownFile(filePath: string, defaultRegion: string): ParsedTrainer[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const trainers: ParsedTrainer[] = [];
  let currentTrainer: ParsedTrainer | null = null;
  let inTable = false;
  let tableHeaders: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const headerMatch = line.match(/^##\s+(.+?)(?:\s+\((.*?)\))?$/);
    if (headerMatch) {
      const fullTitle = headerMatch[1].trim();
      
      if (
        fullTitle.includes('Summary') ||
        fullTitle.includes('Lore') ||
        fullTitle.includes('Eclipse Dawn') ||
        fullTitle.includes('Final World') ||
        fullTitle.includes('Regional Roster') ||
        fullTitle.includes('Example') ||
        (fullTitle.includes('Aurelia') && fullTitle === 'Aurelia') || 
        (fullTitle.includes('Vespera') && fullTitle === 'Vespera') ||
        (fullTitle.includes('Solara') && fullTitle === 'Solara') ||
        (fullTitle.includes('Noctara') && fullTitle === 'Noctara') ||
        (fullTitle.includes('Verdantis') && fullTitle === 'Verdantis') ||
        (fullTitle.includes('Crythos') && fullTitle === 'Crythos') ||
        (fullTitle.includes('Lumina') && fullTitle === 'Lumina') ||
        (fullTitle.includes('Dravora') && fullTitle === 'Dravora') ||
        (fullTitle.includes('Elyndor') && fullTitle === 'Elyndor') ||
        (fullTitle.includes('Zephyria') && fullTitle === 'Zephyria')
      ) {
        if (!fullTitle.startsWith('Champion')) {
          currentTrainer = null;
          continue;
        }
      }

      let trainerClass = 'Trainer';
      let trainerType: TrainerType = 'NORMAL';
      
      if (fullTitle.startsWith('Hunter')) { trainerClass = 'Hunter'; trainerType = 'HUNTER'; }
      else if (fullTitle.startsWith('Champion')) { trainerClass = 'Champion'; trainerType = 'CHAMPION'; }
      else if (fullTitle.startsWith('Elder')) { trainerClass = 'Elder'; trainerType = 'ELDER'; }
      else if (fullTitle.startsWith('Guardian')) { trainerClass = 'Guardian'; trainerType = 'GUARDIAN'; }
      else if (fullTitle.startsWith('Leader')) { trainerClass = 'Leader'; trainerType = 'LEGENDARY'; }
      else if (fullTitle.startsWith('Vice Leader')) { trainerClass = 'Vice Leader'; trainerType = 'BOSS'; }
      else {
        currentTrainer = null;
        continue;
      }

      let name = fullTitle.replace(/^(Hunter|Champion|Elder|Guardian|Leader|Vice Leader)\s+/, '').trim();
      
      currentTrainer = {
        name,
        trainerClass,
        trainerType,
        region: defaultRegion,
        pokemon: []
      };
      trainers.push(currentTrainer);
      inTable = false;
      continue;
    }

    if (!currentTrainer) continue;

    if (line.startsWith('|') && line.includes('Pokémon') && line.includes('Lv')) {
      inTable = true;
      tableHeaders = line.split('|').map(s => s.trim()).filter(s => s !== '');
      continue;
    }

    if (inTable && line.startsWith('|') && line.includes('---')) {
      continue;
    }

    if (inTable && line.startsWith('|')) {
      const cells = line.split('|').map(s => s.trim()).filter(s => s !== '');
      if (cells.length < 2) continue;

      const pokemonStr = cells[0];
      const isAce = pokemonStr.includes('⭐') || pokemonStr.includes('(Ace)');
      const speciesName = pokemonStr.replace(/⭐/g, '').replace(/\(Ace\)/g, '').trim();
      
      const level = parseInt(cells[1], 10);
      let ivs = '0';
      let heldItem: string | null = null;
      let moves: string[] = [];

      if (cells.length > 2) ivs = cells[2];
      if (cells.length > 3) heldItem = cells[3] === '' || cells[3] === '-' ? null : cells[3];
      if (cells.length > 4) {
        moves = cells[4].split(',').map(m => m.trim()).filter(m => m.length > 0);
      }

      if (tableHeaders.length === 2 && tableHeaders[1] === 'Lv') {
         ivs = '31';
      }

      currentTrainer.pokemon.push({ speciesName, level, isAce, ivs, heldItem, moves });
      continue;
    }

    if (line.startsWith('* ') || line.startsWith('- ')) {
      const pokemonStr = line.substring(2).trim();
      const isAce = pokemonStr.includes('⭐');
      const speciesName = pokemonStr.replace(/⭐/g, '').replace(/\(Young\)/g, '').trim();
      
      let level = 50; 
      for (let back = 1; back <= 5; back++) {
        if (i - back >= 0) {
          const prevLine = lines[i - back].trim();
          const lvlMatch = prevLine.match(/\*\*Level:\*\*\s+(\d+)/);
          if (lvlMatch) {
            level = parseInt(lvlMatch[1], 10);
            break;
          }
          const plainLvlMatch = prevLine.match(/Level:\s+(\d+)/);
          if (plainLvlMatch) {
            level = parseInt(plainLvlMatch[1], 10);
            break;
          }
        }
      }

      currentTrainer.pokemon.push({
        speciesName,
        level,
        isAce,
        ivs: '15',
        heldItem: null,
        moves: []
      });
      continue;
    }
  }

  return trainers;
}

function parseIvProfile(ivs: string, trainerClass: string): number[] {
  // Returns [hp, atk, def, spa, spd, spe]
  if (!ivs || ivs === '0') return [0, 0, 0, 0, 0, 0];
  
  if (ivs === '6V' || ivs === '31') {
    return [31, 31, 31, 31, 31, 31];
  }
  
  if (ivs === '5V') {
    const profile = [31, 31, 31, 31, 31, 31];
    const randIndex = Math.floor(Math.random() * 6);
    if (trainerClass === 'Elder') {
      profile[randIndex] = 30; // Elders get strictly 30 for the remaining stat
    } else {
      profile[randIndex] = 25 + Math.floor(Math.random() * 6); // Guardians/others get 25-30
    }
    return profile;
  }

  if (ivs === '4V') {
    const profile = [25, 25, 25, 25, 25, 25].map(v => v + Math.floor(Math.random() * 6));
    const indices = [0, 1, 2, 3, 4, 5];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    profile[indices[0]] = 31;
    profile[indices[1]] = 31;
    profile[indices[2]] = 31;
    profile[indices[3]] = 31;
    return profile;
  }

  if (ivs === '3V') {
    // 3 stats at 31, 3 random stats at 15-25 (Legacy for non-Guardians)
    const profile = [15, 15, 15, 15, 15, 15].map(v => v + Math.floor(Math.random() * 11));
    // Pick 3 unique indices to set to 31
    const indices = [0, 1, 2, 3, 4, 5];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    profile[indices[0]] = 31;
    profile[indices[1]] = 31;
    profile[indices[2]] = 31;
    return profile;
  }
  
  // Legacy support for "30-31" or basic strings
  let val = 0;
  if (ivs.includes('–')) {
    val = parseInt(ivs.split('–')[1], 10);
  } else if (ivs.includes('-')) {
    val = parseInt(ivs.split('-')[1], 10);
  } else {
    val = parseInt(ivs, 10) || 0;
  }
  return [val, val, val, val, val, val];
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function seed() {
  const regionsDir = path.resolve(__dirname, '../../../docs/story/regions');
  const eclipseDawnFile = path.resolve(__dirname, '../../../docs/story/evil organization/ECLIPSE_DAWN.md');

  const allTrainers: ParsedTrainer[] = [];

  if (fs.existsSync(regionsDir)) {
    const files = fs.readdirSync(regionsDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const regionMatch = file.match(/^\d+_(.+)\.md$/);
      const regionName = regionMatch ? regionMatch[1] : 'Unknown';
      const parsed = parseMarkdownFile(path.join(regionsDir, file), regionName);
      allTrainers.push(...parsed);
    }
  }

  if (fs.existsSync(eclipseDawnFile)) {
    const parsed = parseMarkdownFile(eclipseDawnFile, 'Eclipse Dawn Base');
    allTrainers.push(...parsed);
  }

  console.log(`Parsed ${allTrainers.length} total trainers. Fetching reference data...`);

  const speciesList = await prisma.species.findMany({ select: { id: true, name: true } });
  const moveList = await prisma.move.findMany({ select: { id: true, name: true } });

  const speciesMap = new Map<string, number>();
  speciesList.forEach(s => speciesMap.set(normalizeName(s.name), s.id));

  const moveMap = new Map<string, number>();
  moveList.forEach(m => moveMap.set(normalizeName(m.name), m.id));

  // Some overrides for names that PokeAPI has differently
  speciesMap.set('florges', speciesMap.get('florges-red') || 0);
  speciesMap.set('lycanrocmidnight', speciesMap.get('lycanroc-midnight') || 0);
  
  for (const trainer of allTrainers) {
    console.log(`\nInserting ${trainer.trainerClass} ${trainer.name} (${trainer.region})...`);

    // Clean up existing if rerunning
    await prisma.npcTrainer.deleteMany({
      where: { name: trainer.name, trainerClass: trainer.trainerClass, region: trainer.region }
    });

    let baseReward = 1000;
    if (trainer.trainerType === 'GUARDIAN') baseReward = 2000;
    else if (trainer.trainerType === 'ELDER') baseReward = 5000;
    else if (trainer.trainerType === 'CHAMPION') baseReward = 10000;
    else if (trainer.trainerClass === 'Operative' || trainer.trainerType === 'NORMAL') baseReward = 500;
    else if (trainer.trainerClass === 'Cadre') baseReward = 1000;
    else if (trainer.trainerClass === 'Captain') baseReward = 3000;
    else if (trainer.trainerType === 'HUNTER') baseReward = 8000;
    else if (trainer.trainerClass === 'Vice Leader' || trainer.trainerType === 'BOSS') baseReward = 12000;
    else if (trainer.trainerClass === 'Leader' || trainer.trainerType === 'LEGENDARY') baseReward = 20000;

    let maxLevel = 0;
    for (const poke of trainer.pokemon) {
      if (poke.level > maxLevel) maxLevel = poke.level;
    }
    
    // Level scaling bonus = 1000 per level of their highest Pokémon
    const calculatedReward = baseReward + (maxLevel * 1000);

    const npc = await prisma.npcTrainer.create({
      data: {
        name: trainer.name,
        trainerClass: trainer.trainerClass,
        trainerType: trainer.trainerType,
        region: trainer.region,
        spriteUrl: `/sprites/trainers/${normalizeName(trainer.trainerClass)}.png`, // Placeholder
        rewardMoney: calculatedReward
      }
    });

    let pos = 0;
    for (const poke of trainer.pokemon) {
      const cleanSpecies = normalizeName(poke.speciesName);
      let speciesId = speciesMap.get(cleanSpecies);
      
      if (!speciesId) {
        console.warn(`  ⚠️ Species not found: ${poke.speciesName} (normalized: ${cleanSpecies})`);
        // Fallback to Bulbasaur so it doesn't crash
        speciesId = 1; 
      }

      const [ivHp, ivAttack, ivDefense, ivSpAtk, ivSpDef, ivSpeed] = parseIvProfile(poke.ivs, trainer.trainerClass);

      const createdPoke = await prisma.npcTrainerPokemon.create({
        data: {
          npcTrainerId: npc.id,
          speciesId,
          level: poke.level,
          position: pos,
          ivHp,
          ivAttack,
          ivDefense,
          ivSpAtk,
          ivSpDef,
          ivSpeed
        }
      });

      let moveSlot = 0;
      for (const moveName of poke.moves) {
        const cleanMove = normalizeName(moveName);
        const moveId = moveMap.get(cleanMove);
        if (moveId) {
          await prisma.npcTrainerPokemonMove.create({
            data: {
              npcTrainerPokemonId: createdPoke.id,
              moveId,
              slot: moveSlot
            }
          });
          moveSlot++;
        } else {
          console.warn(`  ⚠️ Move not found: ${moveName} (normalized: ${cleanMove})`);
        }
      }
      
      pos++;
    }
    console.log(`  ✅ Inserted ${trainer.pokemon.length} Pokémon.`);
  }

  console.log('\nSeeding complete!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
