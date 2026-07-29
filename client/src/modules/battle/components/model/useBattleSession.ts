import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { getEventMessage } from '../lib/utils';

export function useBattleSession() {
  const queryClient = useQueryClient();

  const { data: trainerSave } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    }
  });

  const { data: battleRes, isLoading, error } = useQuery({
    queryKey: ['activeBattle'],
    queryFn: async () => {
      const { data } = await api.get('/battles/active');
      return data.data;
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  const turnMutation = useMutation({
    mutationFn: async (action: string) => {
      const { data } = await api.post('/battles/turn', { action });
      return data.data;
    },
    onSuccess: (updatedTurnData) => {
      queryClient.setQueryData(['activeBattle'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status: updatedTurnData.status,
          turnNumber: updatedTurnData.turnNumber !== undefined ? updatedTurnData.turnNumber + 1 : old.turnNumber,
          playerPokemonData: updatedTurnData.p1State || old.playerPokemonData,
          opponentPokemonData: updatedTurnData.p2State || old.opponentPokemonData,
          log: [...(old.log || []), { turn: updatedTurnData.turnNumber ?? old.turnNumber, events: updatedTurnData.events }]
        };
      });
      const s = updatedTurnData.status;
      if (s === 'ACTIVE' || s === 'WAITING_SWITCH' || s === 'WAITING_MOVE_LEARN') {
        queryClient.invalidateQueries({ queryKey: ['activeBattle'] });
      }
    }
  });

  let lastTurnEvents: string[] = [];
  let rawEvents: any[] = [];
  
  if (battleRes) {
    const player = battleRes.playerPokemonData;
    const wild = battleRes.opponentPokemonData;
    const log = battleRes.log || [];
    const lastTurnLog = log.find((l: any) => l.turn === battleRes.turnNumber - 1);
    rawEvents = lastTurnLog ? lastTurnLog.events : [];
    
    lastTurnEvents = rawEvents.map((ev: any) => getEventMessage(ev, player, wild)).filter(Boolean);
  }

  const isFinished = battleRes ? (battleRes.status === 'WON' || battleRes.status === 'LOST' || battleRes.status === 'FLED' || battleRes.status === 'CAUGHT') : false;
  const isWaitingSwitch = battleRes ? battleRes.status === 'WAITING_SWITCH' : false;

  return {
    trainerSave,
    battleRes,
    isLoading,
    error,
    turnMutation,
    lastTurnEvents,
    rawEvents,
    isFinished,
    isWaitingSwitch,
  };
}
