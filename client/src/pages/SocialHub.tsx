import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export function SocialHub() {
  const [activeTab, setActiveTab] = useState<'friends' | 'trades'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Queries
  const { data: friendsData } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const { data } = await api.get('/social/friends');
      return data.data;
    }
  });

  const { data: searchResults, refetch: searchUsers } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 3) return [];
      const { data } = await api.get(`/social/search?q=${searchQuery}`);
      return data.data;
    },
    enabled: false // Only run on button click
  });

  const { data: incomingTrades } = useQuery({
    queryKey: ['incomingTrades'],
    queryFn: async () => {
      const { data } = await api.get('/trades/incoming');
      return data.data;
    }
  });

  const { data: outgoingTrades } = useQuery({
    queryKey: ['outgoingTrades'],
    queryFn: async () => {
      const { data } = await api.get('/trades/outgoing');
      return data.data;
    }
  });

  // Mutations
  const addFriend = useMutation({
    mutationFn: async (username: string) => {
      await api.post('/social/friends/request', { username });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      setSearchQuery('');
    }
  });

  const acceptFriend = useMutation({
    mutationFn: async (friendshipId: string) => {
      await api.post(`/social/friends/accept/${friendshipId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] })
  });

  const acceptTrade = useMutation({
    mutationFn: async (tradeId: string) => {
      await api.post(`/trades/accept/${tradeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomingTrades'] });
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] }); // refresh party/pc
    }
  });

  const rejectTrade = useMutation({
    mutationFn: async (tradeId: string) => {
      await api.post(`/trades/reject/${tradeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomingTrades'] });
      queryClient.invalidateQueries({ queryKey: ['outgoingTrades'] });
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers();
  };

  const pendingRequests = friendsData?.filter((f: any) => f.isIncoming) || [];
  const activeFriends = friendsData?.filter((f: any) => f.status === 'ACCEPTED') || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 h-full">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <button onClick={() => navigate('/')} className="text-slate-500 hover:text-blue-500 mb-2 flex items-center font-bold uppercase tracking-wider text-sm transition-colors">
              ◀ Back to Map
            </button>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Social Hub</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('friends')}
              className={`px-6 py-2 rounded-t-xl font-bold uppercase tracking-wider transition-colors ${activeTab === 'friends' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
            >
              <div className="flex items-center gap-2">👥 Friends</div>
            </button>
            <button 
              onClick={() => setActiveTab('trades')}
              className={`px-6 py-2 rounded-t-xl font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'trades' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
            >
              <div className="flex items-center gap-2">🔄 Trades</div>
              {(incomingTrades?.length > 0) && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{incomingTrades.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'friends' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Friends List Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-yellow-400 dark:border-yellow-600 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase flex items-center gap-2">
                    ➕ Pending Requests
                  </h3>
                  <div className="space-y-3">
                    {pendingRequests.map((req: any) => (
                      <div key={req.friendshipId} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-lg">{req.friend.username}</p>
                          <p className="text-sm text-slate-500">Badges: {req.friend.badges.length}</p>
                        </div>
                        <button 
                          onClick={() => acceptFriend.mutate(req.friendshipId)}
                          disabled={acceptFriend.isPending}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-colors"
                        >
                          Accept
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Friends */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase">Your Friends</h3>
                {activeFriends.length === 0 ? (
                  <p className="text-slate-500 italic">No friends yet. Search for a player to add them!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeFriends.map((f: any) => (
                      <div key={f.friendshipId} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-lg">{f.friend.username}</p>
                          <p className="text-sm text-slate-500">Badges: {f.friend.badges.length}</p>
                        </div>
                        <button 
                          onClick={() => navigate(`/trade/${f.friend.id}`)}
                          className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/50 text-purple-600 dark:text-purple-400 p-3 rounded-xl transition-colors group relative"
                          title="Propose Trade"
                        >
                          <span className="text-xl">🔄</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Column */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase">Find Players</h3>
              <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors">
                  <span>🔍</span>
                </button>
              </form>

              {searchResults && searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((user: any) => (
                    <div key={user.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white">{user.username}</span>
                      <button 
                        onClick={() => addFriend.mutate(user.username)}
                        disabled={addFriend.isPending}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-bold text-sm uppercase px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Incoming Trades */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase flex items-center gap-2">
                Incoming Offers
              </h3>
              {(!incomingTrades || incomingTrades.length === 0) ? (
                <p className="text-slate-500 italic">No incoming trade offers.</p>
              ) : (
                <div className="space-y-4">
                  {incomingTrades.map((trade: any) => (
                    <div key={trade.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <p className="text-sm font-bold text-slate-500 mb-2">From: {trade.initiator.user.username}</p>
                      
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex flex-col items-center flex-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-xs font-bold text-slate-400 mb-1 uppercase">They Offer</span>
                          <img src={trade.offeredPokemon.species.spriteUrl} alt="Offer" className="w-16 h-16 drop-shadow" />
                          <span className="font-bold text-sm text-slate-800 dark:text-white capitalize">{trade.offeredPokemon.species.name} (Lv {trade.offeredPokemon.level})</span>
                        </div>
                        
                        <span className="text-xl text-slate-400 shrink-0">➡️</span>
                        
                        <div className="flex flex-col items-center flex-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-xs font-bold text-slate-400 mb-1 uppercase">They Want</span>
                          <img src={trade.requestedPokemon.species.spriteUrl} alt="Request" className="w-16 h-16 drop-shadow" />
                          <span className="font-bold text-sm text-slate-800 dark:text-white capitalize">{trade.requestedPokemon.species.name} (Lv {trade.requestedPokemon.level})</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => acceptTrade.mutate(trade.id)}
                          disabled={acceptTrade.isPending}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                        >
                          ✔️ Accept
                        </button>
                        <button 
                          onClick={() => rejectTrade.mutate(trade.id)}
                          disabled={rejectTrade.isPending}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Trades */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm opacity-80">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase flex items-center gap-2">
                Outgoing Offers
              </h3>
              {(!outgoingTrades || outgoingTrades.length === 0) ? (
                <p className="text-slate-500 italic">No outgoing trade offers.</p>
              ) : (
                <div className="space-y-4">
                  {outgoingTrades.map((trade: any) => (
                    <div key={trade.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 relative">
                      <p className="text-sm font-bold text-slate-500 mb-2">To: {trade.receiver.user.username}</p>
                      
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex flex-col items-center flex-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-xs font-bold text-slate-400 mb-1 uppercase">You Offer</span>
                          <img src={trade.offeredPokemon.species.spriteUrl} alt="Offer" className="w-16 h-16 opacity-75 grayscale-[50%]" />
                        </div>
                        <span className="text-xl text-slate-400 shrink-0">➡️</span>
                        <div className="flex flex-col items-center flex-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-xs font-bold text-slate-400 mb-1 uppercase">You Want</span>
                          <img src={trade.requestedPokemon.species.spriteUrl} alt="Request" className="w-16 h-16 opacity-75 grayscale-[50%]" />
                        </div>
                      </div>

                      <button 
                        onClick={() => rejectTrade.mutate(trade.id)}
                        disabled={rejectTrade.isPending}
                        className="w-full bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 py-2 rounded-lg font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                      >
                        Cancel Offer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
