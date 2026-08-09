export const RIFT_DIFFICULTY_MULTIPLIERS: Record<string, { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }> = {
  NORMAL: { hp: 1.5, atk: 1.1, def: 1.1, spa: 1.1, spd: 1.1, spe: 1.05 },
  HARD: { hp: 2.0, atk: 1.25, def: 1.25, spa: 1.25, spd: 1.25, spe: 1.1 },
  NIGHTMARE: { hp: 2.75, atk: 1.5, def: 1.5, spa: 1.5, spd: 1.5, spe: 1.2 },
  ABYSS: { hp: 3.5, atk: 1.75, def: 1.75, spa: 1.75, spd: 1.75, spe: 1.3 }
};

export const RIFT_REWARD_MULTIPLIERS: Record<string, number> = {
  NORMAL: 1.0,
  HARD: 1.5,
  NIGHTMARE: 2.5,
  ABYSS: 4.0
};

export const RIFT_MAX_FLOORS: Record<string, number> = {
  G: 2, F: 2, E: 2,
  D: 3, C: 3, B: 4, A: 4,
  S_MINUS: 5, S: 5, S_PLUS: 5,
  SS_MINUS: 5, SS: 5, SS_PLUS: 5,
  SSS_MINUS: 5, SSS: 5, SSS_PLUS: 5,
  EX_MINUS: 5, EX: 5, EX_PLUS: 5
};

// Base Infinity Coin reward per floor (before difficulty multiplier)
// Increases as the Trainer Rank of the Rift increases.
export const RIFT_BASE_INFINITY_COINS: Record<string, number> = {
  G: 5, F: 15, E: 30,
  D: 60, C: 150, B: 300, A: 600,
  S_MINUS: 800, S: 1500, S_PLUS: 3000,
  SS_MINUS: 5000, SS: 8000, SS_PLUS: 12000,
  SSS_MINUS: 20000, SSS: 35000, SSS_PLUS: 50000,
  EX_MINUS: 70000, EX: 100000, EX_PLUS: 150000
};

// Valid enemy pools for Corrupted Pokemon per rank.
export const RIFT_POKEMON_POOLS = {
  F_TIER: [
    'bulbasaur', 'charmander', 'squirtle', 'caterpie', 'weedle', 'pidgey', 'spearow',
    'rattata', 'ekans', 'sandshrew', 'nidoran-f', 'nidoran-m', 'zubat', 'oddish', 'paras',
    'venonat', 'diglett', 'meowth', 'psyduck', 'mankey', 'growlithe', 'poliwag', 'bellsprout', 'geodude',
    'ponyta', 'slowpoke', 'magnemite', 'doduo', 'seel', 'grimer', 'gastly', 'onix', 'krabby',
    'voltorb', 'exeggcute', 'cubone', 'lickitung', 'koffing', 'goldeen', 'magikarp', 'eevee', 'dratini',
    'sentret', 'hoothoot', 'spinarak', 'mareep', 'hoppip', 'wooper', 'zigzagoon', 'poochyena', 'wurmple',
    'shinx', 'starly', 'bidoof', 'pidove', 'patrat', 'fletchling', 'rookidee', 'lechonk'
  ],
  MID_TIER: [
    'pidgeot', 'raichu', 'ninetales', 'golduck', 'arcanine', 'machamp', 'golem', 'rapidash', 'slowbro',
    'muk', 'gengar', 'hypno', 'kingler', 'electrode', 'exeggutor', 'marowak', 'hitmonlee', 'hitmonchan',
    'weezing', 'rhydon', 'chansey', 'kangaskhan', 'seadra', 'scyther', 'pinsir', 'tauros', 'lapras',
    'vaporeon', 'jolteon', 'flareon', 'snorlax', 'ampharos', 'espeon', 'umbreon', 'steelix', 'scizor',
    'heracross', 'skarmory', 'houndoom', 'donphan', 'kingdra', 'blissey', 'typhlosion', 'feraligatr', 'meganium',
    'gardevoir', 'flygon', 'aggron', 'altaria', 'walrein', 'absol', 'glalie', 'luxray', 'roserade',
    'mamoswine', 'electivire', 'magmortar', 'togekiss', 'gliscor', 'dusknoir', 'lucario', 'gallade', 'yanmega'
  ],
  HIGH_TIER: [
    'dragonite', 'tyranitar', 'salamence', 'metagross', 'garchomp', 'hydreigon', 'goodra', 'kommo-o', 'dragapult', 'baxcalibur',
    'volcarona', 'aegislash-shield', 'kingambit', 'gholdengo', 'annihilape', 'ursaluna', 'ceruledge', 'armarouge', 'palafin-hero', 'hydrapple',
    'great-tusk', 'iron-treads', 'iron-hands', 'iron-thorns', 'iron-jugulis', 'iron-moth', 'iron-bundle', 'roaring-moon', 'flutter-mane', 'slither-wing', 'brute-bonnet', 'sandy-shocks', 'scream-tail'
  ],
  LEGENDARY_TIER: [
    'articuno', 'zapdos', 'moltres', 'raikou', 'entei', 'suicune', 'regirock', 'regice', 'registeel', 'regieleki', 'regidrago',
    'latias', 'latios', 'uxie', 'mesprit', 'azelf', 'heatran', 'cresselia', 'cobalion', 'terrakion', 'virizion',
    'tornadus-incarnate', 'thundurus-incarnate', 'landorus-incarnate', 'tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini',
    'wo-chien', 'chien-pao', 'ting-lu', 'chi-yu', 'ogerpon', 'okidogi', 'munkidori', 'fezandipiti',
    'type-null', 'silvally', 'kubfu', 'glastrier', 'spectrier'
  ],
  MYTHICAL_TIER: [
    'mew', 'celebi', 'jirachi', 'deoxys-normal', 'manaphy', 'phione', 'darkrai', 'shaymin-land', 'victini', 'keldeo-ordinary', 'meloetta-aria', 'genesect', 'diancie', 'hoopa', 'volcanion', 'magearna', 'marshadow', 'zeraora', 'meltan', 'melmetal', 'zarude', 'pecharunt',
    'nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana', 'guzzlord', 'poipole', 'naganadel', 'stakataka', 'blacephalon',
    'walking-wake', 'iron-leaves', 'gouging-fire', 'raging-bolt', 'iron-boulder', 'iron-crown'
  ],
  GOD_TIER: [
    'lugia', 'ho-oh', 'dialga', 'dialga-origin', 'palkia', 'palkia-origin', 'giratina-altered', 'giratina-origin',
    'reshiram', 'zekrom', 'kyurem', 'xerneas', 'yveltal', 'zygarde-50', 'zygarde-complete',
    'solgaleo', 'lunala', 'necrozma', 'necrozma-dusk', 'necrozma-dawn', 'necrozma-ultra',
    'zacian', 'zacian-crowned', 'zamazenta', 'zamazenta-crowned', 'calyrex', 'calyrex-ice', 'calyrex-shadow',
    'koraidon', 'miraidon', 'terapagos', 'terapagos-stellar', 'groudon', 'kyogre', 'rayquaza', 'mewtwo', 'eternatus', 'arceus'
  ]
} as const;

export const RANK_TO_TIER_MAPPING: Record<string, keyof typeof RIFT_POKEMON_POOLS> = {
  G: 'F_TIER', F: 'F_TIER', E: 'MID_TIER',
  D: 'MID_TIER', C: 'MID_TIER', B: 'HIGH_TIER', A: 'HIGH_TIER',
  S_MINUS: 'LEGENDARY_TIER', S: 'LEGENDARY_TIER', S_PLUS: 'LEGENDARY_TIER',
  SS_MINUS: 'MYTHICAL_TIER', SS: 'MYTHICAL_TIER', SS_PLUS: 'MYTHICAL_TIER',
  SSS_MINUS: 'GOD_TIER', SSS: 'GOD_TIER', SSS_PLUS: 'GOD_TIER',
  EX_MINUS: 'GOD_TIER', EX: 'GOD_TIER', EX_PLUS: 'GOD_TIER',
};

export const RIFT_LEVEL_RANGES: Record<string, { min: number; max: number }> = {
  G: { min: 5, max: 50 },
  F: { min: 50, max: 100 },
  E: { min: 100, max: 250 },
  D: { min: 250, max: 500 },
  C: { min: 500, max: 1000 },
  B: { min: 1000, max: 1500 },
  A: { min: 1500, max: 2000 },
  S_MINUS: { min: 2000, max: 3000 },
  S: { min: 3000, max: 4000 },
  S_PLUS: { min: 4000, max: 5000 },
  SS_MINUS: { min: 5000, max: 6000 },
  SS: { min: 6000, max: 7000 },
  SS_PLUS: { min: 7000, max: 8000 },
  SSS_MINUS: { min: 8000, max: 10000 },
  SSS: { min: 10000, max: 12000 },
  SSS_PLUS: { min: 12000, max: 14000 },
  EX_MINUS: { min: 14000, max: 16000 },
  EX: { min: 16000, max: 18000 },
  EX_PLUS: { min: 18000, max: 20000 }
};

export function getRiftRankWeight(rank: string): number {
  const ranks = [
    'G', 'F', 'E', 'D', 'C', 'B', 'A',
    'S_MINUS', 'S', 'S_PLUS', 'SS_MINUS', 'SS', 'SS_PLUS',
    'SSS_MINUS', 'SSS', 'SSS_PLUS'
  ];
  return ranks.indexOf(rank);
}
