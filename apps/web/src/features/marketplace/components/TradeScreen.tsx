import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { OwnedPokemonDto } from '@astranox/types';;

export function TradeScreen() {
  const params = useParams();
  const friendId = params?.friendId as string;
  const navigate = useNavigate();
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
      navigate('/home');
    }
  });

  return (
    <div className="min-h-[100dvh] bg-background p-3 sm:p-4 md:p-8 pb-safe transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 sm:gap-8 h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <button onClick={() => navigate('/home')} className="text-subtle hover:text-foreground mb-2 flex items-center font-bold uppercase tracking-wider text-sm transition-colors min-h-[44px]">
              ◀ Back to Home
            </button>
            <h1 className="text-2xl sm:text-4xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
              Trade Proposal 🔄
            </h1>
          </div>
        </div>

        {/* Trade Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* My Pokemon */}
          <div className="bg-surface p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6 uppercase border-b border-border pb-2">
              Your Offer
            </h3>
            
            {isMyLoading ? (
              <p className="text-subtle">Loading...</p>
            ) : myTradeable?.length === 0 ? (
              <p className="text-subtle italic text-sm">You have no Pokémon marked "For Trade". Go to your PC Box to select some.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {myTradeable?.map((pkm: OwnedPokemonDto) => (
                  <div 
                    key={pkm.id} 
                    onClick={() => setMySelected(pkm.id)}
                    className={`cursor-pointer border-2 rounded-xl p-2.5 flex flex-col items-center transition-all ${mySelected === pkm.id ? 'border-border bg-surface-raised shadow-md scale-105' : 'border-border hover:border-border '}`}
                  >
                    <img src={pkm.species.spriteUrl || undefined} alt={pkm.species.name} className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow" style={{ imageRendering: 'pixelated' }} />
                    <span className="font-bold text-xs sm:text-sm text-center capitalize mt-2 truncate w-full">{pkm.nickname || pkm.species.name}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-subtle">Lv {pkm.level}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Friend's Pokemon */}
          <div className="bg-surface p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6 uppercase border-b border-border pb-2">
              You Want
            </h3>
            
            {isFriendLoading ? (
              <p className="text-subtle">Loading...</p>
            ) : friendTradeable?.length === 0 ? (
              <p className="text-subtle italic text-sm">This player has no Pokémon marked "For Trade".</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {friendTradeable?.map((pkm: OwnedPokemonDto) => (
                  <div 
                    key={pkm.id} 
                    onClick={() => setFriendSelected(pkm.id)}
                    className={`cursor-pointer border-2 rounded-xl p-2.5 flex flex-col items-center transition-all ${friendSelected === pkm.id ? 'border-border bg-surface-raised shadow-md scale-105' : 'border-border hover:border-border '}`}
                  >
                    <img src={pkm.species.spriteUrl || undefined} alt={pkm.species.name} className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow" style={{ imageRendering: 'pixelated' }} />
                    <span className="font-bold text-xs sm:text-sm text-center capitalize mt-2 truncate w-full">{pkm.nickname || pkm.species.name}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-subtle">Lv {pkm.level}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-surface-raised border border-border rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-subtle uppercase tracking-widest mb-1 sm:mb-2">Offer</span>
              {mySelected ? (
                <img src={myTradeable.find((p: OwnedPokemonDto) => p.id === mySelected)?.species.spriteUrl} className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow" style={{ imageRendering: 'pixelated' }} />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted">?</div>
              )}
            </div>
            
            <span className="text-2xl sm:text-3xl text-foreground">➡️</span>
            
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-subtle uppercase tracking-widest mb-1 sm:mb-2">Receive</span>
              {friendSelected ? (
                <img src={friendTradeable.find((p: OwnedPokemonDto) => p.id === friendSelected)?.species.spriteUrl} className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow" style={{ imageRendering: 'pixelated' }} />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted">?</div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => requestTrade.mutate()}
            disabled={!mySelected || !friendSelected || requestTrade.isPending}
            className="w-full md:w-auto px-8 sm:px-12 py-3.5 sm:py-4 min-h-[44px] bg-surface-raised hover:bg-surface-raised text-foreground font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-glow flex items-center justify-center text-sm sm:text-base"
          >
            {requestTrade.isPending ? 'Sending...' : 'Send Trade Offer'}
          </button>
        </div>

      </div>
    </div>
  );
}
