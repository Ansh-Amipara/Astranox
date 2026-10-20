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
            <button
              onClick={() => navigate('/home')}
              className="text-muted hover:text-foreground mb-2 flex items-center font-bold text-xs uppercase tracking-wider transition-colors min-h-[44px] touch-manipulation select-none"
            >
              ◀ Back to Home
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
              Trade Proposal
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">Select a Pokémon to offer and the Pokémon you wish to receive.</p>
          </div>
        </div>

        {/* Trade Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* My Pokemon */}
          <div className="bg-surface p-4 sm:p-6 rounded-2xl border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base sm:text-lg font-black text-foreground">
                Your Offer
              </h3>
              <span className="text-xs font-bold text-muted bg-surface-raised px-2.5 py-0.5 rounded-full border border-border">
                {myTradeable?.length || 0} available
              </span>
            </div>

            {isMyLoading ? (
              <p className="text-muted text-sm">Loading available Pokémon...</p>
            ) : myTradeable?.length === 0 ? (
              <p className="text-muted italic text-xs sm:text-sm bg-surface-raised p-4 rounded-xl border border-border">
                You have no Pokémon marked "For Trade". Go to your PC Box to select some.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {myTradeable?.map((pkm: OwnedPokemonDto) => {
                  const isSelected = mySelected === pkm.id;
                  return (
                    <div
                      key={pkm.id}
                      onClick={() => setMySelected(pkm.id)}
                      className={`group cursor-pointer rounded-2xl p-3 flex flex-col items-center transition-all duration-200 select-none touch-manipulation border ${
                        isSelected
                          ? 'border-primary bg-surface-raised shadow-xs scale-[1.02]'
                          : 'border-border hover:border-border hover:bg-surface-raised/60 hover:-translate-y-0.5 bg-surface'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-surface-raised flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform">
                        <img src={pkm.species.spriteUrl || undefined} alt={pkm.species.name} className="w-12 h-12 object-contain pixelated" />
                      </div>
                      <span className="font-black text-xs text-center capitalize mt-2 truncate w-full text-foreground">
                        {pkm.nickname || pkm.species.name}
                      </span>
                      <span className="text-[10px] font-bold text-muted">Lv. {pkm.level}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Friend's Pokemon */}
          <div className="bg-surface p-4 sm:p-6 rounded-2xl border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base sm:text-lg font-black text-foreground">
                You Want
              </h3>
              <span className="text-xs font-bold text-muted bg-surface-raised px-2.5 py-0.5 rounded-full border border-border">
                {friendTradeable?.length || 0} available
              </span>
            </div>

            {isFriendLoading ? (
              <p className="text-muted text-sm">Loading trainer's Pokémon...</p>
            ) : friendTradeable?.length === 0 ? (
              <p className="text-muted italic text-xs sm:text-sm bg-surface-raised p-4 rounded-xl border border-border">
                This player has no Pokémon marked "For Trade".
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {friendTradeable?.map((pkm: OwnedPokemonDto) => {
                  const isSelected = friendSelected === pkm.id;
                  return (
                    <div
                      key={pkm.id}
                      onClick={() => setFriendSelected(pkm.id)}
                      className={`group cursor-pointer rounded-2xl p-3 flex flex-col items-center transition-all duration-200 select-none touch-manipulation border ${
                        isSelected
                          ? 'border-primary bg-surface-raised shadow-xs scale-[1.02]'
                          : 'border-border hover:border-border hover:bg-surface-raised/60 hover:-translate-y-0.5 bg-surface'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-surface-raised flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform">
                        <img src={pkm.species.spriteUrl || undefined} alt={pkm.species.name} className="w-12 h-12 object-contain pixelated" />
                      </div>
                      <span className="font-black text-xs text-center capitalize mt-2 truncate w-full text-foreground">
                        {pkm.nickname || pkm.species.name}
                      </span>
                      <span className="text-[10px] font-bold text-muted">Lv. {pkm.level}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-muted uppercase tracking-wider mb-1.5">You Give</span>
              {mySelected ? (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-surface-raised border border-border flex items-center justify-center">
                  <img src={myTradeable?.find((p: OwnedPokemonDto) => p.id === mySelected)?.species.spriteUrl} className="w-12 h-12 object-contain pixelated" />
                </div>
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted font-black text-sm">?</div>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-surface-raised border border-border flex items-center justify-center text-foreground font-black text-sm">
              ⇄
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-muted uppercase tracking-wider mb-1.5">You Receive</span>
              {friendSelected ? (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-surface-raised border border-border flex items-center justify-center">
                  <img src={friendTradeable?.find((p: OwnedPokemonDto) => p.id === friendSelected)?.species.spriteUrl} className="w-12 h-12 object-contain pixelated" />
                </div>
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted font-black text-sm">?</div>
              )}
            </div>
          </div>

          <button
            onClick={() => requestTrade.mutate()}
            disabled={!mySelected || !friendSelected || requestTrade.isPending}
            className="w-full md:w-auto px-8 sm:px-10 py-3 min-h-[44px] bg-primary text-primary-foreground font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] shadow-xs hover:opacity-90 flex items-center justify-center touch-manipulation select-none"
          >
            {requestTrade.isPending ? 'Sending Proposal...' : 'Send Trade Offer'}
          </button>
        </div>
      </div>
    </div>
  );
}
