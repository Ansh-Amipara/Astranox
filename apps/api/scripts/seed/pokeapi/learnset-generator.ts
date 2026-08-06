import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List of EX Rank Species Names
const EX_SPECIES = ['arceus', 'zygarde', 'necrozma', 'eternatus', 'kyurem', 'rayquaza', 'hoopa', 'mewtwo'];

// List of SSS Rank Species Names
const SSS_SPECIES = [
  'groudon', 'kyogre', 'dialga', 'palkia', 'giratina', 'reshiram', 'zekrom', 'solgaleo', 'lunala',
  'koraidon', 'miraidon', 'calyrex', 'xerneas', 'yveltal', 'regigigas', 'lugia', 'ho-oh', 'zacian', 'zamazenta'
];

// Rank to Max Power Map
const RANK_MAX_POWER: Record<string, number> = {
  'F': 60,
  'E': 80,
  'D': 100,
  'C': 125,
  'B': 150,
  'A': 175,
  'S': 200,
  'SS': 250,
  'SSS': 275,
  'EX': 300,
};

// Signature moves map (Species Name -> Move Names)
const SIGNATURE_MOVES: Record<string, string[]> = {
  'arceus': ['judgment'],
  'mewtwo': ['psystrike'],
  'lugia': ['aeroblast'],
  'ho-oh': ['sacred-fire'],
  'kyogre': ['origin-pulse'],
  'groudon': ['precipice-blades'],
  'rayquaza': ['dragon-ascent'],
  'dialga': ['roar-of-time'],
  'palkia': ['spacial-rend'],
  'giratina': ['shadow-force'],
  'reshiram': ['blue-flare'],
  'zekrom': ['bolt-strike'],
  'kyurem': ['glaciate'],
  'xerneas': ['geomancy'],
  'yveltal': ['oblivion-wing'],
  'zygarde': ['thousand-arrows', 'thousand-waves', 'lands-wrath', 'core-enforcer'],
  'hoopa': ['hyperspace-hole', 'hyperspace-fury'],
  'solgaleo': ['sunsteel-strike'],
  'lunala': ['moongeist-beam'],
  'necrozma': ['photon-geyser'],
  'zacian': ['behemoth-blade'],
  'zamazenta': ['behemoth-shield'],
  'eternatus': ['dynamax-cannon', 'eternabeam'],
  'calyrex': ['astral-barrage', 'glacial-lance'],
  'koraidon': ['collision-course'],
  'miraidon': ['electro-drift'],
  'dragonite': ['outrage'],
  'garchomp': ['dual-chop'],
  'tyranitar': ['stone-edge'],
  'salamence': ['double-edge'],
  'metagross': ['meteor-mash'],
  'hydreigon': ['draco-pulse'],
  'goodra': ['dragon-pulse'],
  'kommo-o': ['clanging-scales'],
  'dragapult': ['dragon-darts'],
  'baxcalibur': ['glaive-rush'],
};

// Flatten all signature moves to easily exclude them from general pool
const ALL_SIGNATURE_MOVES = new Set(Object.values(SIGNATURE_MOVES).flat());

/**
 * Traces evolution chain to determine stage depth and total chain length
 */
function getEvolutionDetails(speciesId: number, speciesMap: Map<number, any>) {
  let depth = 0;
  let currId = speciesId;
  
  // Find ancestor parent
  let parent = Array.from(speciesMap.values()).find(s => s.evolvesToId === currId);
  while (parent) {
    depth++;
    currId = parent.id;
    parent = Array.from(speciesMap.values()).find(s => s.evolvesToId === currId);
  }
  const rootId = currId;

  // Find longest path forward
  let maxLength = 1;
  let checkId = rootId;
  let check = speciesMap.get(checkId);
  while (check && check.evolvesToId) {
    maxLength++;
    checkId = check.evolvesToId;
    check = speciesMap.get(checkId);
  }

  return { depth, maxLength };
}

/**
 * Determine Fixed or Rules-based Battle Rank
 */
export function determineBattleRank(species: any, speciesMap: Map<number, any>): string {
  const name = species.name.toLowerCase();
  const baseName = name.split('-')[0];

  // If there's a base species, inherit its rank
  if (species.baseSpeciesId && species.baseSpeciesId !== species.id) {
    const baseSpecies = speciesMap.get(species.baseSpeciesId);
    if (baseSpecies) {
      return determineBattleRank(baseSpecies, speciesMap);
    }
  }

  // 1. EX Rank
  if (EX_SPECIES.includes(name) || EX_SPECIES.includes(baseName)) {
    return 'EX';
  }

  // 2. SSS Rank
  if (SSS_SPECIES.includes(name) || SSS_SPECIES.includes(baseName)) {
    return 'SSS';
  }

  // 3. SS Rank - Other Legendaries & Mythicals
  if (species.category === 'Legendary' || species.category === 'Mythical') {
    return 'SS';
  }

  // 4. S Rank - Pseudo-Legendaries, Ultra Beasts, Paradox
  if (species.category === 'Pseudo Legendary' || species.category === 'Ultra Beast' || species.category === 'Paradox') {
    return 'S';
  }

  // 5. A-F Ranks
  const { depth, maxLength } = getEvolutionDetails(species.id, speciesMap);
  const bst = species.hp + species.attack + species.defense + species.spAtk + species.spDef + species.speed;

  if (maxLength >= 3) {
    if (depth === 0) {
      return bst >= 310 ? 'E' : 'F';
    } else if (depth === 1) {
      return bst >= 400 ? 'C' : 'D';
    } else {
      return bst >= 510 ? 'A' : 'B';
    }
  } else if (maxLength === 2) {
    if (depth === 0) {
      return bst >= 350 ? 'D' : 'E';
    } else {
      return bst >= 490 ? 'A' : 'B';
    }
  } else {
    // Single Stage
    return bst >= 470 ? 'A' : 'B';
  }
}

/**
 * Generate 10-15 level up moves for a species
 */
export function generateLearnset(species: any, rank: string, allMoves: any[]): { moveId: number, unlockLevel: number }[] {
  const maxPower = RANK_MAX_POWER[rank] || 60;
  const typeIds = [species.type1Id, species.type2Id].filter(Boolean);
  
  // Filter candidate moves:
  // 1. Move has power
  // 2. Matching type OR it's a basic Normal/neutral move (Normal type id = 1)
  // 3. Power is <= maxPower
  // 4. Exclude other pokemon's signature moves
  const candidateMoves = allMoves.filter(move => {
    if (!move.power) return false;
    if (move.power > maxPower) return false;
    
    // Check if this move is a signature move of someone else
    const moveName = move.name.toLowerCase();
    if (ALL_SIGNATURE_MOVES.has(moveName)) {
      // Only allow if it belongs to this species
      const ownerSignature = SIGNATURE_MOVES[species.name.toLowerCase()] || [];
      if (!ownerSignature.includes(moveName)) {
        return false;
      }
    }

    return typeIds.includes(move.typeId) || move.typeId === 1; // 1 is Normal type
  });

  // Sort by power ascending
  candidateMoves.sort((a, b) => a.power - b.power);

  // Group candidate moves by power ranges to ensure a smooth progression
  const weakMoves = candidateMoves.filter(m => m.power <= 60);
  const midMoves = candidateMoves.filter(m => m.power > 60 && m.power <= 90);
  const strongMoves = candidateMoves.filter(m => m.power > 90);

  const selectedMoves: any[] = [];

  // Pick helper function
  const pickSubset = (pool: any[], count: number) => {
    if (pool.length <= count) return pool;
    const step = pool.length / count;
    const subset = [];
    for (let i = 0; i < count; i++) {
      subset.push(pool[Math.floor(i * step)]);
    }
    return subset;
  };

  // Select moves proportionally
  selectedMoves.push(...pickSubset(weakMoves, 4));
  selectedMoves.push(...pickSubset(midMoves, 4));
  selectedMoves.push(...pickSubset(strongMoves, 4));

  // If we don't have enough, fill from candidates
  if (selectedMoves.length < 10 && candidateMoves.length > selectedMoves.length) {
    const selectedIds = new Set(selectedMoves.map(m => m.id));
    for (const move of candidateMoves) {
      if (!selectedIds.has(move.id)) {
        selectedMoves.push(move);
        if (selectedMoves.length >= 10) break;
      }
    }
  }

  // Always append signature moves of this species at the very end
  const sigMoveNames = SIGNATURE_MOVES[species.name.toLowerCase()] || [];
  const sigMoves = allMoves.filter(m => sigMoveNames.includes(m.name.toLowerCase()));
  
  const finalMoves = selectedMoves.filter(m => !sigMoveNames.includes(m.name.toLowerCase()));
  finalMoves.push(...sigMoves);

  // Sort final moves by power again before calculating levels
  finalMoves.sort((a, b) => a.power - b.power);

  // Map levels: spread them out from Level 1 to Level 85
  return finalMoves.slice(0, 15).map((move, idx, arr) => {
    // Determine level based on index in sorted list
    let unlockLevel = 1;
    if (idx > 0) {
      const progress = idx / (arr.length - 1);
      unlockLevel = Math.max(1, Math.min(85, Math.floor(progress * 80) + 5));
    }
    
    // Ensure levels strictly increase or stay equal
    return {
      moveId: move.id,
      unlockLevel
    };
  });
}

/**
 * Main seeding function for Ranks and Learnsets
 */
export async function seedRanksAndLearnsets() {
  console.log('Running Battle Rank and Learnset Seeding...');
  
  const speciesList = await prisma.species.findMany();
  const speciesMap = new Map(speciesList.map(s => [s.id, s]));
  const allMoves = await prisma.move.findMany();

  console.log(`Processing ${speciesList.length} species...`);

  let count = 0;
  for (const species of speciesList) {
    const rank = determineBattleRank(species, speciesMap);
    
    // Update species rank in DB
    await prisma.species.update({
      where: { id: species.id },
      data: { rank }
    });

    // Generate Learnset
    const learnset = generateLearnset(species, rank, allMoves);
    
    if (learnset.length > 0) {
      await prisma.pokemonLearnset.deleteMany({ where: { speciesId: species.id } });
      await prisma.pokemonLearnset.createMany({
        data: learnset.map(item => ({
          speciesId: species.id,
          moveId: item.moveId,
          unlockLevel: item.unlockLevel
        }))
      });
    }
    
    count++;
    if (count % 100 === 0) {
      console.log(`Processed ${count}/${speciesList.length} species...`);
    }
  }

  console.log('Battle Rank and Learnset Seeding completed successfully!');
}
