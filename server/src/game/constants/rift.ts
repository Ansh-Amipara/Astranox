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
  F_RANK: 2,
  E_RANK: 2,
  D_RANK: 3,
  C_RANK: 3,
  B_RANK: 4,
  A_RANK: 4,
  S_MINUS_RANK: 5,
  S_RANK: 5,
  S_PLUS_RANK: 5,
  SS_MINUS_RANK: 5,
  SS_RANK: 5,
  SS_PLUS_RANK: 5,
  SSS_MINUS_RANK: 5,
  SSS_RANK: 5,
  SSS_PLUS_RANK: 5
};

// Base Infinity Coin reward per floor (before difficulty multiplier)
// Increases as the Trainer Rank of the Rift increases.
export const RIFT_BASE_INFINITY_COINS: Record<string, number> = {
  F_RANK: 10,
  E_RANK: 25,
  D_RANK: 50,
  C_RANK: 100,
  B_RANK: 200,
  A_RANK: 400,
  S_MINUS_RANK: 800,
  S_RANK: 1500,
  S_PLUS_RANK: 3000,
  SS_MINUS_RANK: 5000,
  SS_RANK: 8000,
  SS_PLUS_RANK: 12000,
  SSS_MINUS_RANK: 20000,
  SSS_RANK: 35000,
  SSS_PLUS_RANK: 50000
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
  F_RANK: 'F_TIER',
  E_RANK: 'MID_TIER',
  D_RANK: 'MID_TIER',
  C_RANK: 'MID_TIER',
  B_RANK: 'HIGH_TIER',
  A_RANK: 'HIGH_TIER',
  S_MINUS_RANK: 'LEGENDARY_TIER',
  S_RANK: 'LEGENDARY_TIER',
  S_PLUS_RANK: 'LEGENDARY_TIER',
  SS_MINUS_RANK: 'MYTHICAL_TIER',
  SS_RANK: 'MYTHICAL_TIER',
  SS_PLUS_RANK: 'MYTHICAL_TIER',
  SSS_MINUS_RANK: 'GOD_TIER',
  SSS_RANK: 'GOD_TIER',
  SSS_PLUS_RANK: 'GOD_TIER',
};

export const RIFT_LEVEL_RANGES: Record<string, { min: number; max: number }> = {
  F_RANK: { min: 10, max: 25 },
  E_RANK: { min: 30, max: 50 },
  D_RANK: { min: 60, max: 90 },
  C_RANK: { min: 100, max: 150 },
  B_RANK: { min: 160, max: 250 },
  A_RANK: { min: 260, max: 400 },
  S_MINUS_RANK: { min: 410, max: 600 },
  S_RANK: { min: 610, max: 800 },
  S_PLUS_RANK: { min: 810, max: 1000 },
  SS_MINUS_RANK: { min: 1010, max: 1300 },
  SS_RANK: { min: 1310, max: 1600 },
  SS_PLUS_RANK: { min: 1610, max: 1900 },
  SSS_MINUS_RANK: { min: 1910, max: 2500 },
  SSS_RANK: { min: 2510, max: 3500 },
  SSS_PLUS_RANK: { min: 3510, max: 4500 }
};

export function getRiftRankWeight(rank: string): number {
  const ranks = [
    'NO_RANK', 'F_RANK', 'E_RANK', 'D_RANK', 'C_RANK', 'B_RANK', 'A_RANK',
    'S_MINUS_RANK', 'S_RANK', 'S_PLUS_RANK', 'SS_MINUS_RANK', 'SS_RANK', 'SS_PLUS_RANK',
    'SSS_MINUS_RANK', 'SSS_RANK', 'SSS_PLUS_RANK'
  ];
  return ranks.indexOf(rank);
}
