export type AvailableSpeciesDto = Readonly<{
  id: number;
  name: string;
  spriteUrl: string | null;
  category?: string;
  rank: string;
  pokedexNumber?: number | null;
}>;
