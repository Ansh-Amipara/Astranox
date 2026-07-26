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
  {
    id: 'f_leo',
    name: 'Leo Bug Catcher',
    targetRank: 'F_RANK',
    level: 10,
    team: ["caterpie","scyther"],
    coins: 100,
    xp: 200,
    theme: 'Bug'
  },
  {
    id: 'f_finn',
    name: 'Finn Young Camper',
    targetRank: 'F_RANK',
    level: 15,
    team: ["rattata","snorlax"],
    coins: 100,
    xp: 200,
    theme: 'Normal'
  },
  {
    id: 'f_marina',
    name: 'Marina Rookie Fisher',
    targetRank: 'F_RANK',
    level: 20,
    team: ["psyduck","azumarill"],
    coins: 100,
    xp: 200,
    theme: 'Water'
  },
  {
    id: 'f_ava',
    name: 'Ava Bird Keeper',
    targetRank: 'F_RANK',
    level: 25,
    team: ["pidgey","pidgeotto"],
    coins: 100,
    xp: 200,
    theme: 'Flying'
  },
  {
    id: 'f_theo',
    name: 'Theo Junior Electrician',
    targetRank: 'F_RANK',
    level: 30,
    team: ["voltorb","pikachu"],
    coins: 100,
    xp: 200,
    theme: 'Electric'
  },
  {
    id: 'f_flora',
    name: 'Flora Garden Keeper',
    targetRank: 'F_RANK',
    level: 40,
    team: ["vileplume","bellossom"],
    coins: 100,
    xp: 200,
    theme: 'Grass'
  },
  {
    id: 'f_grant',
    name: 'Grant Quarry Worker',
    targetRank: 'F_RANK',
    level: 50,
    team: ["golem","rhydon"],
    coins: 100,
    xp: 200,
    theme: 'Rock'
  },
  {
    id: 'f_hazel',
    name: 'Hazel Pet Lover',
    targetRank: 'F_RANK',
    level: 60,
    team: ["clefable","wigglytuff"],
    coins: 100,
    xp: 200,
    theme: 'Fairy'
  },
  {
    id: 'e_rowan',
    name: 'Rowan Forest Ranger',
    targetRank: 'E_RANK',
    level: 70,
    team: ["victreebel","exeggutor","vileplume"],
    coins: 500,
    xp: 1000,
    theme: 'Grass'
  },
  {
    id: 'e_drake',
    name: 'Drake Harbor Sailor',
    targetRank: 'E_RANK',
    level: 75,
    team: ["tentacruel","blastoise","milotic"],
    coins: 500,
    xp: 1000,
    theme: 'Water'
  },
  {
    id: 'e_brock',
    name: 'Brock Mountain Hiker',
    targetRank: 'E_RANK',
    level: 80,
    team: ["steelix","rhydon","golem"],
    coins: 500,
    xp: 1000,
    theme: 'Rock'
  },
  {
    id: 'e_hugo',
    name: 'Hugo Steel Smith',
    targetRank: 'E_RANK',
    level: 90,
    team: ["magnezone","steelix","skarmory"],
    coins: 500,
    xp: 1000,
    theme: 'Steel'
  },
  {
    id: 'e_rex',
    name: 'Rex Desert Hunter',
    targetRank: 'E_RANK',
    level: 100,
    team: ["sandslash","dugtrio","marowak"],
    coins: 500,
    xp: 1000,
    theme: 'Ground'
  },
  {
    id: 'e_iris',
    name: 'Iris Caretaker',
    targetRank: 'E_RANK',
    level: 110,
    team: ["togekiss","clefable","sylveon"],
    coins: 500,
    xp: 1000,
    theme: 'Fairy'
  },
  {
    id: 'e_volt',
    name: 'Volt Power Technician',
    targetRank: 'E_RANK',
    level: 115,
    team: ["electrode","raichu","luxray"],
    coins: 500,
    xp: 1000,
    theme: 'Electric'
  },
  {
    id: 'e_kai',
    name: 'Kai Martial Student',
    targetRank: 'E_RANK',
    level: 120,
    team: ["machamp","hitmonlee","hitmonchan"],
    coins: 500,
    xp: 1000,
    theme: 'Fighting'
  },
  {
    id: 'd_blaze',
    name: 'Blaze Flame Veteran',
    targetRank: 'D_RANK',
    level: 130,
    team: ["arcanine","rapidash","magmortar","ninetales"],
    coins: 1500,
    xp: 3500,
    theme: 'Fire'
  },
  {
    id: 'd_selene',
    name: 'Selene Psychic Adept',
    targetRank: 'D_RANK',
    level: 140,
    team: ["alakazam","mr-mime","hypno","espeon"],
    coins: 1500,
    xp: 3500,
    theme: 'Psychic'
  },
  {
    id: 'd_ivy',
    name: 'Ivy Venom Expert',
    targetRank: 'D_RANK',
    level: 150,
    team: ["crobat","weezing","arbok","nidoking"],
    coins: 1500,
    xp: 3500,
    theme: 'Poison'
  },
  {
    id: 'd_elsa',
    name: 'Elsa Ice Explorer',
    targetRank: 'D_RANK',
    level: 160,
    team: ["mamoswine","froslass","glalie","abomasnow"],
    coins: 1500,
    xp: 3500,
    theme: 'Ice'
  },
  {
    id: 'd_doran',
    name: 'Doran Earth Miner',
    targetRank: 'D_RANK',
    level: 170,
    team: ["golem","donphan","hippowdon","rhyperior"],
    coins: 1500,
    xp: 3500,
    theme: 'Ground'
  },
  {
    id: 'd_raven',
    name: 'Raven Spirit Medium',
    targetRank: 'D_RANK',
    level: 180,
    team: ["gengar","mismagius","banette","dusknoir"],
    coins: 1500,
    xp: 3500,
    theme: 'Ghost'
  },
  {
    id: 'd_zephyr',
    name: 'Zephyr Wind Rider',
    targetRank: 'D_RANK',
    level: 190,
    team: ["pidgeot","fearow","dodrio","crobat"],
    coins: 1500,
    xp: 3500,
    theme: 'Flying'
  },
  {
    id: 'd_marina',
    name: 'Marina Deep Sea Captain',
    targetRank: 'D_RANK',
    level: 200,
    team: ["wailord","walrein","lapras","milotic"],
    coins: 1500,
    xp: 3500,
    theme: 'Water'
  },
  {
    id: 'c_roland',
    name: 'Roland Steel Knight',
    targetRank: 'C_RANK',
    level: 210,
    team: ["skarmory","mawile","aggron","bisharp","aegislash"],
    coins: 4000,
    xp: 10000,
    theme: 'Steel'
  },
  {
    id: 'c_orion',
    name: 'Orion Mind Sage',
    targetRank: 'C_RANK',
    level: 220,
    team: ["espeon","gardevoir","gallade","metagross","alakazam"],
    coins: 4000,
    xp: 10000,
    theme: 'Psychic'
  },
  {
    id: 'c_nyx',
    name: 'Nyx Phantom Walker',
    targetRank: 'C_RANK',
    level: 230,
    team: ["banette","dusknoir","chandelure","trevenant","gengar"],
    coins: 4000,
    xp: 10000,
    theme: 'Ghost'
  },
  {
    id: 'c_briar',
    name: 'Briar Forest Guardian',
    targetRank: 'C_RANK',
    level: 250,
    team: ["venusaur","meganium","sceptile","torterra","serperior"],
    coins: 4000,
    xp: 10000,
    theme: 'Grass'
  },
  {
    id: 'c_axel',
    name: 'Axel Storm Caller',
    targetRank: 'C_RANK',
    level: 260,
    team: ["jolteon","ampharos","manectric","luxray","electivire"],
    coins: 4000,
    xp: 10000,
    theme: 'Electric'
  },
  {
    id: 'c_shade',
    name: 'Shade Night Assassin',
    targetRank: 'C_RANK',
    level: 280,
    team: ["umbreon","houndoom","absol","zoroark","weavile"],
    coins: 4000,
    xp: 10000,
    theme: 'Dark'
  },
  {
    id: 'c_kane',
    name: 'Kane Inferno Master',
    targetRank: 'C_RANK',
    level: 290,
    team: ["typhlosion","blaziken","infernape","emboar","charizard"],
    coins: 4000,
    xp: 10000,
    theme: 'Fire'
  },
  {
    id: 'c_terra',
    name: 'Terra Earth Warden',
    targetRank: 'C_RANK',
    level: 300,
    team: ["marowak","donphan","flygon","hippowdon","garchomp"],
    coins: 4000,
    xp: 10000,
    theme: 'Ground'
  },
  {
    id: 'b_magnus',
    name: 'Magnus Iron General',
    targetRank: 'B_RANK',
    level: 310,
    team: ["forretress","scizor","empoleon","lucario","excadrill","metagross"],
    coins: 10000,
    xp: 30000,
    theme: 'Steel'
  },
  {
    id: 'b_freya',
    name: 'Freya Blizzard Queen',
    targetRank: 'B_RANK',
    level: 320,
    team: ["jynx","lapras","glaceon","glalie","abomasnow","weavile"],
    coins: 10000,
    xp: 30000,
    theme: 'Ice'
  },
  {
    id: 'b_jin',
    name: 'Jin Grand Dojo Master',
    targetRank: 'B_RANK',
    level: 340,
    team: ["hitmonlee","hitmonchan","hitmontop","hariyama","lucario","machamp"],
    coins: 10000,
    xp: 30000,
    theme: 'Fighting'
  },
  {
    id: 'b_kairos',
    name: 'Kairos Ocean Lord',
    targetRank: 'B_RANK',
    level: 350,
    team: ["vaporeon","feraligatr","swampert","empoleon","samurott","greninja"],
    coins: 10000,
    xp: 30000,
    theme: 'Water'
  },
  {
    id: 'b_vesper',
    name: 'Vesper Shadow Hunter',
    targetRank: 'B_RANK',
    level: 370,
    team: ["honchkrow","spiritomb","drapion","krookodile","pangoro","hydreigon"],
    coins: 10000,
    xp: 30000,
    theme: 'Dark'
  },
  {
    id: 'b_zephyr',
    name: 'Zephyr Sky Marshal',
    targetRank: 'B_RANK',
    level: 380,
    team: ["aerodactyl","crobat","togekiss","braviary","talonflame","salamence"],
    coins: 10000,
    xp: 30000,
    theme: 'Flying'
  },
  {
    id: 'b_sol',
    name: 'Sol Solar Commander',
    targetRank: 'B_RANK',
    level: 390,
    team: ["ninetales","arcanine","rapidash","magmortar","talonflame","charizard"],
    coins: 10000,
    xp: 30000,
    theme: 'Fire'
  },
  {
    id: 'b_iris',
    name: 'Iris Dragon Disciple',
    targetRank: 'B_RANK',
    level: 400,
    team: ["kingdra","flygon","altaria","haxorus","druddigon","dragonite"],
    coins: 10000,
    xp: 30000,
    theme: 'Dragon'
  },
  {
    id: 'a_ignis',
    name: 'Ignis Crimson Lord',
    targetRank: 'A_RANK',
    level: 410,
    team: ["arcanine","magmortar","blaziken","infernape","volcarona","charizard"],
    coins: 25000,
    xp: 75000,
    theme: 'Fire'
  },
  {
    id: 'a_neptune',
    name: 'Neptune Tide Emperor',
    targetRank: 'A_RANK',
    level: 420,
    team: ["starmie","lapras","milotic","kingdra","swampert","feraligatr"],
    coins: 25000,
    xp: 75000,
    theme: 'Water'
  },
  {
    id: 'a_gaia',
    name: 'Gaia Nature Sovereign',
    targetRank: 'A_RANK',
    level: 440,
    team: ["venusaur","sceptile","breloom","roserade","ferrothorn","rillaboom"],
    coins: 25000,
    xp: 75000,
    theme: 'Grass'
  },
  {
    id: 'a_atlas',
    name: 'Atlas Earth Titan',
    targetRank: 'A_RANK',
    level: 450,
    team: ["steelix","rhyperior","donphan","hippowdon","excadrill","garchomp"],
    coins: 25000,
    xp: 75000,
    theme: 'Ground'
  },
  {
    id: 'a_voltaris',
    name: 'Voltaris Thunder Emperor',
    targetRank: 'A_RANK',
    level: 470,
    team: ["raichu","jolteon","ampharos","magnezone","electivire","galvantula"],
    coins: 25000,
    xp: 75000,
    theme: 'Electric'
  },
  {
    id: 'a_astra',
    name: 'Astra Arcane Master',
    targetRank: 'A_RANK',
    level: 480,
    team: ["alakazam","espeon","gardevoir","gallade","metagross","reuniclus"],
    coins: 25000,
    xp: 75000,
    theme: 'Psychic'
  },
  {
    id: 'a_noctis',
    name: 'Noctis Shadow Monarch',
    targetRank: 'A_RANK',
    level: 490,
    team: ["umbreon","houndoom","tyranitar","weavile","bisharp","krookodile"],
    coins: 25000,
    xp: 75000,
    theme: 'Dark'
  },
  {
    id: 'a_drakon',
    name: 'Drakon Dragon Lord',
    targetRank: 'A_RANK',
    level: 500,
    team: ["dragonite","salamence","garchomp","haxorus","hydreigon","kommo-o"],
    coins: 25000,
    xp: 75000,
    theme: 'Dragon'
  },
  {
    id: 's_minus_solaris',
    name: 'Solaris Hero of Flames',
    targetRank: 'S_MINUS_RANK',
    level: 520,
    team: ["charizard","typhlosion","blaziken","infernape","emboar","incineroar"],
    coins: 50000,
    xp: 150000,
    theme: 'Fire'
  },
  {
    id: 's_minus_leviathan',
    name: 'Leviathan Hero of Oceans',
    targetRank: 'S_MINUS_RANK',
    level: 550,
    team: ["blastoise","feraligatr","swampert","empoleon","samurott","greninja"],
    coins: 50000,
    xp: 150000,
    theme: 'Water'
  },
  {
    id: 's_minus_verdant',
    name: 'Verdant Hero of Nature',
    targetRank: 'S_MINUS_RANK',
    level: 580,
    team: ["venusaur","meganium","sceptile","torterra","serperior","chesnaught"],
    coins: 50000,
    xp: 150000,
    theme: 'Grass'
  },
  {
    id: 's_minus_tempest',
    name: 'Tempest Hero of Storms',
    targetRank: 'S_MINUS_RANK',
    level: 600,
    team: ["pidgeot","noctowl","swellow","staraptor","unfezant","talonflame"],
    coins: 50000,
    xp: 150000,
    theme: 'Flying'
  },
  {
    id: 's_minus_umbra',
    name: 'Umbra Hero of Shadows',
    targetRank: 'S_MINUS_RANK',
    level: 630,
    team: ["tyranitar","mightyena","shiftry","crawdaunt","honchkrow","zoroark"],
    coins: 50000,
    xp: 150000,
    theme: 'Dark'
  },
  {
    id: 's_minus_lumina',
    name: 'Lumina Hero of Light',
    targetRank: 'S_MINUS_RANK',
    level: 660,
    team: ["clefable","wigglytuff","togekiss","gardevoir","sylveon","florges"],
    coins: 50000,
    xp: 150000,
    theme: 'Fairy'
  },
  {
    id: 's_minus_chronos',
    name: 'Chronos Hero of Minds',
    targetRank: 'S_MINUS_RANK',
    level: 680,
    team: ["alakazam","hypno","exeggutor","starmie","mr-mime","metagross"],
    coins: 50000,
    xp: 150000,
    theme: 'Psychic'
  },
  {
    id: 's_minus_aurelion',
    name: 'Aurelion Hero of Dragons',
    targetRank: 'S_MINUS_RANK',
    level: 700,
    team: ["dragonite","salamence","garchomp","hydreigon","goodra","dragapult"],
    coins: 50000,
    xp: 150000,
    theme: 'Dragon'
  }
];
