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
    <div className="relative min-h-screen bg-background px-4 py-12 text-foreground overflow-hidden transition-colors duration-200">
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl mb-4">
            Choose Your <span className="underline decoration-white decoration-4 underline-offset-8">Partner</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Welcome to Astranox. Choose one of the classic starter Pokémon from any generation to begin your journey.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {ALL_GENERATION_STARTERS.map((pkm) => {
            const isSelected = selectedId === pkm.id;
            return (
              <div
                key={pkm.id}
                onClick={() => setSelectedId(pkm.id)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${ isSelected ? 'border-border bg-surface shadow-glow scale-105' : 'border-border bg-background/80 hover:border-border hover:bg-surface/80 hover:scale-[1.02]' }`}
              >
                <div className="relative z-20 flex flex-col items-center p-6">
                  <img
                    src={getSpriteUrl(pkm.id)}
                    alt={pkm.name}
                    className="h-32 w-32 object-contain transition-transform duration-500 group-hover:scale-110"
                    style={{ imageRendering: 'auto' }}
                  />
                  <h3 className="mt-4 text-xl font-bold text-foreground capitalize">{pkm.name}</h3>
                  <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">{pkm.type}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fixed Confirmation Bar */}
        <div className={`fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-md p-6 transform transition-transform duration-300 z-50 ${selectedId ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedId && (
                <img
                  src={getSpriteUrl(selectedId)}
                  className="h-16 w-16"
                  style={{ imageRendering: 'auto' }}
                />
              )}
              <div>
                <p className="text-sm text-muted font-semibold">Selected Partner</p>
                <p className="text-xl font-black text-foreground">
                  {ALL_GENERATION_STARTERS.find(p => p.id === selectedId)?.name}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleConfirm}
              disabled={mutation.isPending}
              className="rounded-xl bg-primary px-8 py-3 font-extrabold text-primary-foreground transition-all hover:bg-surface-raised hover:scale-105 border border-border shadow-glow disabled:opacity-50 disabled:hover:scale-100"
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
