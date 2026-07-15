import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { api } from '../../../shared/api/api';
import { useState, useEffect, useMemo } from 'react';

const REGIONS = [
  'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea',
  'Aurelia', 'Vespera', 'Solara', 'Noctara', 'Verdantis', 'Crythos', 'Lumina', 'Dravora', 'Elyndor', 'Zephyria', 'Eclipse Dawn Base'
];

export function Gyms() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);

  const typeParam = searchParams.get('type') || 'guardian';

  const { data: npcs, isLoading } = useQuery({
    queryKey: ['npcs'],
    queryFn: async () => {
      const { data } = await api.get('/npcs');
      return data.data;
    },
  });

  const challengeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/npcs/${id}/challenge`);
      return data.data;
    },
    onSuccess: () => {
      // Invalidate active session and navigate to battle
      queryClient.invalidateQueries({ queryKey: ['activeBattle'] });
      const returnUrl = location.pathname + location.search;
      navigate('/battle', { state: { returnUrl } });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error?.message || 'Failed to start battle');
    }
  });

  const showRegionFilter = ['guardian', 'elder', 'hunter'].includes(typeParam);

  const availableRegions = useMemo(() => {
    if (!npcs) return REGIONS;
    const trainersInType = npcs.filter((n: any) => {
      if (typeParam === 'guardian') return n.trainerType === 'GUARDIAN';
      if (typeParam === 'elder') return n.trainerType === 'ELDER';
      if (typeParam === 'hunter') return n.trainerType === 'HUNTER';
      return false;
    });
    const regionsWithTrainers = new Set(trainersInType.map((n: any) => n.region));
    return REGIONS.filter(r => regionsWithTrainers.has(r));
  }, [npcs, typeParam]);

  useEffect(() => {
    if (showRegionFilter && availableRegions.length > 0 && !availableRegions.includes(selectedRegion)) {
      setSelectedRegion(availableRegions[0]);
    }
  }, [showRegionFilter, availableRegions, selectedRegion]);

  if (isLoading) {
    return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-slate-500">Loading...</div>;
  }

  const filteredNpcs = npcs?.filter((npc: any) => npc.region === selectedRegion) || [];

  let pageTitle = "League Challenges";
  const displayedSections: { title: string; data: any[] }[] = [];

  if (typeParam === 'guardian') {
    pageTitle = "Eclipse Guardians";
    const guardians = filteredNpcs.filter((n: any) => n.trainerType === 'GUARDIAN');
    if (guardians.length > 0) displayedSections.push({ title: "Guardians", data: guardians });
  } else if (typeParam === 'elder') {
    pageTitle = "Eclipse Elders";
    const elders = filteredNpcs.filter((n: any) => n.trainerType === 'ELDER');
    if (elders.length > 0) displayedSections.push({ title: "Elders", data: elders });
  } else if (typeParam === 'hunter') {
    pageTitle = "Eclipse Hunters";
    const hunters = filteredNpcs.filter((n: any) => n.trainerType === 'HUNTER');
    if (hunters.length > 0) displayedSections.push({ title: "Hunters", data: hunters });
  } else if (typeParam === 'eclipse-leaders') {
    pageTitle = "Eclipse Dawn Leaders";
    const leaders = (npcs || []).filter((n: any) => n.region === 'Eclipse Dawn Base');
    if (leaders.length > 0) displayedSections.push({ title: "Supreme Leaders", data: leaders });
  } else {
    pageTitle = "Eclipse Dawn";
  }

  const renderTrainerCard = (npc: any) => (
    <div key={npc.id} className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm flex flex-col ${npc.isDefeated ? 'border-green-500 dark:border-green-500/50' : 'border-slate-200 dark:border-slate-800'}`}>
      <div className="p-6 flex flex-col items-center flex-1">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center">{npc.name}</h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 text-center">{npc.trainerClass}</p>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 uppercase">{npc.region}</p>
        {npc.badgeName && (
          <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 rounded-full text-xs font-bold mb-4">
            {npc.badgeName}
          </div>
        )}
        <p className="text-sm text-slate-600 dark:text-slate-400">Prize: ₽ {npc.rewardMoney}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Team Size: {npc.party.length}</p>

        {npc.isDefeated && (
          <div className="mt-auto w-full py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-center font-bold rounded-lg text-sm">
            DEFEATED
          </div>
        )}
      </div>

      <button
        onClick={() => challengeMutation.mutate(npc.id)}
        disabled={challengeMutation.isPending}
        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50"
      >
        {challengeMutation.isPending ? 'Starting...' : 'CHALLENGE'}
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{pageTitle}</h1>
        {showRegionFilter && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto w-full md:w-auto">
            {availableRegions.map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap transition-colors ${selectedRegion === region ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {region}
              </button>
            ))}
          </div>
        )}
      </div>

      {displayedSections.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          {showRegionFilter ? `No trainers found for this category in the ${selectedRegion} region.` : 'No trainers found for this category.'}
        </div>
      ) : (
        displayedSections.map(section => (
          <div key={section.title} className="mb-12">
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">{section.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {section.data.map(renderTrainerCard)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
