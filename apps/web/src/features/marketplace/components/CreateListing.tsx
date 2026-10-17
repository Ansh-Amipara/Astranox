import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api, getSpriteUrl } from '@/shared/api/api';
import { useCreateListing } from '../hooks/queries';
import { Loader2, ArrowLeft, Check } from 'lucide-react';
import { OwnedPokemonDto, TradeListingDto, createListingSchema } from '@astranox/types';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';

export function CreateListingPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  const { data: myPokemonResponse, isLoading } = useQuery({
    queryKey: ['pokemon'],
    queryFn: () => api.get('/trainers/pokemon').then(res => res.data)
  });
  
  const createListingMutation = useCreateListing();
  const pokemonList = myPokemonResponse?.data || [];
  const tradablePokemon = pokemonList.filter((p: OwnedPokemonDto) => !p.isParty && !p.isEscrowed);

  const handleSubmit = () => {
    if (!selectedId) {
      setFormError('Please select a Pokémon to list.');
      notify.warning('Please select a Pokémon to list.');
      return;
    }

    const parsed = createListingSchema.safeParse({ pokemonId: selectedId, description });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Invalid listing data';
      setFormError(msg);
      notify.error(msg);
      return;
    }

    setFormError(null);
    createListingMutation.mutate({ pokemonId: parsed.data.pokemonId, description: parsed.data.description ?? undefined }, {
      onSuccess: (data: TradeListingDto) => {
        notify.success('Listing created successfully!');
        navigate(`/marketplace/${data.id}`);
      },
      onError: (err: unknown) => {
        const parsedErr = parseApiError(err);
        const msg = parsedErr.message || 'Failed to create listing';
        setFormError(msg);
        notify.error(msg);
      }
    });
  };

  return (
    <div className="flex-1 bg-background p-4 md:p-6 min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-subtle hover:text-subtle transition-colors mb-6 font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Marketplace
        </button>

        <h1 className="text-3xl font-black text-foreground mb-2">Create Trade Listing</h1>
        <p className="text-muted mb-8">Offer one of your Pokémon for exchange. It will be moved to Escrow for up to 7 days.</p>

        <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">1. Select Pokémon</h2>
          
          {isLoading ? (
             <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-foreground animate-spin" /></div>
          ) : tradablePokemon.length === 0 ? (
             <div className="text-center py-12 text-subtle bg-surface-raised rounded-xl border border-border">You have no tradable Pokémon in your PC.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-h-[40vh] overflow-y-auto p-2">
              {tradablePokemon.map((p: OwnedPokemonDto) => {
                const isSelected = selectedId === p.id;
                return (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`relative p-4 rounded-2xl cursor-pointer border-2 transition-all flex flex-col items-center gap-2 ${ isSelected ? 'border-border bg-surface-raised shadow-sm scale-105' : 'border-border hover:border-border bg-surface' }`}
                  >
                    <img src={getSpriteUrl(p.species.id)} alt={p.species.name} className="w-16 h-16 pixelated" />
                    <div className="text-center">
                      <p className="font-bold text-foreground text-sm capitalize">{p.species.name}</p>
                      <p className="text-xs text-subtle">Lv. {p.level}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-surface-raised text-foreground rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">2. Optional Description</h2>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you looking for? e.g., 'LF: Any Legendary or High Tier Dragon'"
            className="w-full p-4 bg-surface-raised border border-border rounded-xl focus:ring-2 focus:ring-border focus:border-transparent outline-none text-foreground resize-none h-32"
          />
        </div>

        {formError && (
          <div className="rounded-xl bg-surface p-3 text-sm text-foreground border border-border mb-6">
            {formError}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={handleSubmit}
            disabled={!selectedId || createListingMutation.isPending}
            className="px-8 py-4 bg-surface-raised hover:bg-surface-raised text-foreground font-black rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-glow text-lg"
          >
            {createListingMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            List Pokémon on Exchange
          </button>
        </div>

      </div>
    </div>
  );
}

export const CreateListing = CreateListingPage;

