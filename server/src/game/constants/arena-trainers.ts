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
  // F Rank
  { id: 'f_minus_1', name: 'Rookie Bug Catcher Leo', targetRank: 'F_MINUS', level: 15, team: ["caterpie","scyther"], coins: 100, xp: 200, theme: 'Bug' },
  { id: 'f_1', name: 'Junior Camper Finn', targetRank: 'F', level: 35, team: ["rattata","snorlax"], coins: 150, xp: 300, theme: 'Normal' },
  { id: 'f_plus_1', name: 'Senior Fisher Marina', targetRank: 'F_PLUS', level: 65, team: ["psyduck","azumarill"], coins: 200, xp: 400, theme: 'Water' },
  
  // E Rank
  { id: 'e_minus_1', name: 'Forest Ranger Rowan', targetRank: 'E_MINUS', level: 90, team: ["vileplume","bellossom"], coins: 300, xp: 600, theme: 'Grass' },
  { id: 'e_1', name: 'Mountain Hiker Brock', targetRank: 'E', level: 125, team: ["steelix","rhydon","golem"], coins: 500, xp: 1000, theme: 'Rock' },
  { id: 'e_plus_1', name: 'Desert Hunter Rex', targetRank: 'E_PLUS', level: 175, team: ["sandslash","dugtrio","marowak"], coins: 800, xp: 1500, theme: 'Ground' },

  // D Rank
  { id: 'd_minus_1', name: 'Flame Veteran Blaze', targetRank: 'D_MINUS', level: 250, team: ["arcanine","rapidash","magmortar","ninetales"], coins: 1200, xp: 2500, theme: 'Fire' },
  { id: 'd_1', name: 'Psychic Adept Selene', targetRank: 'D', level: 350, team: ["alakazam","mr-mime","hypno","espeon"], coins: 1500, xp: 3500, theme: 'Psychic' },
  { id: 'd_plus_1', name: 'Venom Expert Ivy', targetRank: 'D_PLUS', level: 450, team: ["crobat","weezing","arbok","nidoking"], coins: 2000, xp: 4500, theme: 'Poison' },

  // C Rank
  { id: 'c_minus_1', name: 'Steel Knight Roland', targetRank: 'C_MINUS', level: 550, team: ["skarmory","mawile","aggron","bisharp","aegislash"], coins: 3000, xp: 7000, theme: 'Steel' },
  { id: 'c_1', name: 'Mind Sage Orion', targetRank: 'C', level: 650, team: ["espeon","gardevoir","gallade","metagross","alakazam"], coins: 4000, xp: 10000, theme: 'Psychic' },
  { id: 'c_plus_1', name: 'Phantom Walker Nyx', targetRank: 'C_PLUS', level: 750, team: ["banette","dusknoir","chandelure","trevenant","gengar"], coins: 5000, xp: 12000, theme: 'Ghost' },

  // B Rank
  { id: 'b_minus_1', name: 'Storm Caller Axel', targetRank: 'B_MINUS', level: 900, team: ["jolteon","ampharos","manectric","luxray","electivire"], coins: 7000, xp: 20000, theme: 'Electric' },
  { id: 'b_1', name: 'Blizzard Queen Freya', targetRank: 'B', level: 1100, team: ["jynx","lapras","glaceon","glalie","abomasnow","weavile"], coins: 10000, xp: 30000, theme: 'Ice' },
  { id: 'b_plus_1', name: 'Grand Dojo Master Jin', targetRank: 'B_PLUS', level: 1300, team: ["hitmonlee","hitmonchan","hitmontop","hariyama","lucario","machamp"], coins: 15000, xp: 45000, theme: 'Fighting' },

  // A Rank
  { id: 'a_minus_1', name: 'Crimson Lord Ignis', targetRank: 'A_MINUS', level: 1500, team: ["arcanine","magmortar","blaziken","infernape","volcarona","charizard"], coins: 20000, xp: 60000, theme: 'Fire' },
  { id: 'a_1', name: 'Tide Emperor Neptune', targetRank: 'A', level: 1700, team: ["starmie","lapras","milotic","kingdra","swampert","feraligatr"], coins: 25000, xp: 75000, theme: 'Water' },
  { id: 'a_plus_1', name: 'Nature Sovereign Gaia', targetRank: 'A_PLUS', level: 1900, team: ["venusaur","sceptile","breloom","roserade","ferrothorn","rillaboom"], coins: 30000, xp: 90000, theme: 'Grass' },

  // S Rank
  { id: 's_minus_1', name: 'Hero of Flames Solaris', targetRank: 'S_MINUS', level: 2500, team: ["charizard","typhlosion","blaziken","infernape","emboar","incineroar"], coins: 50000, xp: 150000, theme: 'Fire' },
  { id: 's_1', name: 'Hero of Oceans Leviathan', targetRank: 'S', level: 3500, team: ["blastoise","feraligatr","swampert","empoleon","samurott","greninja"], coins: 75000, xp: 225000, theme: 'Water' },
  { id: 's_plus_1', name: 'Hero of Nature Verdant', targetRank: 'S_PLUS', level: 4500, team: ["venusaur","meganium","sceptile","torterra","serperior","chesnaught"], coins: 100000, xp: 300000, theme: 'Grass' }
];
