export function getPotentialBadgeClasses(potential: string): string {
  const baseClasses = "text-[11px] uppercase tracking-wider px-2 py-1 rounded font-bold border";
  
  const themeMap: Record<string, string> = {
    'G': "border-slate-500/50 bg-gradient-to-br from-slate-200 to-gray-300 dark:from-slate-700/40 dark:to-gray-800/40 text-slate-800 dark:text-slate-300",
    'F': "border-slate-500/50 bg-gradient-to-br from-slate-200 to-gray-300 dark:from-slate-700/40 dark:to-gray-800/40 text-slate-800 dark:text-slate-300",
    'E': "border-slate-400/50 bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-700/40 dark:to-gray-800/40 text-slate-700 dark:text-slate-300",
    'D': "border-green-400/50 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-800 dark:text-green-300",
    'C': "border-sky-400/50 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/40 dark:to-blue-900/40 text-sky-800 dark:text-sky-300",
    'B': "border-indigo-400/50 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40 text-indigo-800 dark:text-indigo-300",
    'A': "border-fuchsia-400/50 bg-gradient-to-br from-fuchsia-100 to-purple-100 dark:from-fuchsia-900/40 dark:to-purple-900/40 text-fuchsia-800 dark:text-fuchsia-300",

    'S_MINUS': "border-rose-400/50 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 text-rose-800 dark:text-rose-300",
    'S': "border-rose-400/50 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 text-rose-800 dark:text-rose-300",
    'S_PLUS': "border-rose-400/50 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 text-rose-800 dark:text-rose-300",

    'SS_MINUS': "border-orange-500/50 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 text-orange-800 dark:text-orange-300",
    'SS': "border-orange-500/50 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 text-orange-800 dark:text-orange-300",
    'SS_PLUS': "border-orange-500/50 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 text-orange-800 dark:text-orange-300",

    'SSS_MINUS': "border-red-500/50 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 text-red-800 dark:text-red-300",
    'SSS': "border-red-500/50 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 text-red-800 dark:text-red-300",
    'SSS_PLUS': "border-red-500/50 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 text-red-800 dark:text-red-300",
    
    'EX_MINUS': "border-yellow-400/50 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 text-yellow-800 dark:text-yellow-300",
    'EX': "border-yellow-400/50 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 text-yellow-800 dark:text-yellow-300",
    'EX_PLUS': "border-yellow-400/50 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 text-yellow-800 dark:text-yellow-300",
  };

  const theme = themeMap[potential] || themeMap['D']; // Fallback to D
  return `${baseClasses} ${theme}`;
}

export function formatPotential(potential: string): string {
  return potential.replace('_MINUS', '-').replace('_PLUS', '+').replace('_', ' ');
}

export function getMaxLevelForPotential(potential: string): number {
  const map: Record<string, number> = {
    G: 50, F: 100, E: 250, D: 500, C: 1000, B: 1500, A: 2000, S_MINUS: 3000, S: 4000, S_PLUS: 5000, SS_MINUS: 6000, SS: 7000, SS_PLUS: 8000, SSS_MINUS: 10000, SSS: 12000, SSS_PLUS: 14000, EX_MINUS: 16000, EX: 18000, EX_PLUS: 20000
  };
  return map[potential] || 20000;
}

const xpRequiredForLevelUp = (level: number): number => {
  if (level < 10) return 100;
  if (level < 20) return 200;
  if (level < 30) return 300;
  if (level < 40) return 400;
  if (level < 50) return 500;
  if (level < 60) return 600;
  if (level < 70) return 700;
  if (level < 80) return 800;
  if (level < 90) return 900;
  if (level < 100) return 1000;
  if (level < 1000) return 5000;
  if (level < 10000) return 20000;
  return 50000;
};

export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  let xp = 0;
  for (let i = 1; i < level; i++) xp += xpRequiredForLevelUp(i);
  return xp;
}

export function getLevelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  let level = 1;
  let remainingXp = xp;
  while (true) {
    const required = xpRequiredForLevelUp(level);
    if (remainingXp >= required) {
      remainingXp -= required;
      level++;
    } else {
      break;
    }
  }
  return level;
}
