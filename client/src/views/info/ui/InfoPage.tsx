import React, { useState } from 'react';
import { FiInfo } from 'react-icons/fi';
const RIFT_REWARD_MULTIPLIERS: Record<string, number> = {
  NORMAL: 1.0,
  HARD: 1.5,
  NIGHTMARE: 2.5,
  ABYSS: 4.0
};

const RIFT_MAX_FLOORS: Record<string, number> = {
  F_RANK: 2, E_RANK: 2, D_RANK: 3, C_RANK: 3, B_RANK: 4, A_RANK: 4,
  S_MINUS_RANK: 5, S_RANK: 5, S_PLUS_RANK: 5, SS_MINUS_RANK: 5, SS_RANK: 5, SS_PLUS_RANK: 5,
  SSS_MINUS_RANK: 5, SSS_RANK: 5, SSS_PLUS_RANK: 5
};

const RIFT_BASE_INFINITY_COINS: Record<string, number> = {
  F_RANK: 10, E_RANK: 25, D_RANK: 50, C_RANK: 100, B_RANK: 200, A_RANK: 400,
  S_MINUS_RANK: 800, S_RANK: 1500, S_PLUS_RANK: 3000, SS_MINUS_RANK: 5000,
  SS_RANK: 8000, SS_PLUS_RANK: 12000, SSS_MINUS_RANK: 20000, SSS_RANK: 35000, SSS_PLUS_RANK: 50000
};

const RIFT_LEVEL_RANGES: Record<string, { min: number; max: number }> = {
  F_RANK: { min: 10, max: 25 }, E_RANK: { min: 30, max: 50 }, D_RANK: { min: 60, max: 90 },
  C_RANK: { min: 100, max: 150 }, B_RANK: { min: 160, max: 250 }, A_RANK: { min: 260, max: 400 },
  S_MINUS_RANK: { min: 410, max: 600 }, S_RANK: { min: 610, max: 800 }, S_PLUS_RANK: { min: 810, max: 1000 },
  SS_MINUS_RANK: { min: 1010, max: 1300 }, SS_RANK: { min: 1310, max: 1600 }, SS_PLUS_RANK: { min: 1610, max: 1900 },
  SSS_MINUS_RANK: { min: 1910, max: 2500 }, SSS_RANK: { min: 2510, max: 3500 }, SSS_PLUS_RANK: { min: 3510, max: 4500 }
};

const RIFT_RANKS = [
  'F_RANK', 'E_RANK', 'D_RANK', 'C_RANK', 'B_RANK', 'A_RANK',
  'S_MINUS_RANK', 'S_RANK', 'S_PLUS_RANK', 'SS_MINUS_RANK', 'SS_RANK', 'SS_PLUS_RANK',
  'SSS_MINUS_RANK', 'SSS_RANK', 'SSS_PLUS_RANK'
];

const formatRankName = (rank: string) => {
  return rank.replace('_RANK', '').replace('_MINUS', '-').replace('_PLUS', '+').replace('_', ' ');
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
  { rank: 'F', tiers: 'Black Iron, Bronze', maxLevel: 60 },
  { rank: 'E', tiers: 'Silver, Gold', maxLevel: 120 },
  { rank: 'D', tiers: 'Platinum, Adamantite', maxLevel: 200 },
  { rank: 'C', tiers: 'Diamond', maxLevel: 300 },
  { rank: 'B', tiers: 'Crystal', maxLevel: 400 },
  { rank: 'A', tiers: 'Epic', maxLevel: 500 },
  { rank: 'S-', tiers: 'Heroic', maxLevel: 700 },
  { rank: 'S', tiers: 'Sovereign', maxLevel: 900 },
  { rank: 'S+', tiers: 'Legendary', maxLevel: 1100 },
  { rank: 'SS-', tiers: 'Divine', maxLevel: 1400 },
  { rank: 'SS', tiers: 'Celestial', maxLevel: 1700 },
  { rank: 'SS+', tiers: 'Primordial', maxLevel: 2000 },
  { rank: 'SSS-', tiers: 'Mythical', maxLevel: 3000 },
  { rank: 'SSS', tiers: 'Infinity', maxLevel: 4000 },
  { rank: 'SSS+', tiers: 'Eternal', maxLevel: 5000 },
];

export function InfoPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'rift' | 'furnace' | 'tower'>('general');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 p-8 sm:p-12">
      <div className="w-full mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Game Information</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 mb-10 border-b border-slate-200 dark:border-slate-800 pb-4">
          {(['general', 'rift', 'furnace', 'tower'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 font-bold rounded-xl transition-all capitalize shadow-sm border ${
                activeTab === tab
                  ? 'bg-purple-600 text-white border-purple-500 shadow-purple-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'rift' ? 'Void Rifts' : tab === 'furnace' ? 'Astral Furnace' : tab === 'tower' ? 'Infinity Tower' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'general' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-5 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm">Trainer Rank</th>
                      <th className="py-5 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm">Realm Tier(s)</th>
                      <th className="py-5 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm text-right">Maximum Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {TABLE_DATA.map((row) => (
                      <tr
                        key={row.rank}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <span className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {row.rank}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">
                          {row.tiers}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold font-mono text-sm border border-emerald-200 dark:border-emerald-800/30">
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

        {activeTab === 'rift' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Corrupted Stats Multipliers</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-widest text-center">Normal</h3>
                <ul className="space-y-3 text-slate-600 dark:text-slate-400 font-medium">
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"><span className="text-emerald-500 font-bold">HP</span> <span>+50%</span></li>
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"><span className="text-orange-500 font-bold">ATK/DEF/SPA/SPD</span> <span>+10%</span></li>
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"><span className="text-blue-500 font-bold">SPE</span> <span>+5%</span></li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-widest text-center">Hard</h3>
                <ul className="space-y-3 text-slate-600 dark:text-slate-400 font-medium">
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"><span className="text-emerald-500 font-bold">HP</span> <span>+100%</span></li>
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"><span className="text-orange-500 font-bold">ATK/DEF/SPA/SPD</span> <span>+25%</span></li>
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"><span className="text-blue-500 font-bold">SPE</span> <span>+10%</span></li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-widest text-center">Nightmare</h3>
                <ul className="space-y-3 text-slate-600 dark:text-slate-400 font-medium">
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"><span className="text-emerald-500 font-bold">HP</span> <span>+175%</span></li>
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"><span className="text-orange-500 font-bold">ATK/DEF/SPA/SPD</span> <span>+50%</span></li>
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"><span className="text-blue-500 font-bold">SPE</span> <span>+20%</span></li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-widest text-center">Abyss</h3>
                <ul className="space-y-3 text-slate-600 dark:text-slate-400 font-medium">
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"><span className="text-emerald-500 font-bold">HP</span> <span>+250%</span></li>
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"><span className="text-orange-500 font-bold">ATK/DEF/SPA/SPD</span> <span>+75%</span></li>
                  <li className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"><span className="text-blue-500 font-bold">SPE</span> <span>+30%</span></li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-16 mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Void Rifts Rewards</h1>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-5 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm">Rank</th>
                      <th className="py-5 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm text-center">Floor</th>
                      <th className="py-5 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm text-center">Level</th>
                      <th className="py-5 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm text-right">Normal</th>
                      <th className="py-5 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm text-right">Hard</th>
                      <th className="py-5 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm text-right">Nightmare</th>
                      <th className="py-5 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm text-right">Abyss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {RIFT_TABLE_DATA.map((row) => (
                      <tr
                        key={`${row.rank}-${row.floor}`}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                      >
                        {row.isFirstFloor && (
                          <td rowSpan={row.rowSpan} className="py-4 px-6 border-b border-slate-200 dark:border-slate-800 align-top bg-slate-50/30 dark:bg-slate-900/50">
                            <span className="font-black text-lg text-slate-900 dark:text-slate-100">
                              {row.rank}
                            </span>
                          </td>
                        )}
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm">
                            {row.floor}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                            Lv {row.level}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {row.normal.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {row.hard.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {row.nightmare.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {row.abyss.toLocaleString()}
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

        {activeTab === 'furnace' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Astral Furnace</h1>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 mb-10 text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
              <p className="mb-4">
                The <span className="font-bold text-purple-600 dark:text-purple-400">Astral Furnace</span> is a mystical device used to smelt (release) Pokémon you no longer need. In return for smelting them, you will receive valuable resources:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>You will receive <span className="font-bold text-emerald-600 dark:text-emerald-400">60%</span> of the Pokémon's stored Experience Points (XP).</li>
                <li>You have a <span className="font-bold text-orange-500">50% chance</span> to obtain a <span className="font-bold">Potential Pearl</span> of the <span className="italic">same Rank</span> as the smelted Pokémon.</li>
                <li>You have a <span className="font-bold text-blue-500">100% chance</span> to obtain a <span className="font-bold">Potential Pearl</span> of the <span className="italic">Rank below</span> the smelted Pokémon.</li>
              </ul>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                * Note: Base/F-Rank Pokémon do not have a lower rank to drop a guaranteed pearl from.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'tower' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Infinity Tower</h1>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 mb-10 text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
              <p className="mb-4">
                The <span className="font-bold text-amber-500">Infinity Tower</span> is an endless gauntlet where the difficulty—and the rewards—scale infinitely the higher you climb.
              </p>
              <ul className="list-disc pl-6 space-y-3 mb-4">
                <li><span className="font-bold text-indigo-500">Endless Scaling:</span> As you ascend, enemy levels and IVs continue to rise. Team sizes will also gradually grow up to a full party of 6.</li>
                <li>
                  <span className="font-bold text-red-500">Boss Milestones:</span> You will encounter significantly harder battles at regular intervals with massive reward multipliers:
                  <ul className="list-[circle] pl-6 mt-2 space-y-1">
                    <li><span className="font-bold">Mini-Boss</span> (Every 25 floors): 2x Rewards</li>
                    <li><span className="font-bold text-orange-500">Boss</span> (Every 50 floors): 5x Rewards, max IVs, guaranteed Legendary/Mythical pools.</li>
                    <li><span className="font-bold text-red-600">Mega Boss</span> (Every 100 floors): 10x Rewards, max IVs, guaranteed Legendary/Mythical pools.</li>
                  </ul>
                </li>
                <li><span className="font-bold text-emerald-500">Floor Sweeping (Skip):</span> If your Party's CP is overwhelmingly higher than the Floor's estimated CP (by 10x or more), you can instantly Sweep up to 100 floors at a time, claiming all XP and Infinity Coins without fighting!</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
