'use client';
import { useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { realmsApi, battleApi } from '../../../shared/api/api';
import { getSpriteUrl, getTypeSpriteUrl } from '../../../shared/api/axios';
import { toast } from 'sonner';

export function RealmDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [encounterData, setEncounterData] = useState<any>(null);

  const { data: realm, isLoading, error } = useQuery({
    queryKey: ['realm', id],
    queryFn: () => realmsApi.getRealmById(id!),
    enabled: !!id
  });

  const exploreMutation = useMutation({
    mutationFn: () => realmsApi.exploreRealm(id!),
    onSuccess: (data) => {
      if (data.event === 'battle') {
        queryClient.removeQueries({ queryKey: ['activeBattle'] });
        setEncounterData(data.encounter);
      } else if (data.event === 'item') {
        toast.success(`Found ${data.item.quantity}x ${data.item.name}!`);
      } else if (data.event === 'money') {
        toast.success(`Found ₽${data.amount}!`);
      } else {
        toast.info('You explored the realm but found nothing.');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to explore realm');
    }
  });

  const runMutation = useMutation({
    mutationFn: () => battleApi.runFromBattle(),
    onSuccess: () => {
      toast.info('Got away safely!');
      setEncounterData(null);
    },
    onError: (_err: any) => {
      toast.error('Could not flee!');
      setEncounterData(null); // Close it anyway for safety
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col pt-16">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !realm) {
    return (
      <div className="flex-1 flex flex-col pt-16">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500">
          <p className="text-xl mb-4">Realm not found.</p>
          <button
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all"
            onClick={() => router.push('/realms')}
          >
            Back to Realms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 max-w-full w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col items-center">

        {/* Detail Card */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -mr-32 -mt-32 pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-center md:items-start w-full max-w-full mb-12 gap-8 px-4 sm:px-12 lg:px-24">
            {/* Left Side: Title & Inhabitants */}
            <div className="flex flex-col items-center md:items-start flex-1 gap-4">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tight text-center md:text-left">
                <span><span className="text-slate-400 dark:text-slate-500">Tier {realm.tier} :</span> {realm.name}</span>
              </p>
              <div className="flex flex-col items-center md:items-start">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tight text-center md:text-left mb-3">
                  <span><span className="text-slate-400 dark:text-slate-500 mr-2">Wild Inhabitants :</span> Levels {realm.minLevel} - {realm.maxLevel}</span>
                </p>
                <div className="flex flex-row gap-2 justify-center md:justify-start">
                  {realm.types.map((t: string) => (
                    <img key={t} src={getTypeSpriteUrl(t)} alt={t} title={t} className="h-6 object-contain drop-shadow-sm" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Boss */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="relative w-36 h-auto min-h-[9rem] py-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border-4 border-red-200 dark:border-red-900/50 flex flex-col items-center justify-center shadow-lg hover:-translate-y-2 transition-transform z-10 scale-110">
                <span className="absolute -top-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm z-10">Alpha Boss</span>
                <img src={getSpriteUrl(realm.bossSpeciesId)} alt={realm.bossSpeciesName} className="w-24 h-24 object-contain pixelated drop-shadow-md mb-2" />
                <span className="text-sm font-bold text-red-900 dark:text-red-400 capitalize truncate w-full text-center px-1">{realm.bossSpeciesName}</span>
              </div>
            </div>
          </div>

          {/* Inhabitants Section */}
          <div className="w-full mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center uppercase tracking-wider">Known Inhabitants</h3>
            <div className="flex flex-wrap gap-4 justify-center w-full">
              {/* Wild Inhabitants List */}
              {realm.inhabitants?.map((sp: any) => (
                <div key={sp.id} className="relative w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-2 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 hover:-translate-y-1 transition-all shrink-0">
                  <img src={getSpriteUrl(sp.id)} alt={sp.name} className="w-12 h-12 object-contain pixelated drop-shadow mb-1" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 capitalize truncate w-full text-center">{sp.name.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          </div>


          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button
              className="flex-1 py-4 text-lg font-bold border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
              onClick={() => router.push('/realms')}
            >
              Leave
            </button>
            <button
              className="flex-1 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
              onClick={() => exploreMutation.mutate()}
              disabled={exploreMutation.isPending}
            >
              {exploreMutation.isPending ? 'Exploring...' : 'Explore Realm'}
            </button>
          </div>
        </div>

      </div>

      {encounterData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
            <h2 className="text-xl text-slate-800 dark:text-white flex items-center justify-center font-bold mb-6">
              Wild Encounter!
            </h2>
            <div className="w-32 h-32 mb-6">
              <img
                src={getSpriteUrl(encounterData.species.id)}
                alt={encounterData.species.name}
                className="w-full h-full object-contain pixelated drop-shadow-md"
              />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white capitalize mb-1">
              {encounterData.species.name}
            </h2>
            <div className="flex gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 mb-8">
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">Lv. {encounterData.level}</span>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                {encounterData.potential}
              </span>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => runMutation.mutate()}
                disabled={runMutation.isPending}
                className="flex-1 py-3 border-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                Run
              </button>
              <button
                onClick={() => router.push('/battle' + '?returnUrl=' + encodeURIComponent(location.pathname))}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
              >
                Fight!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
