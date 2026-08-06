import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { towerService } from './tower.service';

export const useTowerState = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['towerState'],
    queryFn: towerService.getState,
    enabled: options?.enabled
  });
};

export const useStartTowerFloor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: towerService.startFloor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['towerState'] });
    }
  });
};

export const useStartTowerBattle = () => {
  return useMutation({
    mutationFn: (playerActivePokemonId?: string) => towerService.startBattle(playerActivePokemonId)
  });
};

export const useCompleteTowerBattle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (result: 'WON' | 'LOST') => towerService.completeBattle(result),
    onSuccess: (data) => {
      queryClient.setQueryData(['towerState'], data);
      queryClient.invalidateQueries({ queryKey: ['towerState'] });
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
    }
  });
};

export const useSkipTowerFloors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: towerService.skipFloors,
    onSuccess: (data) => {
      queryClient.setQueryData(['towerState'], data);
      queryClient.invalidateQueries({ queryKey: ['towerState'] });
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
    }
  });
};
