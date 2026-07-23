import * as fs from 'fs';
import * as path from 'path';

const markdownPath = path.resolve(__dirname, '../../../../docs/story/MASTER_REGISTRY.md');
const outputPath = path.resolve(__dirname, 'realms.json');

const content = fs.readFileSync(markdownPath, 'utf8');
const lines = content.split('\n');

const realms: any[] = [];
let currentRank = '';
let currentRealm: any = null;

let parsingStarted = false;

const legendariesByTier: Record<string, number> = {
  // Tier 3
  'Articuno': 3, 'Zapdos': 3, 'Moltres': 3,
  'Raikou': 3, 'Entei': 3, 'Suicune': 3,
  'Regirock': 3, 'Regice': 3, 'Registeel': 3,
  'Latias': 3, 'Latios': 3,
  'Uxie': 3, 'Mesprit': 3, 'Azelf': 3,
  'Heatran': 3, 'Regigigas': 3, 'Cresselia': 3,
  'Cobalion': 3, 'Terrakion': 3, 'Virizion': 3,
  'Tornadus': 3, 'Thundurus': 3, 'Landorus': 3,
  'Type: Null': 3, 'Silvally': 3,
  'Tapu Koko': 3, 'Tapu Lele': 3, 'Tapu Bulu': 3, 'Tapu Fini': 3,
  'Nihilego': 3, 'Buzzwole': 3, 'Pheromosa': 3, 'Xurkitree': 3, 'Celesteela': 3, 'Kartana': 3, 'Guzzlord': 3, 'Poipole': 3, 'Naganadel': 3, 'Stakataka': 3, 'Blacephalon': 3,
  'Kubfu': 3, 'Urshifu': 3,
  'Regieleki': 3, 'Regidrago': 3,
  'Glastrier': 3, 'Spectrier': 3,
  'Enamorus': 3,
  'Wo-Chien': 3, 'Chien-Pao': 3, 'Ting-Lu': 3, 'Chi-Yu': 3,
  'Okidogi': 3, 'Munkidori': 3, 'Fezandipiti': 3,
  'Ogerpon': 3,

  // Tier 2
  'Mew': 2, 'Celebi': 2, 'Jirachi': 2, 'Deoxys': 2,
  'Phione': 2, 'Manaphy': 2, 'Darkrai': 2, 'Shaymin': 2,
  'Victini': 2, 'Keldeo': 2, 'Meloetta': 2, 'Genesect': 2,
  'Diancie': 2, 'Volcanion': 2,
  'Magearna': 2, 'Marshadow': 2, 'Zeraora': 2,
  'Zarude': 2, 'Pecharunt': 2,

  // Tier 1
  'Lugia': 1, 'Ho-Oh': 1,
  'Kyogre': 1, 'Groudon': 1,
  'Dialga': 1, 'Palkia': 1, 'Giratina': 1,
  'Reshiram': 1, 'Zekrom': 1, 'Kyurem': 1,
  'Xerneas': 1, 'Yveltal': 1,
  'Cosmog': 1, 'Cosmoem': 1, 'Solgaleo': 1, 'Lunala': 1,
  'Zacian': 1, 'Zamazenta': 1,
  'Calyrex': 1,
  'Koraidon': 1, 'Miraidon': 1,
  'Terapagos': 1,

  // Super Legendary (Tier 0)
  'Mewtwo': 0, 'Rayquaza': 0, 'Arceus': 0, 'Hoopa': 0, 'Necrozma': 0, 'Eternatus': 0
};

const getLegendaryChance = (tier: number) => {
  if (tier === 3) return 0.001; // 1 in 1000
  if (tier === 2) return 0.00025; // 1 in 4000
  if (tier === 1) return 0.0001; // 1 in 10000
  if (tier === 0) return 0.0000305; // 1 in 32768
  return 0.001;
};

// Start from the exact registry list
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  if (line === '# The Astral Realms — Complete Registry with Habitat Lists') {
    parsingStarted = true;
    continue;
  }

  if (!parsingStarted) continue;

  if (line.match(/^## (F|E|D|C|B|A|AA|AAA|S|S\+|SS|SS\+|SSS|SSS\+) Rank/)) {
    const match = line.match(/^## (.*?)\s*Rank/);
    if (match) {
      currentRank = match[1].replace('+', '_PLUS') + '_RANK';
    }
  } else if (line.startsWith('### ')) {
    if (currentRealm) realms.push(currentRealm);
    
    let realmName = line.replace('### ', '').trim();
    // Sometimes there are extra characters, ensure clean name
    currentRealm = {
      name: realmName,
      requiredRank: currentRank,
      types: [],
      environment: '',
      habitats: [],
      legendarySpawns: []
    };
  } else if (currentRealm && line.startsWith('*') && line.includes('— **Types:**')) {
    const parts = line.split('— **Types:**');
    currentRealm.environment = parts[0].replace(/\*/g, '').trim();
    const typeStr = parts[1].trim();
    currentRealm.types = typeStr.split('/').map(t => t.trim().toLowerCase());
  } else if (currentRealm && line.startsWith('**Wild Habitat')) {
    const match = line.match(/\):\*\*\s*(.*)/);
    if (match) {
      const species = match[1].split(',').map(s => s.trim());
      currentRealm.habitats = species;
    }
  } else if (currentRealm && line.startsWith('**Ultra-Rare Legendary Encounter(s):**')) {
    const match = line.replace('**Ultra-Rare Legendary Encounter(s):**', '').trim();
    const species = match.split(',').map(s => s.trim());
    currentRealm.legendarySpawns = species.map(name => {
      const tier = legendariesByTier[name] !== undefined ? legendariesByTier[name] : 3;
      return {
        name,
        tier,
        chance: getLegendaryChance(tier)
      };
    });
  }
}

if (currentRealm) {
  realms.push(currentRealm);
}

const RANK_TO_TIER = {
  'F_RANK': 1, 'E_RANK': 2, 'D_RANK': 3, 'C_RANK': 4,
  'B_RANK': 5, 'A_RANK': 6, 'AA_RANK': 7, 'AAA_RANK': 8,
  'S_RANK': 9, 'S_PLUS_RANK': 10, 'SS_RANK': 11, 'SS_PLUS_RANK': 12,
  'SSS_RANK': 13, 'SSS_PLUS_RANK': 14
};

realms.forEach(r => {
  r.tier = (RANK_TO_TIER as any)[r.requiredRank] || 1;
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(realms, null, 2));
console.log(`Parsed ${realms.length} realms to realms.json successfully.`);
