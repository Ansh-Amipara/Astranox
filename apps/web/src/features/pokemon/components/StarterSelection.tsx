import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getSpriteUrl } from '@/shared/api/api';

const ALL_GENERATION_STARTERS = [
  // Gen 1
  { id: 1, name: 'Bulbasaur', type: 'Grass / Poison' },
  { id: 4, name: 'Charmander', type: 'Fire' },
  { id: 7, name: 'Squirtle', type: 'Water' },
  // Gen 2
  { id: 152, name: 'Chikorita', type: 'Grass' },
  { id: 155, name: 'Cyndaquil', type: 'Fire' },
  { id: 158, name: 'Totodile', type: 'Water' },
  // Gen 3
  { id: 252, name: 'Treecko', type: 'Grass' },
  { id: 255, name: 'Torchic', type: 'Fire' },
  { id: 258, name: 'Mudkip', type: 'Water' },
  // Gen 4
  { id: 387, name: 'Turtwig', type: 'Grass' },
  { id: 390, name: 'Chimchar', type: 'Fire' },
  { id: 393, name: 'Piplup', type: 'Water' },
  // Gen 5
  { id: 495, name: 'Snivy', type: 'Grass' },
  { id: 498, name: 'Tepig', type: 'Fire' },
  { id: 501, name: 'Oshawott', type: 'Water' },
  // Gen 6
  { id: 650, name: 'Chespin', type: 'Grass' },
  { id: 653, name: 'Fennekin', type: 'Fire' },
  { id: 656, name: 'Froakie', type: 'Water' },
  // Gen 7
  { id: 722, name: 'Rowlet', type: 'Grass / Flying' },
  { id: 725, name: 'Litten', type: 'Fire' },
  { id: 728, name: 'Popplio', type: 'Water' },
  // Gen 8
  { id: 810, name: 'Grookey', type: 'Grass' },
  { id: 813, name: 'Scorbunny', type: 'Fire' },
  { id: 816, name: 'Sobble', type: 'Water' },
  // Gen 9
  { id: 906, name: 'Sprigatito', type: 'Grass' },
  { id: 909, name: 'Fuecoco', type: 'Fire' },
  { id: 912, name: 'Quaxly', type: 'Water' },
];

export function StarterSelection() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: async (speciesId: number) => {
      const { data } = await api.post('/trainers/starter', { speciesId });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch trainer save so the Home page updates
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
    },
  });

  const handleConfirm = () => {
    if (selectedId) {
      mutation.mutate(selectedId);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-background px-4 py-8 sm:py-12 text-foreground overflow-hidden transition-colors duration-200 pb-32">
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl mb-2 sm:mb-3">
            Choose Your <span className="underline decoration-foreground/30 decoration-4 underline-offset-8">Partner</span>
          </h1>
          <p className="text-xs sm:text-base text-muted max-w-2xl mx-auto">
            Welcome to Astranox. Choose one of the classic starter Pokémon from any generation to begin your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5 mb-12">
          {ALL_GENERATION_STARTERS.map((pkm) => {
            const isSelected = selectedId === pkm.id;
            return (
              <div
                key={pkm.id}
                onClick={() => setSelectedId(pkm.id)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 ease-out select-none touch-manipulation ${ isSelected ? 'border-primary/50 bg-surface shadow-md ring-2 ring-primary/20 scale-[1.02]' : 'border-border bg-surface hover:border-border hover:shadow-md hover:-translate-y-0.5 shadow-xs' }`}
              >
                <div className="relative z-20 flex flex-col items-center p-5 sm:p-6">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface-raised border border-border/80 flex items-center justify-center p-2 mb-3 shadow-xs group-hover:scale-105 transition-transform duration-200">
                    <img
                      src={getSpriteUrl(pkm.id)}
                      alt={pkm.name}
                      className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-sm"
                      style={{ imageRendering: 'auto' }}
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-foreground capitalize tracking-tight">{pkm.name}</h3>
                  <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted bg-surface-raised border border-border px-2 py-0.5 rounded-full">{pkm.type}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fixed Confirmation Bar */}
        <div className={`fixed bottom-0 left-0 right-0 border-t border-border bg-surface/90 backdrop-blur-lg p-4 sm:p-5 pb-safe transform transition-transform duration-300 z-50 shadow-xl ${selectedId ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {selectedId && (
                <div className="w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center p-1 shadow-xs shrink-0">
                  <img
                    src={getSpriteUrl(selectedId)}
                    alt="Starter"
                    className="h-10 w-10 object-contain"
                    style={{ imageRendering: 'auto' }}
                  />
                </div>
              )}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted font-bold">Selected Partner</p>
                <p className="text-base sm:text-lg font-black text-foreground capitalize tracking-tight">
                  {ALL_GENERATION_STARTERS.find(p => p.id === selectedId)?.name}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleConfirm}
              disabled={mutation.isPending}
              className="w-full sm:w-auto rounded-xl bg-primary px-7 py-3 min-h-[44px] font-black text-sm text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] border border-primary/20 shadow-xs disabled:opacity-50 flex items-center justify-center touch-manipulation select-none"
            >
              {mutation.isPending ? 'Confirming...' : 'Confirm Selection'}
            </button>
          </div>
        </div>
        
        {mutation.isError && (
          <div className="mt-4 rounded-xl bg-surface p-4 text-center text-foreground border border-border">
            {mutation.error instanceof Error ? mutation.error.message : 'Failed to choose starter.'}
          </div>
        )}
      </div>
    </div>
  );
}
