export type TileType = 'WALKABLE' | 'GRASS' | 'WATER' | 'WALL' | 'WARP';

export type MapDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
  facing: MapDirection;
}

export interface WarpPoint {
  x: number;
  y: number;
  targetMapId: string;
  targetX: number;
  targetY: number;
  targetFacing?: MapDirection;
}

export interface EncounterEntry {
  speciesId: number;
  speciesName: string;
  minLevel: number;
  maxLevel: number;
  weight: number;
}

export interface EncounterTable {
  id: string;
  entries: EncounterEntry[];
}

export interface GameMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: TileType[][]; // indexed as tiles[y][x]
  spawnPoint: Position;
  warps: WarpPoint[];
  encounterTables?: Record<string, EncounterTable>;
}
