import { useQuery } from '@tanstack/react-query';
import { worldApi } from '../services/api';
import { MapCollage } from '../components/map/MapCollage';

export default function MapPage() {
  // 1. Fetch entire world hierarchy
  const { data: macroWorld, isLoading: isLoadingMacro, error: macroError } = useQuery({
    queryKey: ['world', 'macro'],
    queryFn: worldApi.getMacroLayout,
  });

  if (isLoadingMacro) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-900 text-white">
        <div className="text-xl font-bold animate-pulse">Loading World...</div>
      </div>
    );
  }

  if (macroError || !macroWorld) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-900 text-white">
        <div className="text-xl text-red-500">Failed to load world data.</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <MapCollage world={macroWorld[0]} />
    </div>
  );
}
