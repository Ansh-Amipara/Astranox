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
  F_MINUS: 2, F: 2, F_PLUS: 2,
  E_MINUS: 2, E: 2, E_PLUS: 2,
  D_MINUS: 3, D: 3, D_PLUS: 3,
  C_MINUS: 3, C: 3, C_PLUS: 3,
  B_MINUS: 4, B: 4, B_PLUS: 4,
  A_MINUS: 4, A: 4, A_PLUS: 4,
  S_MINUS: 5, S: 5, S_PLUS: 5,
  SS_MINUS: 5, SS: 5, SS_PLUS: 5,
  SSS_MINUS: 5, SSS: 5, SSS_PLUS: 5,
  EX_MINUS: 5, EX: 5, EX_PLUS: 5
};

// Base Infinity Coin reward per floor (before difficulty multiplier)
// Increases as the Trainer Rank of the Rift increases.
export const RIFT_BASE_INFINITY_COINS: Record<string, number> = {
  F_MINUS: 5, F: 10, F_PLUS: 15,
  E_MINUS: 20, E: 25, E_PLUS: 30,
  D_MINUS: 40, D: 50, D_PLUS: 60,
  C_MINUS: 75, C: 100, C_PLUS: 150,
  B_MINUS: 200, B: 250, B_PLUS: 300,
  A_MINUS: 375, A: 450, A_PLUS: 600,
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
  F_MINUS: 'F_TIER', F: 'F_TIER', F_PLUS: 'F_TIER',
  E_MINUS: 'MID_TIER', E: 'MID_TIER', E_PLUS: 'MID_TIER',
  D_MINUS: 'MID_TIER', D: 'MID_TIER', D_PLUS: 'MID_TIER',
  C_MINUS: 'MID_TIER', C: 'MID_TIER', C_PLUS: 'MID_TIER',
  B_MINUS: 'HIGH_TIER', B: 'HIGH_TIER', B_PLUS: 'HIGH_TIER',
  A_MINUS: 'HIGH_TIER', A: 'HIGH_TIER', A_PLUS: 'HIGH_TIER',
  S_MINUS: 'LEGENDARY_TIER', S: 'LEGENDARY_TIER', S_PLUS: 'LEGENDARY_TIER',
  SS_MINUS: 'MYTHICAL_TIER', SS: 'MYTHICAL_TIER', SS_PLUS: 'MYTHICAL_TIER',
  SSS_MINUS: 'GOD_TIER', SSS: 'GOD_TIER', SSS_PLUS: 'GOD_TIER',
  EX_MINUS: 'GOD_TIER', EX: 'GOD_TIER', EX_PLUS: 'GOD_TIER',
};

export const RIFT_LEVEL_RANGES: Record<string, { min: number; max: number }> = {
  F_MINUS: { min: 5, max: 15 },
  F: { min: 10, max: 25 },
  F_PLUS: { min: 20, max: 35 },
  E_MINUS: { min: 25, max: 40 },
  E: { min: 30, max: 50 },
  E_PLUS: { min: 40, max: 60 },
  D_MINUS: { min: 50, max: 75 },
  D: { min: 60, max: 90 },
  D_PLUS: { min: 75, max: 100 },
  C_MINUS: { min: 85, max: 120 },
  C: { min: 100, max: 150 },
  C_PLUS: { min: 125, max: 175 },
  B_MINUS: { min: 140, max: 200 },
  B: { min: 160, max: 250 },
  B_PLUS: { min: 200, max: 300 },
  A_MINUS: { min: 225, max: 350 },
  A: { min: 260, max: 400 },
  A_PLUS: { min: 300, max: 500 },
  S_MINUS: { min: 410, max: 600 },
  S: { min: 610, max: 800 },
  S_PLUS: { min: 810, max: 1000 },
  SS_MINUS: { min: 1010, max: 1300 },
  SS: { min: 1310, max: 1600 },
  SS_PLUS: { min: 1610, max: 1900 },
  SSS_MINUS: { min: 1910, max: 2500 },
  SSS: { min: 2510, max: 3500 },
  SSS_PLUS: { min: 3510, max: 4500 },
  EX_MINUS: { min: 4000, max: 5000 },
  EX: { min: 4500, max: 5500 },
  EX_PLUS: { min: 5000, max: 6000 }
};

export function getRiftRankWeight(rank: string): number {
  const ranks = [
    'F_MINUS', 'F', 'E', 'D', 'C', 'B', 'A',
    'S_MINUS', 'S', 'S_PLUS', 'SS_MINUS', 'SS', 'SS_PLUS',
    'SSS_MINUS', 'SSS', 'SSS_PLUS'
  ];
  return ranks.indexOf(rank);
}
