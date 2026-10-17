import React, { useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { shopApi } from '@/shared/api/api';
const RIFT_REWARD_MULTIPLIERS: Record<string, number> = {
  NORMAL: 1.0,
  HARD: 1.5,
  NIGHTMARE: 2.5,
  ABYSS: 4.0
};

const RIFT_MAX_FLOORS: Record<string, number> = {
  F: 2, E: 2, D: 3, C: 3, B: 4, A: 4,
  S_MINUS: 5, S: 5, S_PLUS: 5, SS_MINUS: 5, SS: 5, SS_PLUS: 5,
  SSS_MINUS: 5, SSS: 5, SSS_PLUS: 5,
  EX: 5
};

const RIFT_BASE_INFINITY_COINS: Record<string, number> = {
  F: 10, E: 25, D: 50, C: 100, B: 200, A: 400,
  S_MINUS: 800, S: 1500, S_PLUS: 3000, SS_MINUS: 5000,
  SS: 8000, SS_PLUS: 12000, SSS_MINUS: 20000, SSS: 35000, SSS_PLUS: 50000,
  EX: 100000
};

const RIFT_LEVEL_RANGES: Record<string, { min: number; max: number }> = {
  F: { min: 10, max: 25 },
  E: { min: 26, max: 50 },
  D: { min: 51, max: 75 },
  C: { min: 76, max: 100 },
  B: { min: 101, max: 150 },
  A: { min: 151, max: 200 },
  S_MINUS: { min: 201, max: 300 },
  S: { min: 301, max: 350 },
  S_PLUS: { min: 351, max: 400 },
  SS_MINUS: { min: 401, max: 500 },
  SS: { min: 501, max: 600 },
  SS_PLUS: { min: 601, max: 700 },
  SSS_MINUS: { min: 701, max: 800 },
  SSS: { min: 801, max: 900 },
  SSS_PLUS: { min: 901, max: 1000 },
  EX: { min: 1001, max: 5000 }
};

const RIFT_RANKS = [
  'F', 'E', 'D', 'C', 'B', 'A',
  'S_MINUS', 'S', 'S_PLUS', 'SS_MINUS', 'SS', 'SS_PLUS',
  'SSS_MINUS', 'SSS', 'SSS_PLUS',
  'EX'
];

const formatRankName = (rank: string) => {
  return rank.replace('_', '').replace('_MINUS', '-').replace('_PLUS', '+').replace('_', ' ');
};

const RIFT_TABLE_DATA = RIFT_RANKS.flatMap(rank => {
  const maxFloors = RIFT_MAX_FLOORS[rank];
  const baseCoins = RIFT_BASE_INFINITY_COINS[rank];
  const levelRange = RIFT_LEVEL_RANGES[rank];

  return Array.from({ length: maxFloors }).map((_, i) => {
    const floor = i + 1;
    const floorMultiplier = 1 + (floor - 1) * 0.5;
    const levelProgress = floor / maxFloors;
    const enemyLevel = Math.floor(levelRange.min + (levelRange.max - levelRange.min) * levelProgress);

    return {
      rank: formatRankName(rank),
      floor,
      level: enemyLevel,
      normal: Math.floor(baseCoins * RIFT_REWARD_MULTIPLIERS.NORMAL * floorMultiplier),
      hard: Math.floor(baseCoins * RIFT_REWARD_MULTIPLIERS.HARD * floorMultiplier),
      nightmare: Math.floor(baseCoins * RIFT_REWARD_MULTIPLIERS.NIGHTMARE * floorMultiplier),
      abyss: Math.floor(baseCoins * RIFT_REWARD_MULTIPLIERS.ABYSS * floorMultiplier),
      isFirstFloor: floor === 1,
      rowSpan: maxFloors
    };
  });
});

const TABLE_DATA = [
  { rank: 'F', maxLevel: 25 },
  { rank: 'E', maxLevel: 50 },
  { rank: 'D', maxLevel: 75 },
  { rank: 'C', maxLevel: 100 },
  { rank: 'B', maxLevel: 150 },
  { rank: 'A', maxLevel: 200 },
  { rank: 'S-', maxLevel: 300 },
  { rank: 'S', maxLevel: 350 },
  { rank: 'S+', maxLevel: 400 },
  { rank: 'SS-', maxLevel: 500 },
  { rank: 'SS', maxLevel: 600 },
  { rank: 'SS+', maxLevel: 700 },
  { rank: 'SSS-', maxLevel: 800 },
  { rank: 'SSS', maxLevel: 900 },
  { rank: 'SSS+', maxLevel: 1000 },
  { rank: 'EX', maxLevel: 5000 },
];

const EXPLORE_BIOMES = [
  { name: 'Plains', types: 'Normal, Grass, Flying' },
  { name: 'Forest', types: 'Bug, Grass, Poison' },
  { name: 'Swamp', types: 'Poison, Ground, Water' },
  { name: 'Desert', types: 'Ground, Rock, Fire' },
  { name: 'Ocean', types: 'Water, Ice' },
  { name: 'Mountain', types: 'Rock, Ground, Fighting' },
  { name: 'Frozen Peaks', types: 'Ice, Steel' },
  { name: 'Haunted Ruins', types: 'Ghost, Dark, Poison' },
  { name: 'Volcano', types: 'Fire, Ground, Rock' },
  { name: 'Fairy Garden', types: 'Fairy, Grass, Psychic' },
  { name: 'Ancient Temple', types: 'Psychic, Ghost, Dragon' },
  { name: 'Crystal Cave', types: 'Rock, Steel, Fairy' },
  { name: 'Sky Islands', types: 'Flying, Dragon, Electric' },
];

const EXPLORE_REGIONS = [
  { name: 'Astralis Frontier', types: 'Alolan, Galarian, Hisuian, and Paldean Forms' }
];

const EXPLORE_RARE_POOLS = [
  { category: 'Pseudo Legendary', probability: '0.300%' },
  { category: 'Ultra Beast', probability: '0.080%' },
  { category: 'Paradox', probability: '0.070%' },
  { category: 'Mythical', probability: '0.030%' },
  { category: 'Legendary', probability: '0.019%' },
  { category: 'Super Legendary', probability: '0.001%' },
];


export function InfoPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'explore' | 'rift' | 'furnace' | 'tower' | 'pokemart'>('general');

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 md:p-12">
      <div className="w-full mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Game Information</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 mb-10 border-b border-border pb-4">
          {(['general', 'explore', 'rift', 'furnace', 'tower', 'pokemart'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base font-bold rounded-xl transition-all capitalize shadow-sm border ${activeTab === tab ? 'bg-surface-raised text-foreground border-border shadow-glow' : 'bg-surface text-muted border-border hover:bg-surface-raised ' }`}
            >
              {tab === 'explore' ? 'Explore Realms' : tab === 'rift' ? 'Void Rifts' : tab === 'furnace' ? 'Astral Furnace' : tab === 'tower' ? 'Infinity Tower' : tab === 'pokemart' ? 'Pokémart' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'general' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-raised/50 border-b border-border">
                      <th className="py-5 px-6 font-bold text-muted uppercase tracking-wider text-sm">Trainer Rank</th>
                      <th className="py-5 px-6 font-bold text-muted uppercase tracking-wider text-sm text-right">Maximum Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {TABLE_DATA.map((row) => (
                      <tr
                        key={row.rank}
                        className="hover:bg-surface-raised transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <span className="font-bold text-lg text-foreground group-hover:text-foreground transition-colors">
                            {row.rank}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-raised text-foreground font-bold font-mono text-sm border border-border/30">
                            {row.maxLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Explore Realms</h1>
              </div>
            </div>

            <div className="bg-surface rounded-3xl border border-border shadow-sm p-5 sm:p-8 mb-6 sm:mb-10 text-muted text-base sm:text-lg leading-relaxed">
              <p className="mb-4">
                The <span className="font-bold text-foreground">Explore System</span> allows you to venture into different wild biomes to discover Pokémon and Astral Coins.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><span className="font-bold text-foreground">Wild Potential Range (F to SSS+):</span> Wild Pokémon encountered in explore expeditions have potentials naturally ranging from <span className="font-bold">F Rank</span> up to <span className="font-bold">SSS+ Rank</span>. Every expedition gives you an authentic chance to discover extraordinary Pokémon without artificial rank lockouts!</li>
              </ul>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Explore Biomes & Types</h1>
                <p className="text-muted mt-2">Discover different Pokémon types by visiting specific biomes.</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden mb-10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-raised/50 border-b border-border">
                      <th className="py-5 px-6 font-bold text-muted uppercase tracking-wider text-sm">Biome</th>
                      <th className="py-5 px-6 font-bold text-muted uppercase tracking-wider text-sm">Common Types</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {EXPLORE_BIOMES.map((row) => (
                      <tr key={row.name} className="hover:bg-surface-raised transition-colors group">
                        <td className="py-4 px-6 font-bold text-lg text-foreground">{row.name}</td>
                        <td className="py-4 px-6 text-muted font-medium">{row.types}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Special Regions</h1>
              </div>
            </div>

            <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden mb-10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-raised/50 border-b border-border">
                      <th className="py-5 px-6 font-bold text-muted uppercase tracking-wider text-sm">Region</th>
                      <th className="py-5 px-6 font-bold text-muted uppercase tracking-wider text-sm">Features</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {EXPLORE_REGIONS.map((row) => (
                      <tr key={row.name} className="hover:bg-surface-raised transition-colors group">
                        <td className="py-4 px-6 font-bold text-lg text-foreground">{row.name}</td>
                        <td className="py-4 px-6 text-muted font-medium">{row.types}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Rare Encounters Probability</h1>
                <p className="text-muted mt-2">These pools bypass standard biomes and trigger dynamically.</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden mb-10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-raised/50 border-b border-border">
                      <th className="py-5 px-6 font-bold text-muted uppercase tracking-wider text-sm">Category</th>
                      <th className="py-5 px-6 font-bold text-muted uppercase tracking-wider text-sm text-right">Probability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {EXPLORE_RARE_POOLS.map((row) => (
                      <tr key={row.category} className="hover:bg-surface-raised transition-colors group">
                        <td className="py-4 px-6 font-bold text-lg text-foreground">{row.category}</td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-foreground">{row.probability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rift' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Corrupted Stats Multipliers</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm">
                <h3 className="text-xl font-bold text-muted mb-4 uppercase tracking-widest text-center">Normal</h3>
                <ul className="space-y-3 text-muted font-medium">
                  <li className="flex justify-between items-center bg-surface-raised/50 p-3 rounded-xl"><span className="text-foreground font-bold">HP</span> <span>+50%</span></li>
                  <li className="flex justify-between items-center bg-surface-raised/50 p-3 rounded-xl"><span className="text-foreground font-bold">ATK/DEF/SPA/SPD</span> <span>+10%</span></li>
                  <li className="flex justify-between items-center bg-surface-raised/50 p-3 rounded-xl"><span className="text-foreground font-bold">SPE</span> <span>+5%</span></li>
                </ul>
              </div>

              <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm">
                <h3 className="text-xl font-bold text-muted mb-4 uppercase tracking-widest text-center">Hard</h3>
                <ul className="space-y-3 text-muted font-medium">
                  <li className="flex justify-between items-center bg-surface-raised/50 p-3 rounded-xl"><span className="text-foreground font-bold">HP</span> <span>+100%</span></li>
                  <li className="flex justify-between items-center bg-surface-raised/50 p-3 rounded-xl"><span className="text-foreground font-bold">ATK/DEF/SPA/SPD</span> <span>+25%</span></li>
                  <li className="flex justify-between items-center bg-surface-raised/50 p-3 rounded-xl"><span className="text-foreground font-bold">SPE</span> <span>+10%</span></li>
                </ul>
              </div>

              <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm">
                <h3 className="text-xl font-bold text-muted mb-4 uppercase tracking-widest text-center">Nightmare</h3>
                <ul className="space-y-3 text-muted font-medium">
                  <li className="flex justify-between items-center bg-surface-raised/50 p-3 rounded-xl"><span className="text-foreground font-bold">HP</span> <span>+175%</span></li>
                  <li className="flex justify-between items-center bg-surface-raised/50 p-3 rounded-xl"><span className="text-foreground font-bold">ATK/DEF/SPA/SPD</span> <span>+50%</span></li>
                  <li className="flex justify-between items-center bg-surface-raised/50 p-3 rounded-xl"><span className="text-foreground font-bold">SPE</span> <span>+20%</span></li>
                </ul>
              </div>

              <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm">
                <h3 className="text-xl font-bold text-muted mb-4 uppercase tracking-widest text-center">Abyss</h3>
                <ul className="space-y-3 text-muted font-medium">
                  <li className="flex justify-between items-center bg-surface-raised/50 p-3 rounded-xl"><span className="text-foreground font-bold">HP</span> <span>+250%</span></li>
                  <li className="flex justify-between items-center bg-surface-raised/50 p-3 rounded-xl"><span className="text-foreground font-bold">ATK/DEF/SPA/SPD</span> <span>+75%</span></li>
                  <li className="flex justify-between items-center bg-surface-raised/50 p-3 rounded-xl"><span className="text-foreground font-bold">SPE</span> <span>+30%</span></li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-16 mb-10">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Void Rifts Rewards</h1>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-surface rounded-3xl border border-border shadow-sm overflow-hidden mb-10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-raised/50 border-b border-border">
                      <th className="py-3 px-2 sm:py-5 sm:px-6 font-bold text-muted uppercase tracking-wider text-xs sm:text-sm whitespace-nowrap">Rank</th>
                      <th className="py-3 px-2 sm:py-5 sm:px-6 font-bold text-muted uppercase tracking-wider text-xs sm:text-sm text-center whitespace-nowrap">Floor</th>
                      <th className="py-3 px-2 sm:py-5 sm:px-6 font-bold text-muted uppercase tracking-wider text-xs sm:text-sm text-center whitespace-nowrap">Level</th>
                      <th className="py-3 px-2 sm:py-5 sm:px-6 font-bold text-muted uppercase tracking-wider text-xs sm:text-sm text-right whitespace-nowrap">Normal</th>
                      <th className="py-3 px-2 sm:py-5 sm:px-6 font-bold text-muted uppercase tracking-wider text-xs sm:text-sm text-right whitespace-nowrap">Hard</th>
                      <th className="py-3 px-2 sm:py-5 sm:px-6 font-bold text-muted uppercase tracking-wider text-xs sm:text-sm text-right whitespace-nowrap">Nightmare</th>
                      <th className="py-3 px-2 sm:py-5 sm:px-6 font-bold text-muted uppercase tracking-wider text-xs sm:text-sm text-right whitespace-nowrap">Abyss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {RIFT_TABLE_DATA.map((row) => (
                      <tr
                        key={`${row.rank}-${row.floor}`}
                        className="hover:bg-surface-raised transition-colors group"
                      >
                        {row.isFirstFloor && (
                          <td rowSpan={row.rowSpan} className="py-3 px-2 sm:py-4 sm:px-6 border-b border-border align-top bg-surface-raised/30 /50 whitespace-nowrap">
                            <span className="font-black text-sm sm:text-lg text-foreground">
                              {row.rank}
                            </span>
                          </td>
                        )}
                        <td className="py-3 px-2 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-surface-raised text-muted font-bold text-xs sm:text-sm">
                            {row.floor}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-surface-raised text-foreground font-bold text-xs sm:text-sm">
                            Lv {row.level}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-6 text-right whitespace-nowrap">
                          <span className="font-mono font-bold text-xs sm:text-base text-muted">
                            {row.normal.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-6 text-right whitespace-nowrap">
                          <span className="font-mono font-bold text-xs sm:text-base text-muted">
                            {row.hard.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-6 text-right whitespace-nowrap">
                          <span className="font-mono font-bold text-xs sm:text-base text-muted">
                            {row.nightmare.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-6 text-right whitespace-nowrap">
                          <span className="font-mono font-bold text-xs sm:text-base text-muted">
                            {row.abyss.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-6 mb-10">
              {RIFT_RANKS.map(rankKey => {
                const rankName = formatRankName(rankKey);
                const rankData = RIFT_TABLE_DATA.filter(r => r.rank === rankName);

                return (
                  <div key={rankKey} className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="bg-surface-raised/50 px-5 py-4 border-b border-border flex items-center justify-between">
                      <span className="font-black text-xl text-foreground">{rankName}</span>
                    </div>
                    <div className="divide-y divide-border p-5 space-y-5">
                      {rankData.map(row => (
                        <div key={row.floor} className="pt-5 first:pt-0 border-border/60">
                          <div className="flex items-center justify-between mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-raised text-muted font-bold text-sm">Floor {row.floor}</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-raised text-foreground font-bold text-sm">Lv {row.level}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex flex-col p-3 rounded-xl bg-surface-raised/50 text-center">
                              <span className="text-subtle font-bold text-xs uppercase mb-1">Normal</span>
                              <span className="font-mono font-bold text-muted text-base">{row.normal.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col p-3 rounded-xl bg-surface-raised/50 text-center">
                              <span className="text-subtle font-bold text-xs uppercase mb-1">Hard</span>
                              <span className="font-mono font-bold text-muted text-base">{row.hard.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col p-3 rounded-xl bg-surface-raised/50 text-center">
                              <span className="text-subtle font-bold text-xs uppercase mb-1">Nightmare</span>
                              <span className="font-mono font-bold text-muted text-base">{row.nightmare.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col p-3 rounded-xl bg-surface-raised/50 text-center">
                              <span className="text-subtle font-bold text-xs uppercase mb-1">Abyss</span>
                              <span className="font-mono font-bold text-muted text-base">{row.abyss.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'furnace' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Astral Furnace</h1>
              </div>
            </div>

            <div className="bg-surface rounded-3xl border border-border shadow-sm p-5 sm:p-8 mb-6 sm:mb-10 text-muted text-base sm:text-lg leading-relaxed">
              <p className="mb-4">
                The <span className="font-bold text-foreground">Astral Furnace</span> is a mystical device used to smelt (release) Pokémon you no longer need. In return for smelting them, you will receive valuable resources:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>You will receive <span className="font-bold text-foreground">60%</span> of the Pokémon's stored Experience Points (XP).</li>
                <li>You have a <span className="font-bold text-foreground">50% chance</span> to obtain a <span className="font-bold">Potential Pearl</span> of the <span className="italic">same Rank</span> as the smelted Pokémon.</li>
                <li>You have a <span className="font-bold text-foreground">100% chance</span> to obtain a <span className="font-bold">Potential Pearl</span> of the <span className="italic">Rank below</span> the smelted Pokémon.</li>
              </ul>
              <p className="text-sm text-muted">
                * Note: Base/F-Rank Pokémon do not have a lower rank to drop a guaranteed pearl from.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'tower' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Infinity Tower</h1>
              </div>
            </div>

            <div className="bg-surface rounded-3xl border border-border shadow-sm p-5 sm:p-8 mb-6 sm:mb-10 text-muted text-base sm:text-lg leading-relaxed">
              <p className="mb-4">
                The <span className="font-bold text-foreground">Infinity Tower</span> features <span className="font-bold text-foreground">1000 floors</span> designed to test your party's mastery, scaling from Level 1 up to <span className="font-bold text-foreground">Level 1000</span> at the pinnacle.
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-4">
                <li><span className="font-bold text-foreground">Floor & Level Progression:</span> Enemy levels progress smoothly alongside floor progression, reaching maximum Level 1000 at Floor 1000. Team sizes expand gradually up to a full party of 6.</li>
                <li>
                  <span className="font-bold text-foreground">Boss Milestones:</span> You will encounter significantly harder battles at regular intervals with massive reward multipliers:
                  <ul className="list-[circle] pl-6 mt-2 space-y-1">
                    <li><span className="font-bold">Mini-Boss</span> (Every 25 floors): 2x Rewards</li>
                    <li><span className="font-bold text-foreground">Boss</span> (Every 50 floors): 5x Rewards, max IVs, guaranteed high-tier pools.</li>
                    <li><span className="font-bold text-foreground">Mega Boss</span> (Every 100 floors): 10x Rewards, max IVs, guaranteed Legendary/Mythical pools.</li>
                  </ul>
                </li>
                <li><span className="font-bold text-foreground">Floor Sweeping (Skip):</span> If your Party's CP is overwhelmingly higher than the Floor's estimated CP (by 10x or more), you can instantly Sweep up to 100 floors at a time up through floor 1000, claiming all XP and Infinity Coins without fighting!</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'pokemart' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Pokémart Catalog</h1>
                <p className="text-muted mt-2">Information and descriptions of all items available in the Pokémart.</p>
              </div>
            </div>

            <PokemartInfoTab />
          </div>
        )}
      </div>
    </div>
  );
}

function PokemartInfoTab() {
  const [storeType, setStoreType] = useState<'astral' | 'infinity'>('astral');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: items, isLoading } = useQuery({
    queryKey: ['shopItemsInfo'],
    queryFn: shopApi.getItems
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-border"></div>
      </div>
    );
  }

  if (!items) return null;

  const storeItems = items.filter((item: any) => {
    if (storeType === 'infinity') return item.category === 'infinity-only';
    return item.category !== 'infinity-only';
  });

  const categories = ['all', ...Array.from(new Set(storeItems.map((i: any) => i.category))).sort() as string[]];
  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : 'all';
  const filteredItems = activeCategory === 'all' ? storeItems : storeItems.filter((i: any) => i.category === activeCategory);

  return (
    <div>
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 mb-8 bg-surface/50 p-2 border border-border rounded-2xl w-full overflow-hidden">

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto p-1 pb-2 w-full sm:w-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 sm:px-5 rounded-lg text-sm font-bold capitalize transition-colors whitespace-nowrap shrink-0 ${activeCategory === cat ? 'bg-surface-raised text-foreground shadow-sm' : 'bg-transparent text-muted hover:bg-surface-raised ' }`}
            >
              <span className={`capitalize text-sm font-bold whitespace-nowrap ${activeCategory === cat ? 'text-foreground' : ''}`}>
                {cat === 'infinity-only' || cat === 'potential' ? 'Potential' : cat === 'iv' ? 'IV' : cat === 'all' ? 'All Items' : cat.replace('-', ' ')}
              </span>
            </button>
          ))}
        </div>

        {/* Store Type Selector */}
        <div className="flex bg-surface-raised p-1 rounded-xl w-full sm:w-max shrink-0 mx-1 sm:mx-0">
          <button
            onClick={() => setStoreType('astral')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-colors ${storeType === 'astral' ? 'bg-surface-raised text-foreground shadow-sm' : 'text-subtle hover:text-subtle ' }`}
          >
            Astral Store
          </button>
          <button
            onClick={() => setStoreType('infinity')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-colors ${storeType === 'infinity' ? 'bg-surface-raised text-foreground shadow-sm' : 'text-subtle hover:text-subtle ' }`}
          >
            Infinity Store
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
        {filteredItems.map((item: any) => (
          <div key={item.id} className="bg-surface border border-border p-5 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-surface-raised rounded-xl flex items-center justify-center shrink-0 border border-border/60">
              {item.spriteUrl ? (
                <img src={item.spriteUrl} alt={item.name} className="w-8 h-8 object-contain drop-shadow-sm" />
              ) : (
                <div className="w-6 h-6 bg-surface-raised rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground capitalize text-lg leading-none mb-2">{item.name.replace('-', ' ')}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-12 text-center text-subtle font-medium">
            No items found in this section.
          </div>
        )}
      </div>
    </div>
  );
}
