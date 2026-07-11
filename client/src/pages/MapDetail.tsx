import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { worldApi, trainerApi, api } from '../services/api';
import { GameCanvas } from '../components/engine/GameCanvas';

export default function MapDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: mapInfo, isLoading: isMapLoading, error: mapError } = useQuery({
    queryKey: ['world', 'map', id],
    queryFn: () => worldApi.getMapDetails(id!),
    enabled: !!id,
  });

  const { data: trainerInfo, isLoading: isTrainerLoading } = useQuery({
    queryKey: ['trainer', 'me'],
    queryFn: trainerApi.getMe,
  });

  const exploreMutation = useMutation({
    mutationFn: (zoneId: string) => api.post('/battles/engage', { gameMapId: zoneId }),
    onSuccess: () => navigate('/battle'),
  });

  const savePositionMutation = useMutation({
    mutationFn: (pos: { mapId: string, x: number, y: number }) => 
      api.post('/world/position', pos)
  });

  if (isMapLoading || isTrainerLoading) return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-[#0B0F19]">
      <div className="text-xl font-bold text-blue-400 animate-pulse">Entering Map...</div>
    </div>
  );
  if (mapError || !mapInfo) return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-[#0B0F19]">
      <div className="text-xl text-red-500">Failed to load map data.</div>
    </div>
  );

  const spawns = mapInfo.spawnGroups?.flatMap((group: any) => group.entries) || [];
  const hasSpawns = spawns.length > 0;

  const handleEncounter = () => {
    exploreMutation.mutate(mapInfo.id);
  };

  const handleSavePosition = (x: number, y: number) => {
    // Fire and forget save
    savePositionMutation.mutate({ mapId: mapInfo.id, x, y });
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#0B0F19] text-white relative font-mono overflow-hidden flex flex-col">
      {/* HUD - Top */}
      <div className="absolute top-0 left-0 w-full z-10 p-6 pointer-events-none flex justify-between items-start">
        <div>
          <div className="text-white/70 text-sm mb-1 uppercase tracking-widest drop-shadow-md bg-black/40 px-3 py-1 rounded-full inline-block backdrop-blur-sm border border-white/10">
            {mapInfo.area?.region?.continent?.name} &rsaquo; {mapInfo.area?.region?.name} &rsaquo; {mapInfo.area?.name}
          </div>
          <h1 className="text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {mapInfo.name}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-gray-700/50 shadow-xl pointer-events-auto">
          <span className="flex items-center" title="Difficulty">⭐⭐ {mapInfo.difficulty || 1}</span>
          <span className="flex items-center" title="Weather">🌤 Sunny</span>
          <span className="flex items-center text-blue-300">🌲 {mapInfo.theme}</span>
        </div>
      </div>

      {/* Game Engine Viewport */}
      <div className="flex-1 w-full bg-black">
        {mapInfo.mapImage ? (
          <GameCanvas 
            mapImageUrl={mapInfo.mapImage}
            hasSpawns={hasSpawns}
            startX={trainerInfo?.positionX || 400}
            startY={trainerInfo?.positionY || 400}
            onEncounter={handleEncounter}
            onSavePosition={handleSavePosition}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 italic">
            Map geometry not found.
          </div>
        )}
      </div>
      
      {/* HUD - Bottom Legend */}
      <div className="absolute bottom-6 left-6 pointer-events-none z-10">
        <div className="bg-black/60 backdrop-blur-md px-6 py-4 rounded-xl border border-gray-700/50 shadow-xl inline-block">
          <div className="text-sm text-gray-400 mb-2 uppercase font-bold tracking-widest">Controls</div>
          <div className="flex items-center space-x-6 text-white font-bold">
            <span className="flex items-center"><span className="bg-white/20 px-2 py-1 rounded text-xs mr-2 border border-white/30">WASD</span> Move</span>
            {hasSpawns && <span className="flex items-center text-green-400 animate-pulse"><span className="mr-2">🌲</span> Wild encounters possible</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
