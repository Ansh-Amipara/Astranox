'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/api';

export function TradeScreen() {
  const params = useParams();
  const friendId = params?.friendId as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [mySelected, setMySelected] = useState<string | null>(null);
  const [friendSelected, setFriendSelected] = useState<string | null>(null);

  const { data: myUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data;
    }
  });

  const { data: myTradeable, isLoading: isMyLoading } = useQuery({
    queryKey: ['myTradeable', myUser?.id],
    queryFn: async () => {
      const { data } = await api.get(`/trades/users/${myUser?.id}/tradeable`);
      return data.data;
    },
    enabled: !!myUser?.id
  });

  const { data: friendTradeable, isLoading: isFriendLoading } = useQuery({
    queryKey: ['friendTradeable', friendId],
    queryFn: async () => {
      const { data } = await api.get(`/trades/users/${friendId}/tradeable`);
      return data.data;
    },
    enabled: !!friendId
  });

  const requestTrade = useMutation({
    mutationFn: async () => {
      await api.post('/trades/request', {
        targetUserId: friendId,
        offeredPokemonId: mySelected,
        requestedPokemonId: friendSelected
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outgoingTrades'] });
      router.push('/home');
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <button onClick={() => router.push('/home')} className="text-slate-500 hover:text-blue-500 mb-2 flex items-center font-bold uppercase tracking-wider text-sm transition-colors">
              ◀ Back to Home
            </button>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
              Trade Proposal 🔄
            </h1>
          </div>
        </div>

        {/* Trade Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* My Pokemon */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase border-b border-slate-200 dark:border-slate-800 pb-2">
              Your Offer
            </h3>
            
            {isMyLoading ? (
              <p className="text-slate-500">Loading...</p>
            ) : myTradeable?.length === 0 ? (
              <p className="text-slate-500 italic">You have no Pokémon marked "For Trade". Go to your PC Box to select some.</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {myTradeable?.map((pkm: any) => (
                  <div 
                    key={pkm.id} 
                    onClick={() => setMySelected(pkm.id)}
                    className={`cursor-pointer border-2 rounded-xl p-2 flex flex-col items-center transition-all ${mySelected === pkm.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md scale-105' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600'}`}
                  >
                    <img src={pkm.species.spriteUrl} alt={pkm.species.name} className="w-16 h-16 object-contain drop-shadow" style={{ imageRendering: 'pixelated' }} />
                    <span className="font-bold text-sm text-center capitalize mt-2">{pkm.nickname || pkm.species.name}</span>
                    <span className="text-xs font-bold text-slate-500">Lv {pkm.level}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Friend's Pokemon */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase border-b border-slate-200 dark:border-slate-800 pb-2">
              You Want
            </h3>
            
            {isFriendLoading ? (
              <p className="text-slate-500">Loading...</p>
            ) : friendTradeable?.length === 0 ? (
              <p className="text-slate-500 italic">This player has no Pokémon marked "For Trade".</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {friendTradeable?.map((pkm: any) => (
                  <div 
                    key={pkm.id} 
                    onClick={() => setFriendSelected(pkm.id)}
                    className={`cursor-pointer border-2 rounded-xl p-2 flex flex-col items-center transition-all ${friendSelected === pkm.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md scale-105' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600'}`}
                  >
                    <img src={pkm.species.spriteUrl} alt={pkm.species.name} className="w-16 h-16 object-contain drop-shadow" style={{ imageRendering: 'pixelated' }} />
                    <span className="font-bold text-sm text-center capitalize mt-2">{pkm.nickname || pkm.species.name}</span>
                    <span className="text-xs font-bold text-slate-500">Lv {pkm.level}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-purple-900/10 border border-purple-200 dark:border-purple-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Offer</span>
              {mySelected ? (
                <img src={myTradeable.find((p: any) => p.id === mySelected)?.species.spriteUrl} className="w-16 h-16 drop-shadow" style={{ imageRendering: 'pixelated' }} />
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">?</div>
              )}
            </div>
            
            <span className="text-3xl text-purple-500">➡️</span>
            
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Receive</span>
              {friendSelected ? (
                <img src={friendTradeable.find((p: any) => p.id === friendSelected)?.species.spriteUrl} className="w-16 h-16 drop-shadow" style={{ imageRendering: 'pixelated' }} />
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">?</div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => requestTrade.mutate()}
            disabled={!mySelected || !friendSelected || requestTrade.isPending}
            className="w-full md:w-auto px-12 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
          >
            {requestTrade.isPending ? 'Sending...' : 'Send Trade Offer'}
          </button>
        </div>

      </div>
    </div>
  );
}
