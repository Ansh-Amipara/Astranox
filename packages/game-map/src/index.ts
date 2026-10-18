import { palletTownMap } from './maps/pallet-town';
import { route1Map } from './maps/route-1';
import { GameMap } from './types';

export * from './types';
export * from './collision';
export * from './encounter';
export * from './maps/pallet-town';
export * from './maps/route-1';

export const ALL_MAPS: Record<string, GameMap> = {
  'pallet-town': palletTownMap,
  'route-1': route1Map,
};

export function getMapById(id: string): GameMap | undefined {
  return ALL_MAPS[id];
}
