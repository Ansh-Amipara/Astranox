import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { getEventMessage } from '../utils';
import { useSocket } from '@/lib/SocketContext';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { BattleSessionDto, TurnEventDto, ActivePokemonDto } from '@astranox/types';;

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

  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleStateUpdate = (updatedTurnData: { status: string; turnNumber?: number; p1State?: ActivePokemonDto; p2State?: ActivePokemonDto; events?: TurnEventDto[]; log?: { turn: number; events: TurnEventDto[] }[]; playerPartyData?: any[]; opponentPartyData?: any[] }) => {
      queryClient.setQueryData(['activeBattle'], (old: BattleSessionDto | undefined) => {
        if (!old) return old;
        return {
          ...old,
          status: updatedTurnData.status,
          turnNumber: updatedTurnData.turnNumber !== undefined ? updatedTurnData.turnNumber + 1 : old.turnNumber,
          playerPokemonData: updatedTurnData.p1State || old.playerPokemonData,
          opponentPokemonData: updatedTurnData.p2State || old.opponentPokemonData,
          playerPartyData: updatedTurnData.playerPartyData || old.playerPartyData,
          opponentPartyData: updatedTurnData.opponentPartyData || old.opponentPartyData,
          log: [...(old.log || []), { turn: updatedTurnData.turnNumber ?? old.turnNumber ?? 0, events: updatedTurnData.events || [] }]
        };
      });

      const s = updatedTurnData.status;
      if (s === 'ACTIVE' || s === 'WAITING_SWITCH' || s === 'WAITING_MOVE_LEARN') {
        // Option to refetch, or we just trust the socket update
        // queryClient.invalidateQueries({ queryKey: ['activeBattle'] });
      }
    };

    const handleError = (error: { message?: string }) => {
      console.error('Battle Socket Error:', error);
    };

    socket.on('battle:state_update', handleStateUpdate);
    socket.on('battle:error', handleError);

    return () => {
      socket.off('battle:state_update', handleStateUpdate);
      socket.off('battle:error', handleError);
    };
  }, [socket, queryClient]);

  const turnMutation = useMutation({
    mutationFn: async (action: string) => {
      if (!socket || !isConnected) {
        throw new Error('Socket not connected');
      }
      return new Promise<void>((resolve) => {
        socket.emit('battle:submit_turn', { action });
        resolve(); // We resolve immediately, state updates come asynchronously via `battle:state_update`
      });
    }
  });

  let lastTurnEvents: string[] = [];
  let rawEvents: TurnEventDto[] = [];
  
  if (battleRes) {
    const player = battleRes.playerPokemonData;
    const wild = battleRes.opponentPokemonData;
    const log = battleRes.log || [];
    const lastTurnLog = log.find((l: { turn: number; events: TurnEventDto[] }) => l.turn === battleRes.turnNumber - 1);
    rawEvents = lastTurnLog ? lastTurnLog.events : [];
    
    lastTurnEvents = rawEvents.map((ev: TurnEventDto) => getEventMessage(ev, player, wild)).filter(Boolean) as string[];
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
