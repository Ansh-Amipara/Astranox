export function getPotentialBadgeClasses(potential: string): string {
  const baseClasses = "text-[11px] uppercase tracking-wider px-2 py-1 rounded font-bold border";
  
  const themeMap: Record<string, string> = {
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
    
    'EX': "border-yellow-400/50 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 text-yellow-800 dark:text-yellow-300",
  };

  const theme = themeMap[potential] || themeMap['D']; // Fallback to D
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
