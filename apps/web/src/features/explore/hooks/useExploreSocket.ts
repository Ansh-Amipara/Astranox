import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/lib/SocketContext';
import { useExploreStore } from '../store';
import { MapDirection, canMove, getMapById } from '@astranox/game-map';
import { notify } from '@/lib/toast';

export function useExploreSocket() {
  const { socket, isConnected } = useSocket();
  const clientSeqRef = useRef<number>(0);

  const {
    mapId,
    playerPos,
    activeBattle,
    setMapId,
    setPlayerPos,
    setServerPos,
    reconcileRejected,
    setActiveBattle,
    addBattleEvents,
    setEncounterTransition,
    setFinalOutcome,
    setIsLoadingMap,
  } = useExploreStore();

  const joinExplore = useCallback(
    (requestedMapId?: string) => {
      if (!socket || !isConnected) return;
      setIsLoadingMap(true);
      socket.emit('explore:join', { mapId: requestedMapId || mapId });
    },
    [socket, isConnected, mapId, setIsLoadingMap]
  );

  const sendMove = useCallback(
    (direction: MapDirection) => {
      if (!socket || !isConnected || activeBattle) return;

      const currentMap = getMapById(mapId);
      if (!currentMap) return;

      // Optimistic client-side prediction using shared pure canMove helper
      const prediction = canMove(currentMap, playerPos, direction);
      if (prediction.allowed) {
        setPlayerPos({
          x: prediction.nextPosition.x,
          y: prediction.nextPosition.y,
          facing: prediction.nextPosition.facing,
        });
      } else {
        // Just turn facing direction if blocked
        setPlayerPos({
          ...playerPos,
          facing: direction,
        });
      }

      clientSeqRef.current += 1;
      const seq = clientSeqRef.current;

      socket.emit('explore:move', {
        direction,
        seq,
      });
    },
    [socket, isConnected, activeBattle, mapId, playerPos, setPlayerPos]
  );

  const sendBattleAction = useCallback(
    (action: any) => {
      if (!socket || !isConnected || !activeBattle) return;

      socket.emit('battle:action', {
        battleId: activeBattle.battleId,
        action,
      });
    },
    [socket, isConnected, activeBattle]
  );

  useEffect(() => {
    if (!socket) return;

    const handleExploreState = (data: any) => {
      setIsLoadingMap(false);
      if (data.mapId) setMapId(data.mapId);
      if (data.position) {
        setServerPos(data.position, clientSeqRef.current);
      }
      if (data.activeBattle) {
        setActiveBattle(data.activeBattle);
      }
    };

    const handleExploreMoved = (data: any) => {
      if (data.mapId && data.mapId !== mapId) {
        setMapId(data.mapId);
      }
      setServerPos(data.position, data.seq);
    };

    const handleExploreRejected = (data: any) => {
      // Snap client position back to authoritative server position
      reconcileRejected(data.position, data.seq);
    };

    const handleEncounterStart = (data: any) => {
      setEncounterTransition(true);
      setActiveBattle(data.state);
      addBattleEvents([
        {
          type: 'text',
          text: `A wild ${data.wildPokemon.speciesName} appeared!`,
        },
      ]);
    };

    const handleBattleUpdate = (data: any) => {
      if (data.events && data.events.length > 0) {
        addBattleEvents(data.events);
      }
      if (data.state) {
        setActiveBattle(data.state);
      }
    };

    const handleBattleEnd = (data: any) => {
      setFinalOutcome(data);
      if (data.outcome === 'WON') {
        notify.success('Wild battle won!');
      } else if (data.outcome === 'CAPTURED') {
        notify.success(`${data.capturedPokemon?.speciesName || 'Pokémon'} was caught!`);
      } else if (data.outcome === 'DEFEATED') {
        notify.error('All your Pokémon fainted!');
      }
    };

    const handleError = (error: any) => {
      notify.error(error?.message || 'An error occurred during exploration.', {
        id: 'explore-error',
      });
    };

    socket.on('explore:state', handleExploreState);
    socket.on('explore:moved', handleExploreMoved);
    socket.on('explore:rejected', handleExploreRejected);
    socket.on('encounter:start', handleEncounterStart);
    socket.on('battle:update', handleBattleUpdate);
    socket.on('battle:end', handleBattleEnd);
    socket.on('error', handleError);

    return () => {
      socket.off('explore:state', handleExploreState);
      socket.off('explore:moved', handleExploreMoved);
      socket.off('explore:rejected', handleExploreRejected);
      socket.off('encounter:start', handleEncounterStart);
      socket.off('battle:update', handleBattleUpdate);
      socket.off('battle:end', handleBattleEnd);
      socket.off('error', handleError);
    };
  }, [
    socket,
    mapId,
    setMapId,
    setServerPos,
    reconcileRejected,
    setActiveBattle,
    addBattleEvents,
    setEncounterTransition,
    setFinalOutcome,
    setIsLoadingMap,
  ]);

  return {
    isConnected,
    joinExplore,
    sendMove,
    sendBattleAction,
  };
}
