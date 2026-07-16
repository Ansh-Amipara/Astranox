import { TrainerRank } from '@prisma/client';

export interface AstralRealm {
  id: string;
  name: string;
  tier: number;
  unlockRank: TrainerRank;
  basePotentialRank: TrainerRank;
  pokemon: string[]; // List of species names (lowercase, matching PokeAPI/our DB)
  types: string[]; // Realm primary elemental types
}

export const ASTRAL_REALMS: AstralRealm[] = [
  // --- TIER 1: BRONZE ---
  {
    id: 'meadow',
    name: 'Meadow Realm',
    tier: 1,
    unlockRank: TrainerRank.BRONZE,
    basePotentialRank: TrainerRank.BRONZE,
    pokemon: ['scyther', 'pinsir', 'heracross', 'tangela', 'kangaskhan', 'tauros'],
    types: ['bug', 'normal', 'grass']
  },
  {
    id: 'brook',
    name: 'Brook Realm',
    tier: 1,
    unlockRank: TrainerRank.BRONZE,
    basePotentialRank: TrainerRank.BRONZE,
    pokemon: ['psyduck', 'slowpoke', 'poliwag', 'marill', 'lotad', 'bidoof'],
    types: ['water', 'normal']
  },
  {
    id: 'spore',
    name: 'Spore Realm',
    tier: 1,
    unlockRank: TrainerRank.BRONZE,
    basePotentialRank: TrainerRank.BRONZE,
    pokemon: ['oddish', 'bellsprout', 'venonat', 'shroomish', 'foongus', 'morelull'],
    types: ['grass', 'poison']
  },
  {
    id: 'gust',
    name: 'Gust Realm',
    tier: 1,
    unlockRank: TrainerRank.BRONZE,
    basePotentialRank: TrainerRank.BRONZE,
    pokemon: ['pidgey', 'spearow', 'hoothoot', 'taillow', 'starly', 'fletchling'],
    types: ['flying', 'normal']
  },
  {
    id: 'pebble',
    name: 'Pebble Realm',
    tier: 1,
    unlockRank: TrainerRank.BRONZE,
    basePotentialRank: TrainerRank.BRONZE,
    pokemon: ['geodude', 'onix', 'cubone', 'rhyhorn', 'phanpy', 'roggenrola'],
    types: ['rock', 'ground']
  },
  {
    id: 'spark',
    name: 'Spark Realm',
    tier: 1,
    unlockRank: TrainerRank.BRONZE,
    basePotentialRank: TrainerRank.BRONZE,
    pokemon: ['pikachu', 'voltorb', 'electrike', 'shinx', 'blitzle', 'helioptile'],
    types: ['electric', 'normal']
  },

  // --- TIER 2: SILVER ---
  {
    id: 'cavern',
    name: 'Cavern Realm',
    tier: 2,
    unlockRank: TrainerRank.SILVER,
    basePotentialRank: TrainerRank.SILVER,
    pokemon: ['steelix', 'golem', 'rhydon', 'aggron', 'skarmory', 'excadrill'],
    types: ['rock', 'ground', 'steel']
  },
  {
    id: 'marsh',
    name: 'Marsh Realm',
    tier: 2,
    unlockRank: TrainerRank.SILVER,
    basePotentialRank: TrainerRank.SILVER,
    pokemon: ['tentacruel', 'muk', 'weezing', 'quagsire', 'swalot', 'toxicroak'],
    types: ['poison', 'water']
  },
  {
    id: 'tundra',
    name: 'Tundra Realm',
    tier: 2,
    unlockRank: TrainerRank.SILVER,
    basePotentialRank: TrainerRank.SILVER,
    pokemon: ['dewgong', 'cloyster', 'jynx', 'piloswine', 'delibird', 'glalie'],
    types: ['ice', 'normal']
  },
  {
    id: 'cinder',
    name: 'Cinder Realm',
    tier: 2,
    unlockRank: TrainerRank.SILVER,
    basePotentialRank: TrainerRank.SILVER,
    pokemon: ['magmar', 'houndoom', 'camerupt', 'torkoal', 'magcargo', 'numel'],
    types: ['fire', 'ground']
  },
  {
    id: 'dusk',
    name: 'Dusk Realm',
    tier: 2,
    unlockRank: TrainerRank.SILVER,
    basePotentialRank: TrainerRank.SILVER,
    pokemon: ['umbreon', 'murkrow', 'misdreavus', 'sableye', 'shuppet', 'duskull'],
    types: ['dark', 'ghost']
  },
  {
    id: 'mind',
    name: 'Mind Realm',
    tier: 2,
    unlockRank: TrainerRank.SILVER,
    basePotentialRank: TrainerRank.SILVER,
    pokemon: ['kadabra', 'hypno', 'mr. mime', 'ralts', 'drowzee', 'clefairy'],
    types: ['psychic', 'fairy']
  },

  // --- TIER 3: GOLD ---
  {
    id: 'ancient-forest',
    name: 'Ancient Forest Realm',
    tier: 3,
    unlockRank: TrainerRank.GOLD,
    basePotentialRank: TrainerRank.GOLD,
    pokemon: ['leafeon', 'trevenant', 'sawsbuck', 'decidueye', 'serperior', 'venusaur', 'meganium'],
    types: ['grass', 'ghost', 'normal']
  },
  {
    id: 'coral',
    name: 'Coral Realm',
    tier: 3,
    unlockRank: TrainerRank.GOLD,
    basePotentialRank: TrainerRank.GOLD,
    pokemon: ['corsola', 'relicanth', 'carracosta', 'barbaracle', 'drednaw', 'omastar', 'kabutops'],
    types: ['water', 'rock']
  },
  {
    id: 'mirage',
    name: 'Mirage Realm',
    tier: 3,
    unlockRank: TrainerRank.GOLD,
    basePotentialRank: TrainerRank.GOLD,
    pokemon: ['claydol', 'sigilyph', 'xatu', 'flygon', 'baltoy', 'sandslash', 'marowak'],
    types: ['ground', 'psychic']
  },
  {
    id: 'zenith',
    name: 'Zenith Realm',
    tier: 3,
    unlockRank: TrainerRank.GOLD,
    basePotentialRank: TrainerRank.GOLD,
    pokemon: ['lucario', 'machamp', 'conkeldurr', 'hawlucha', 'pangoro', 'scrafty', 'gallade'],
    types: ['fighting', 'steel']
  },
  {
    id: 'glacier',
    name: 'Glacier Realm',
    tier: 3,
    unlockRank: TrainerRank.GOLD,
    basePotentialRank: TrainerRank.GOLD,
    pokemon: ['walrein', 'abomasnow', 'beartic', 'avalugg', 'crabominable', 'vanilluxe', 'glaceon'],
    types: ['ice', 'water']
  },
  {
    id: 'thunder',
    name: 'Thunder Realm',
    tier: 3,
    unlockRank: TrainerRank.GOLD,
    basePotentialRank: TrainerRank.GOLD,
    pokemon: ['electivire', 'magnezone', 'jolteon', 'luxray', 'zebstrika', 'galvantula', 'eelektross'],
    types: ['electric', 'flying']
  },

  // --- TIER 4: PLATINUM ---
  {
    id: 'abyss',
    name: 'Abyss Realm',
    tier: 4,
    unlockRank: TrainerRank.PLATINUM,
    basePotentialRank: TrainerRank.PLATINUM,
    pokemon: ['spiritomb', 'gengar', 'chandelure', 'zoroark', 'mimikyu', 'aegislash', 'dragapult'],
    types: ['ghost', 'dark', 'steel']
  },
  {
    id: 'volcano',
    name: 'Volcano Realm',
    tier: 4,
    unlockRank: TrainerRank.PLATINUM,
    basePotentialRank: TrainerRank.PLATINUM,
    pokemon: ['tyranitar', 'coalossal', 'turtonator', 'darmanitan', 'centiskorch', 'salazzle', 'houndoom'],
    types: ['fire', 'rock']
  },
  {
    id: 'toxic',
    name: 'Toxic Realm',
    tier: 4,
    unlockRank: TrainerRank.PLATINUM,
    basePotentialRank: TrainerRank.PLATINUM,
    pokemon: ['drapion', 'skuntank', 'garbodor', 'toxtricity', 'overqwil', 'toxapex', 'nidoking'],
    types: ['poison', 'dark']
  },
  {
    id: 'crystal',
    name: 'Crystal Realm',
    tier: 4,
    unlockRank: TrainerRank.PLATINUM,
    basePotentialRank: TrainerRank.PLATINUM,
    pokemon: ['carbink', 'togekiss', 'sylveon', 'florges', 'hatterene', 'tinkaton'],
    types: ['rock', 'fairy']
  },
  {
    id: 'cyclone',
    name: 'Cyclone Realm',
    tier: 4,
    unlockRank: TrainerRank.PLATINUM,
    basePotentialRank: TrainerRank.PLATINUM,
    pokemon: ['noivern', 'altaria', 'crobat', 'aerodactyl', 'braviary', 'talonflame', 'corviknight'],
    types: ['flying', 'dragon']
  },
  {
    id: 'iron',
    name: 'Iron Realm',
    tier: 4,
    unlockRank: TrainerRank.PLATINUM,
    basePotentialRank: TrainerRank.PLATINUM,
    pokemon: ['klinklang', 'togedemaru', 'perrserker', 'copperajah', 'duraludon', 'orthworm', 'magnezone'],
    types: ['steel', 'electric']
  },

  // --- TIER 5: DIAMOND ---
  {
    id: 'inferno',
    name: 'Inferno Realm',
    tier: 5,
    unlockRank: TrainerRank.DIAMOND,
    basePotentialRank: TrainerRank.DIAMOND,
    pokemon: ['volcarona', 'typhlosion', 'arcanine', 'magmortar', 'torkoal', 'charizard', 'blaziken', 'infernape'],
    types: ['fire', 'fighting', 'bug']
  },
  {
    id: 'frozen',
    name: 'Frozen Realm',
    tier: 5,
    unlockRank: TrainerRank.DIAMOND,
    basePotentialRank: TrainerRank.DIAMOND,
    pokemon: ['baxcalibur', 'froslass', 'weavile', 'cetitan', 'lapras', 'mamoswine', 'glaceon', 'walrein'],
    types: ['ice', 'water', 'ground']
  },
  {
    id: 'radiant',
    name: 'Radiant Realm',
    tier: 5,
    unlockRank: TrainerRank.DIAMOND,
    basePotentialRank: TrainerRank.DIAMOND,
    pokemon: ['gardevoir', 'alakazam', 'metagross', 'togekiss', 'sylveon', 'hatterene', 'grimmsnarl', 'clefable'],
    types: ['fairy', 'psychic']
  },
  {
    id: 'eclipse',
    name: 'Eclipse Realm',
    tier: 5,
    unlockRank: TrainerRank.DIAMOND,
    basePotentialRank: TrainerRank.DIAMOND,
    pokemon: ['hydreigon', 'tyranitar', 'malamar', 'grimmsnarl', 'bisharp', 'honchkrow', 'weavile', 'krookodile'],
    types: ['dark', 'psychic']
  },
  {
    id: 'swamp',
    name: 'Swamp Realm',
    tier: 5,
    unlockRank: TrainerRank.DIAMOND,
    basePotentialRank: TrainerRank.DIAMOND,
    pokemon: ['goodra', 'dragalge', 'venusaur', 'gengar', 'toxapex', 'clodsire', 'drapion', 'nidoking'],
    types: ['poison', 'dragon']
  },
  {
    id: 'canyon',
    name: 'Canyon Realm',
    tier: 5,
    unlockRank: TrainerRank.DIAMOND,
    basePotentialRank: TrainerRank.DIAMOND,
    pokemon: ['garchomp', 'flygon', 'tyrantrum', 'aerodactyl', 'rhyperior', 'gigalith', 'lycanroc', 'garganacl'],
    types: ['rock', 'dragon']
  },

  // --- TIER 6: EPIC ---
  {
    id: 'storm',
    name: 'Storm Realm',
    tier: 6,
    unlockRank: TrainerRank.EPIC,
    basePotentialRank: TrainerRank.EPIC,
    pokemon: ['zapdos', 'raikou', 'thundurus', 'magnezone', 'electivire', 'luxray', 'ampharos'],
    types: ['electric', 'steel', 'flying']
  },
  {
    id: 'ocean',
    name: 'Ocean Realm',
    tier: 6,
    unlockRank: TrainerRank.EPIC,
    basePotentialRank: TrainerRank.EPIC,
    pokemon: ['lugia', 'kyogre', 'suicune', 'milotic', 'kingdra', 'primarina', 'lapras'],
    types: ['water', 'psychic', 'flying']
  },
  {
    id: 'dragon',
    name: 'Dragon Realm',
    tier: 6,
    unlockRank: TrainerRank.EPIC,
    basePotentialRank: TrainerRank.EPIC,
    pokemon: ['rayquaza', 'latios', 'latias', 'salamence', 'garchomp', 'dragonite', 'haxorus', 'kommo-o'],
    types: ['dragon', 'flying', 'ground']
  },
  {
    id: 'sky',
    name: 'Sky Realm',
    tier: 6,
    unlockRank: TrainerRank.EPIC,
    basePotentialRank: TrainerRank.EPIC,
    pokemon: ['tornadus', 'ho-oh', 'articuno', 'dragonite', 'corviknight', 'staraptor', 'noivern', 'talonflame'],
    types: ['flying', 'dragon', 'steel']
  },
  {
    id: 'lunar',
    name: 'Lunar Realm',
    tier: 6,
    unlockRank: TrainerRank.EPIC,
    basePotentialRank: TrainerRank.EPIC,
    pokemon: ['cresselia', 'lunala', 'tapu lele', 'tapu fini', 'sylveon', 'umbreon', 'espeon'],
    types: ['fairy', 'dark', 'psychic']
  },
  {
    id: 'solar',
    name: 'Solar Realm',
    tier: 6,
    unlockRank: TrainerRank.EPIC,
    basePotentialRank: TrainerRank.EPIC,
    pokemon: ['entei', 'solgaleo', 'tapu bulu', 'volcarona', 'arcanine', 'venusaur', 'ninetales'],
    types: ['fire', 'grass', 'fairy']
  },

  // --- TIER 7: LEGENDARY ---
  {
    id: 'time',
    name: 'Time Realm',
    tier: 7,
    unlockRank: TrainerRank.LEGENDARY,
    basePotentialRank: TrainerRank.LEGENDARY,
    pokemon: ['dialga', 'celebi', 'metagross', 'bronzong', 'claydol', 'gallade'],
    types: ['steel', 'psychic', 'dragon']
  },
  {
    id: 'space',
    name: 'Space Realm',
    tier: 7,
    unlockRank: TrainerRank.LEGENDARY,
    basePotentialRank: TrainerRank.LEGENDARY,
    pokemon: ['palkia', 'deoxys', 'gardevoir', 'reuniclus', 'beheeyem', 'starmie'],
    types: ['water', 'psychic', 'dragon']
  },
  {
    id: 'distortion',
    name: 'Distortion Realm',
    tier: 7,
    unlockRank: TrainerRank.LEGENDARY,
    basePotentialRank: TrainerRank.LEGENDARY,
    pokemon: ['giratina', 'darkrai', 'spiritomb', 'banette', 'dusclops', 'gengar'],
    types: ['ghost', 'dragon', 'poison']
  },
  {
    id: 'creation',
    name: 'Creation Realm',
    tier: 7, 
    unlockRank: TrainerRank.LEGENDARY,
    basePotentialRank: TrainerRank.LEGENDARY,
    pokemon: ['arceus', 'mew', 'jirachi', 'victini', 'manaphy', 'shaymin'],
    types: ['normal', 'psychic', 'water']
  },
  {
    id: 'nature',
    name: 'Nature Realm',
    tier: 7,
    unlockRank: TrainerRank.LEGENDARY,
    basePotentialRank: TrainerRank.LEGENDARY,
    pokemon: ['xerneas', 'zygarde', 'calyrex', 'landorus', 'virizion', 'cobalion', 'terrakion'],
    types: ['grass', 'fairy', 'ground']
  },
  {
    id: 'ruin',
    name: 'Ruin Realm',
    tier: 7,
    unlockRank: TrainerRank.LEGENDARY,
    basePotentialRank: TrainerRank.LEGENDARY,
    pokemon: ['yveltal', 'eternatus', 'ting-lu', 'chien-pao', 'chi-yu', 'wo-chien', 'kyurem'],
    types: ['dark', 'ice', 'ground']
  }
];
