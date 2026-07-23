import React from 'react';
import { FiInfo } from 'react-icons/fi';

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
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 p-8 sm:p-12">
      <div className="w-full mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-2xl">
            <FiInfo className="text-3xl text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Game Information</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed progression breakdown for Ranks, Tiers, and Levels.</p>
          </div>
        </div>

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
    </div>
  );
}
