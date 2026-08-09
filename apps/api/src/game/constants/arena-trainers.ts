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
  // G Rank
  { id: 'f_minus_1', name: 'Rookie Bug Catcher Leo', targetRank: 'G', level: 15, team: ["caterpie","scyther"], coins: 100, xp: 200, theme: 'Bug' },
  // F Rank
  { id: 'f_1', name: 'Junior Camper Finn', targetRank: 'F', level: 35, team: ["rattata","snorlax"], coins: 150, xp: 300, theme: 'Normal' },
  
  // E Rank
  { id: 'e_minus_1', name: 'Forest Ranger Rowan', targetRank: 'E', level: 90, team: ["vileplume","bellossom"], coins: 300, xp: 600, theme: 'Grass' },

  // D Rank
  { id: 'd_minus_1', name: 'Flame Veteran Blaze', targetRank: 'D', level: 250, team: ["arcanine","rapidash","magmortar","ninetales"], coins: 1200, xp: 2500, theme: 'Fire' },

  // C Rank
  { id: 'c_minus_1', name: 'Steel Knight Roland', targetRank: 'C', level: 550, team: ["skarmory","mawile","aggron","bisharp","aegislash"], coins: 3000, xp: 7000, theme: 'Steel' },

  // B Rank
  { id: 'b_minus_1', name: 'Storm Caller Axel', targetRank: 'B', level: 900, team: ["jolteon","ampharos","manectric","luxray","electivire"], coins: 7000, xp: 20000, theme: 'Electric' },

  // A Rank
  { id: 'a_minus_1', name: 'Crimson Lord Ignis', targetRank: 'A', level: 1500, team: ["arcanine","magmortar","blaziken","infernape","volcarona","charizard"], coins: 20000, xp: 60000, theme: 'Fire' },

  // S Rank
  { id: 's_minus_1', name: 'Hero of Flames Solaris', targetRank: 'S_MINUS', level: 2500, team: ["charizard","typhlosion","blaziken","infernape","emboar","incineroar"], coins: 50000, xp: 150000, theme: 'Fire' },
  { id: 's_1', name: 'Hero of Oceans Leviathan', targetRank: 'S', level: 3500, team: ["blastoise","feraligatr","swampert","empoleon","samurott","greninja"], coins: 75000, xp: 225000, theme: 'Water' },
  { id: 's_plus_1', name: 'Hero of Nature Verdant', targetRank: 'S_PLUS', level: 4500, team: ["venusaur","meganium","sceptile","torterra","serperior","chesnaught"], coins: 100000, xp: 300000, theme: 'Grass' }
];
