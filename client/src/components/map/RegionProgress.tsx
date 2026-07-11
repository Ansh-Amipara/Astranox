import React from 'react';

interface RegionProgressProps {
  regions: any[];
}

export const RegionProgress: React.FC<RegionProgressProps> = ({ regions }) => {
  // We'll calculate some mock RPG progress stats across all regions for the overlay.
  // In a real app, this would be fueled by user's actual save data.
  const totalMaps = regions.reduce((acc, r) => acc + r.areas.reduce((a, area) => a + area.gameMaps.length, 0), 0);
  const discoveredMaps = Math.max(1, Math.floor(totalMaps * 0.64)); // Fake 64% progress
  const progressPct = Math.round((discoveredMaps / totalMaps) * 100);

  const renderProgressBar = () => {
    const filled = Math.round(progressPct / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  return (
    <div className="bg-black/60 backdrop-blur-md border border-gray-700/50 p-6 rounded-xl shadow-2xl text-white font-mono text-sm">
      <div className="flex justify-between items-end mb-4 border-b border-gray-600/50 pb-2">
        <h2 className="text-xl font-bold text-blue-300">Aethelgard Progress</h2>
        <span className="text-gray-400">{progressPct}%</span>
      </div>

      <div className="text-blue-400 mb-4 tracking-widest text-lg">
        {renderProgressBar()}
      </div>

      <div className="grid grid-cols-2 gap-y-3 text-gray-300">
        <div>Maps Discovered</div>
        <div className="text-right font-bold text-white">{discoveredMaps} / {totalMaps}</div>

        <div>Pokémon Seen</div>
        <div className="text-right font-bold text-white">34</div>

        <div>Pokémon Caught</div>
        <div className="text-right font-bold text-white">16</div>

        <div>Trainers Defeated</div>
        <div className="text-right font-bold text-white">12</div>

        <div className="pt-2 mt-2 border-t border-gray-700">Gym Badges</div>
        <div className="pt-2 mt-2 border-t border-gray-700 text-right font-bold text-yellow-400">✔</div>
      </div>
    </div>
  );
};
