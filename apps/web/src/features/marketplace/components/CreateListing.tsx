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
    <div className="flex-1 bg-background p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-64px)]">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors font-bold min-h-[44px] touch-manipulation select-none"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Marketplace
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Create Trade Listing</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">Offer one of your Pokémon for exchange. It will be moved to Escrow for up to 7 days.</p>
        </div>

        <div className="bg-surface rounded-2xl p-4 sm:p-6 shadow-xs border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-foreground">1. Select Pokémon</h2>
            <span className="text-xs font-bold text-muted bg-surface-raised px-2.5 py-1 rounded-full border border-border">
              {tradablePokemon.length} tradable
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-foreground animate-spin" /></div>
          ) : tradablePokemon.length === 0 ? (
            <div className="text-center py-12 text-muted bg-surface-raised rounded-xl border border-border text-sm">
              You have no tradable Pokémon in your PC.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[44dvh] overflow-y-auto p-1">
              {tradablePokemon.map((p: OwnedPokemonDto) => {
                const isSelected = selectedId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`group relative p-3 rounded-2xl cursor-pointer border transition-all duration-200 flex flex-col items-center gap-2 select-none touch-manipulation ${
                      isSelected
                        ? 'border-primary bg-surface-raised shadow-xs scale-[1.02]'
                        : 'border-border hover:border-border hover:bg-surface-raised/60 hover:-translate-y-0.5 bg-surface'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl bg-surface-raised flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform">
                      <img src={getSpriteUrl(p.species.id)} alt={p.species.name} className="w-12 h-12 pixelated object-contain" />
                    </div>
                    <div className="text-center w-full">
                      <p className="font-black text-foreground text-xs capitalize truncate">{p.species.name}</p>
                      <p className="text-[10px] font-bold text-muted mt-0.5">Lv. {p.level}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-surface rounded-2xl p-4 sm:p-6 shadow-xs border border-border space-y-3">
          <h2 className="text-base sm:text-lg font-black text-foreground">2. Optional Description</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you looking for? e.g., 'LF: Any Legendary or High Tier Dragon'"
            className="w-full p-3.5 bg-surface-raised border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground text-sm resize-none h-28 font-sans placeholder:text-muted/60"
          />
        </div>

        {formError && (
          <div className="rounded-xl bg-danger/10 p-3.5 text-xs font-bold text-danger border border-danger/20">
            {formError}
          </div>
        )}

        <div className="flex justify-end gap-3 pb-safe">
          <button
            onClick={handleSubmit}
            disabled={!selectedId || createListingMutation.isPending}
            className="w-full sm:w-auto px-7 py-3 min-h-[44px] bg-primary text-primary-foreground font-black rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] shadow-xs hover:opacity-90 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation select-none"
          >
            {createListingMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            List Pokémon on Exchange
          </button>
        </div>
      </div>
    </div>
  );
}

export const CreateListing = CreateListingPage;

