export function getPotentialBadgeClasses(potential: string): string {
  const baseClasses = "text-[11px] uppercase tracking-wider px-2 py-1 rounded font-bold border transition-colors";
  
  const themeMap: Record<string, string> = {
    'F': "border-neutral-800 bg-neutral-900 text-neutral-400",
    'E': "border-neutral-800 bg-neutral-900 text-neutral-400",
    'D': "border-neutral-700 bg-neutral-900 text-neutral-300",
    'C': "border-neutral-700 bg-neutral-900 text-neutral-200",
    'B': "border-neutral-600 bg-neutral-800 text-neutral-200",
    'A': "border-neutral-500 bg-neutral-800 text-white font-extrabold",

    'S_MINUS': "border-neutral-400 bg-neutral-900 text-white font-extrabold",
    'S': "border-neutral-400 bg-neutral-800 text-white font-extrabold",
    'S_PLUS': "border-neutral-300 bg-neutral-800 text-white font-extrabold shadow-sm",

    'SS_MINUS': "border-neutral-300 bg-neutral-900 text-white font-black",
    'SS': "border-neutral-200 bg-neutral-800 text-white font-black",
    'SS_PLUS': "border-white bg-neutral-900 text-white font-black shadow-glow",

    'SSS_MINUS': "border-white bg-neutral-800 text-white font-black shadow-glow",
    'SSS': "border-white bg-black text-white font-black ring-1 ring-neutral-400 shadow-glow",
    'SSS_PLUS': "border-white bg-white text-black font-black shadow-glow-lg",
    
    'EX': "border-white bg-white text-black font-black shadow-glow-lg ring-1 ring-white",
  };

  const theme = themeMap[potential] || themeMap['D'];
  return `${baseClasses} ${theme}`;
}

export function formatPotential(potential: string): string {
  return potential.replace('_MINUS', '-').replace('_PLUS', '+').replace('_', ' ');
}

export function getMaxLevelForPotential(potential: string): number {
  const map: Record<string, number> = {
    F: 25,
    E: 50,
    D: 75,
    C: 100,
    B: 150,
    A: 200,
    S_MINUS: 300,
    S: 350,
    S_PLUS: 400,
    SS_MINUS: 500,
    SS: 600,
    SS_PLUS: 700,
    SSS_MINUS: 800,
    SSS: 900,
    SSS_PLUS: 1000,
    EX: 5000,
  };
  return map[potential] || 5000;
}

export const xpRequiredForLevelUp = (_level?: number): number => {
  return 100;
};

export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * 100 + 1;
}

export function getLevelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  return Math.floor((xp - 1) / 100) + 1;
}
