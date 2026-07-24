export interface ArenaTrainerConfig {
  id: string;
  name: string;
  targetRank: string;
  level: number;
  team: string[];
  coins: number;
  xp: number;
  theme: string;
}

export const ARENA_TRAINERS: ArenaTrainerConfig[] = [
  // ==========================================
  // F RANK TRAINERS (Level 15, 2 Pokemon)
  // ==========================================
  {
    id: 'f_bug_catcher_ben',
    name: 'Bug Catcher Ben',
    targetRank: 'F_RANK',
    level: 15,
    team: ['caterpie', 'weedle'],
    coins: 100,
    xp: 200,
    theme: 'Bug'
  },
  {
    id: 'f_youngster_joey',
    name: 'Youngster Joey',
    targetRank: 'F_RANK',
    level: 15,
    team: ['rattata', 'pidgey'],
    coins: 100,
    xp: 200,
    theme: 'Normal'
  },
  {
    id: 'f_lass_sarah',
    name: 'Lass Sarah',
    targetRank: 'F_RANK',
    level: 15,
    team: ['jigglypuff', 'clefairy'],
    coins: 100,
    xp: 200,
    theme: 'Fairy'
  },
  {
    id: 'f_camper_liam',
    name: 'Camper Liam',
    targetRank: 'F_RANK',
    level: 15,
    team: ['geodude', 'mankey'],
    coins: 100,
    xp: 200,
    theme: 'Rock/Fighting'
  },
  {
    id: 'f_picnicker_mia',
    name: 'Picnicker Mia',
    targetRank: 'F_RANK',
    level: 15,
    team: ['oddish', 'bellsprout'],
    coins: 100,
    xp: 200,
    theme: 'Grass'
  },
  {
    id: 'f_swimmer_luke',
    name: 'Swimmer Luke',
    targetRank: 'F_RANK',
    level: 15,
    team: ['tentacool', 'poliwag'],
    coins: 100,
    xp: 200,
    theme: 'Water'
  },
  {
    id: 'f_hiker_david',
    name: 'Hiker David',
    targetRank: 'F_RANK',
    level: 15,
    team: ['machop', 'geodude'],
    coins: 100,
    xp: 200,
    theme: 'Fighting'
  },
  {
    id: 'f_arsonist_burnie',
    name: 'Pyromaniac Burnie',
    targetRank: 'F_RANK',
    level: 15,
    team: ['charmander', 'growlithe'],
    coins: 100,
    xp: 200,
    theme: 'Fire'
  },

  // ==========================================
  // E RANK TRAINERS (Level 60, 3 Pokemon)
  // ==========================================
  {
    id: 'e_bird_keeper_toby',
    name: 'Bird Keeper Toby',
    targetRank: 'E_RANK',
    level: 60,
    team: ['pidgeotto', 'fearow', 'dodrio'],
    coins: 500,
    xp: 1000,
    theme: 'Flying'
  },
  {
    id: 'e_black_belt_kenji',
    name: 'Black Belt Kenji',
    targetRank: 'E_RANK',
    level: 60,
    team: ['machoke', 'hitmonlee', 'hitmonchan'],
    coins: 500,
    xp: 1000,
    theme: 'Fighting'
  },
  {
    id: 'e_psychic_yuri',
    name: 'Psychic Yuri',
    targetRank: 'E_RANK',
    level: 60,
    team: ['kadabra', 'hypno', 'mr-mime'],
    coins: 500,
    xp: 1000,
    theme: 'Psychic'
  },
  {
    id: 'e_hex_maniac_luna',
    name: 'Hex Maniac Luna',
    targetRank: 'E_RANK',
    level: 60,
    team: ['haunter', 'gengar', 'misdreavus'],
    coins: 500,
    xp: 1000,
    theme: 'Ghost'
  },
  {
    id: 'e_scientist_rick',
    name: 'Scientist Rick',
    targetRank: 'E_RANK',
    level: 60,
    team: ['magneton', 'muk', 'weezing'],
    coins: 500,
    xp: 1000,
    theme: 'Poison'
  },
  {
    id: 'e_sailor_popeye',
    name: 'Sailor Popeye',
    targetRank: 'E_RANK',
    level: 60,
    team: ['machoke', 'poliwrath', 'tentacruel'],
    coins: 500,
    xp: 1000,
    theme: 'Water'
  },
  {
    id: 'e_tamer_cole',
    name: 'Tamer Cole',
    targetRank: 'E_RANK',
    level: 60,
    team: ['sandslash', 'arbok', 'marowak'],
    coins: 500,
    xp: 1000,
    theme: 'Ground'
  },
  {
    id: 'e_firebreather_dick',
    name: 'Firebreather Dick',
    targetRank: 'E_RANK',
    level: 60,
    team: ['magmar', 'arcanine', 'rapidash'],
    coins: 500,
    xp: 1000,
    theme: 'Fire'
  },

  // ==========================================
  // D RANK TRAINERS (Level 120, 4 Pokemon)
  // ==========================================
  {
    id: 'd_ace_trainer_chloe',
    name: 'Ace Trainer Chloe',
    targetRank: 'D_RANK',
    level: 120,
    team: ['starmie', 'tauros', 'exeggutor', 'lapras'],
    coins: 1500,
    xp: 3500,
    theme: 'Balanced'
  },
  {
    id: 'd_dragon_tamer_lance',
    name: 'Dragon Tamer Lance',
    targetRank: 'D_RANK',
    level: 120,
    team: ['dragonair', 'dragonair', 'gyarados', 'aerodactyl'],
    coins: 1500,
    xp: 3500,
    theme: 'Dragon'
  },
  {
    id: 'd_veteran_kyle',
    name: 'Veteran Kyle',
    targetRank: 'D_RANK',
    level: 120,
    team: ['snorlax', 'machamp', 'golem', 'rhydon'],
    coins: 1500,
    xp: 3500,
    theme: 'Heavyweight'
  },
  {
    id: 'd_ninja_boy_koga',
    name: 'Ninja Boy Koga',
    targetRank: 'D_RANK',
    level: 120,
    team: ['crobat', 'venomoth', 'weezing', 'muk'],
    coins: 1500,
    xp: 3500,
    theme: 'Poison'
  },
  {
    id: 'd_beauty_valerie',
    name: 'Beauty Valerie',
    targetRank: 'D_RANK',
    level: 120,
    team: ['ninetales', 'milotic', 'roselia', 'gardevoir'],
    coins: 1500,
    xp: 3500,
    theme: 'Elegant'
  },
  {
    id: 'd_roughneck_biff',
    name: 'Roughneck Biff',
    targetRank: 'D_RANK',
    level: 120,
    team: ['houndoom', 'scrafty', 'krookodile', 'pangoro'],
    coins: 1500,
    xp: 3500,
    theme: 'Dark'
  },
  {
    id: 'd_collector_ian',
    name: 'Collector Ian',
    targetRank: 'D_RANK',
    level: 120,
    team: ['pinsir', 'scyther', 'heracross', 'tauros'],
    coins: 1500,
    xp: 3500,
    theme: 'Rare'
  },
  {
    id: 'd_engineer_spark',
    name: 'Engineer Spark',
    targetRank: 'D_RANK',
    level: 120,
    team: ['raichu', 'electabuzz', 'magneton', 'jolteon'],
    coins: 1500,
    xp: 3500,
    theme: 'Electric'
  },

  // ==========================================
  // C RANK TRAINERS (Level 200, 5 Pokemon)
  // ==========================================
  {
    id: 'c_expert_chen',
    name: 'Expert Chen',
    targetRank: 'C_RANK',
    level: 200,
    team: ['lucario', 'conkeldurr', 'mienshao', 'infernape', 'gallade'],
    coins: 4000,
    xp: 10000,
    theme: 'Fighting'
  },
  {
    id: 'c_glacier_faye',
    name: 'Glacier Faye',
    targetRank: 'C_RANK',
    level: 200,
    team: ['glaceon', 'froslass', 'mamoswine', 'weavile', 'walrein'],
    coins: 4000,
    xp: 10000,
    theme: 'Ice'
  },
  {
    id: 'c_furnace_ignis',
    name: 'Furnace Ignis',
    targetRank: 'C_RANK',
    level: 200,
    team: ['arcanine', 'magmortar', 'blaziken', 'darmanitan', 'volcarona'],
    coins: 4000,
    xp: 10000,
    theme: 'Fire'
  },
  {
    id: 'c_abyss_marina',
    name: 'Abyss Marina',
    targetRank: 'C_RANK',
    level: 200,
    team: ['gyarados', 'vaporeon', 'swampert', 'gastrodon', 'feraligatr'],
    coins: 4000,
    xp: 10000,
    theme: 'Water'
  },
  {
    id: 'c_overgrowth_sylvia',
    name: 'Overgrowth Sylvia',
    targetRank: 'C_RANK',
    level: 200,
    team: ['venusaur', 'sceptile', 'torterra', 'roserade', 'tangrowth'],
    coins: 4000,
    xp: 10000,
    theme: 'Grass'
  },
  {
    id: 'c_thunder_volkner',
    name: 'Thunder Volkner',
    targetRank: 'C_RANK',
    level: 200,
    team: ['luxray', 'electivire', 'ampharos', 'magnezone', 'zapdos'],
    coins: 4000,
    xp: 10000,
    theme: 'Electric'
  },
  {
    id: 'c_geist_mortis',
    name: 'Geist Mortis',
    targetRank: 'C_RANK',
    level: 200,
    team: ['gengar', 'dusknoir', 'chandelure', 'aegislash', 'trevenant'],
    coins: 4000,
    xp: 10000,
    theme: 'Ghost'
  },
  {
    id: 'c_mystic_sabrina',
    name: 'Mystic Sabrina',
    targetRank: 'C_RANK',
    level: 200,
    team: ['alakazam', 'espeon', 'gardevoir', 'metagross', 'reuniclus'],
    coins: 4000,
    xp: 10000,
    theme: 'Psychic'
  },

  // ==========================================
  // B RANK TRAINERS (Level 300, 6 Pokemon)
  // ==========================================
  {
    id: 'b_dragon_master_drake',
    name: 'Dragon Master Drake',
    targetRank: 'B_RANK',
    level: 300,
    team: ['dragonite', 'salamence', 'garchomp', 'haxorus', 'hydreigon', 'goodra'],
    coins: 10000,
    xp: 30000,
    theme: 'Dragon'
  },
  {
    id: 'b_steel_titan_steven',
    name: 'Steel Titan Steven',
    targetRank: 'B_RANK',
    level: 300,
    team: ['skarmory', 'aggron', 'metagross', 'lucario', 'excadrill', 'ferrothorn'],
    coins: 10000,
    xp: 30000,
    theme: 'Steel'
  },
  {
    id: 'b_fairy_queen_diantha',
    name: 'Fairy Queen Diantha',
    targetRank: 'B_RANK',
    level: 300,
    team: ['clefable', 'togekiss', 'gardevoir', 'sylveon', 'florges', 'mimikyu'],
    coins: 10000,
    xp: 30000,
    theme: 'Fairy'
  },
  {
    id: 'b_sandstorm_bruno',
    name: 'Sandstorm Bruno',
    targetRank: 'B_RANK',
    level: 300,
    team: ['tyranitar', 'hippowdon', 'excadrill', 'garchomp', 'gliscor', 'gastrodon'],
    coins: 10000,
    xp: 30000,
    theme: 'Sand'
  },
  {
    id: 'b_rain_dancer_wallace',
    name: 'Rain Dancer Wallace',
    targetRank: 'B_RANK',
    level: 300,
    team: ['politoed', 'kingdra', 'ludicolo', 'swampert', 'ferrothorn', 'kabutops'],
    coins: 10000,
    xp: 30000,
    theme: 'Rain'
  },
  {
    id: 'b_sun_bringer_flannery',
    name: 'Sun Bringer Flannery',
    targetRank: 'B_RANK',
    level: 300,
    team: ['ninetales', 'charizard', 'venusaur', 'darmanitan', 'volcarona', 'torkoal'],
    coins: 10000,
    xp: 30000,
    theme: 'Sun'
  },
  {
    id: 'b_shadow_karen',
    name: 'Shadow Karen',
    targetRank: 'B_RANK',
    level: 300,
    team: ['umbreon', 'houndoom', 'honchkrow', 'weavile', 'bisharp', 'hydreigon'],
    coins: 10000,
    xp: 30000,
    theme: 'Dark'
  },
  {
    id: 'b_poison_fang_koga',
    name: 'Poison Fang Koga',
    targetRank: 'B_RANK',
    level: 300,
    team: ['crobat', 'venomoth', 'muk', 'weezing', 'toxicroak', 'drapion'],
    coins: 10000,
    xp: 30000,
    theme: 'Poison'
  },

  // ==========================================
  // A RANK TRAINERS (Level 400, 6 Pokemon)
  // ==========================================
  {
    id: 'a_champion_cynthia',
    name: 'Champion Cynthia',
    targetRank: 'A_RANK',
    level: 400,
    team: ['spiritomb', 'roserade', 'togekiss', 'lucario', 'milotic', 'garchomp'],
    coins: 25000,
    xp: 75000,
    theme: 'Champion'
  },
  {
    id: 'a_champion_red',
    name: 'Legend Red',
    targetRank: 'A_RANK',
    level: 400,
    team: ['pikachu', 'lapras', 'snorlax', 'venusaur', 'charizard', 'blastoise'],
    coins: 25000,
    xp: 75000,
    theme: 'Legend'
  },
  {
    id: 'a_paradox_professor',
    name: 'Paradox Professor',
    targetRank: 'A_RANK',
    level: 400,
    team: ['great-tusk', 'scream-tail', 'brute-bonnet', 'flutter-mane', 'slither-wing', 'roaring-moon'],
    coins: 25000,
    xp: 75000,
    theme: 'Past Paradox'
  },
  {
    id: 'a_future_scientist',
    name: 'Future Scientist',
    targetRank: 'A_RANK',
    level: 400,
    team: ['iron-treads', 'iron-bundle', 'iron-hands', 'iron-jugulis', 'iron-moth', 'iron-valiant'],
    coins: 25000,
    xp: 75000,
    theme: 'Future Paradox'
  },
  {
    id: 'a_beast_caller',
    name: 'Beast Caller',
    targetRank: 'A_RANK',
    level: 400,
    team: ['nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana'],
    coins: 25000,
    xp: 75000,
    theme: 'Ultra Beasts'
  },
  {
    id: 'a_weather_trio',
    name: 'Weather Master',
    targetRank: 'A_RANK',
    level: 400,
    team: ['castform', 'pelipper', 'torkoal', 'hippowdon', 'abomasnow', 'rayquaza'],
    coins: 25000,
    xp: 75000,
    theme: 'Weather'
  },
  {
    id: 'a_space_time_guru',
    name: 'Space Time Guru',
    targetRank: 'A_RANK',
    level: 400,
    team: ['bronzong', 'magnezone', 'porygon-z', 'togekiss', 'lucario', 'garchomp'],
    coins: 25000,
    xp: 75000,
    theme: 'Sinnoh'
  },
  {
    id: 'a_draconic_elder',
    name: 'Draconic Elder',
    targetRank: 'A_RANK',
    level: 400,
    team: ['dragonite', 'salamence', 'garchomp', 'haxorus', 'hydreigon', 'kommo-o'],
    coins: 25000,
    xp: 75000,
    theme: 'All Dragons'
  }
];
