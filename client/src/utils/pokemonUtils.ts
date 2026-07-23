export function getPotentialBadgeClasses(potential: string): string {
  const baseClasses = "text-[11px] uppercase tracking-wider px-2 py-1 rounded font-bold border";
  
  const themeMap: Record<string, string> = {
    'BLACK_IRON': "border-slate-500/50 bg-gradient-to-br from-slate-200 to-gray-300 dark:from-slate-700/40 dark:to-gray-800/40 text-slate-800 dark:text-slate-300",
    'BRONZE': "border-amber-600/50 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-800 dark:text-amber-400",
    'SILVER': "border-slate-400/50 bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-700/40 dark:to-gray-800/40 text-slate-700 dark:text-slate-300",
    'GOLD': "border-yellow-400/50 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 text-yellow-800 dark:text-yellow-300",
    'PLATINUM': "border-cyan-400/50 bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/40 dark:to-teal-900/40 text-cyan-800 dark:text-cyan-300",
    'ADAMANTITE': "border-red-500/50 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 text-red-800 dark:text-red-300",
    'DIAMOND': "border-sky-400/50 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/40 dark:to-blue-900/40 text-sky-800 dark:text-sky-300",
    'CRYSTAL': "border-fuchsia-400/50 bg-gradient-to-br from-fuchsia-100 to-purple-100 dark:from-fuchsia-900/40 dark:to-purple-900/40 text-fuchsia-800 dark:text-fuchsia-300",
    'EPIC': "border-purple-500/50 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 text-purple-800 dark:text-purple-300",
  };

  const theme = themeMap[potential] || themeMap['GOLD']; // Fallback to gold if not defined
  return `${baseClasses} ${theme}`;
}
