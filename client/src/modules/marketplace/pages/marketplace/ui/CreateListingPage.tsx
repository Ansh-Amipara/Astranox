import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api, getSpriteUrl } from '@/shared/api/api';
import { useCreateListing } from '@/modules/marketplace/components/api/queries';
import { Loader2, ArrowLeft, Check, AlertCircle } from 'lucide-react';

export function CreateListingPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  
  const { data: myPokemonResponse, isLoading } = useQuery({
    queryKey: ['pokemon'],
    queryFn: () => api.get('/trainers/pokemon').then(res => res.data)
  });
  
  const createListingMutation = useCreateListing();
  const pokemonList = myPokemonResponse?.data || [];
  const tradablePokemon = pokemonList.filter((p: any) => !p.isParty && !p.isEscrowed);

  const handleSubmit = () => {
    if (!selectedId) return;
    createListingMutation.mutate({ pokemonId: selectedId, description }, {
      onSuccess: (data: any) => {
        navigate(`/marketplace/${data.id}`);
      }
    });
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 md:p-6 min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mb-6 font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Marketplace
        </button>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Create Trade Listing</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Offer one of your Pokémon for exchange. It will be moved to Escrow for up to 7 days.</p>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">1. Select Pokémon</h2>
          
          {isLoading ? (
             <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
          ) : tradablePokemon.length === 0 ? (
             <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">You have no tradable Pokémon in your PC.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-h-[40vh] overflow-y-auto p-2">
              {tradablePokemon.map((p: any) => {
                const isSelected = selectedId === p.id;
                return (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`relative p-4 rounded-2xl cursor-pointer border-2 transition-all flex flex-col items-center gap-2 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm scale-105' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <img src={getSpriteUrl(p.species.id)} alt={p.species.name} className="w-16 h-16 pixelated" />
                    <div className="text-center">
                      <p className="font-bold text-slate-800 dark:text-white text-sm capitalize">{p.species.name}</p>
                      <p className="text-xs text-slate-500">Lv. {p.level}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">2. Optional Description</h2>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you looking for? e.g., 'LF: Any Legendary or High Tier Dragon'"
            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-800 dark:text-white resize-none h-32"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={handleSubmit}
            disabled={!selectedId || createListingMutation.isPending}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/30 text-lg"
          >
            {createListingMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            List Pokémon on Exchange
          </button>
        </div>

      </div>
    </div>
  );
}
