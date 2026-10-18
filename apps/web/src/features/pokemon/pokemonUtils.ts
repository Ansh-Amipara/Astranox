import {
  getMaxLevelForPotential,
  getXpForLevel,
  getLevelFromXp,
  PROGRESSION_CONSTANTS,
} from '@astranox/constants';

export function getPotentialBadgeClasses(potential: string): string {
  const baseClasses = "text-[11px] uppercase tracking-wider px-2 py-1 rounded font-bold border transition-colors";
  
  const themeMap: Record<string, string> = {
    'F': "border-border bg-surface text-muted",
    'E': "border-border bg-surface text-muted",
    'D': "border-border bg-surface text-muted",
    'C': "border-border bg-surface text-foreground",
    'B': "border-border bg-surface-raised text-foreground",
    'A': "border-border bg-surface-raised text-foreground font-extrabold",

    'S_MINUS': "border-border bg-surface text-foreground font-extrabold",
    'S': "border-border bg-surface-raised text-foreground font-extrabold",
    'S_PLUS': "border-border bg-surface-raised text-foreground font-extrabold shadow-sm",

    'SS_MINUS': "border-border bg-surface text-foreground font-black",
    'SS': "border-border bg-surface-raised text-foreground font-black",
    'SS_PLUS': "border-border bg-surface-raised text-foreground font-black shadow-glow",

    'SSS_MINUS': "border-border bg-surface-raised text-foreground font-black shadow-glow",
    'SSS': "border-foreground bg-surface text-foreground font-black ring-1 ring-border shadow-glow",
    'SSS_PLUS': "border-foreground bg-primary text-primary-foreground font-black shadow-glow-lg",
    
    'EX': "border-foreground bg-primary text-primary-foreground font-black shadow-glow-lg ring-1 ring-foreground",
  };

  const theme = themeMap[potential] || themeMap['D'];
  return `${baseClasses} ${theme}`;
}

export function formatPotential(potential: string): string {
  return potential.replace('_MINUS', '-').replace('_PLUS', '+').replace('_', ' ');
}

export { getMaxLevelForPotential, getXpForLevel, getLevelFromXp };

export const xpRequiredForLevelUp = (_level?: number): number => {
  return PROGRESSION_CONSTANTS.XP_PER_LEVEL;
};
