import { GameMap, MapDirection, Position, WarpPoint, TileType } from './types';

export interface CanMoveResult {
  allowed: boolean;
  nextPosition: Position;
  tile?: TileType;
  warp?: WarpPoint;
  reason?: 'OUT_OF_BOUNDS' | 'TILE_BLOCKED' | 'TILE_WATER' | 'INVALID_MAP';
}

export function canMove(
  map: GameMap,
  from: Position,
  direction: MapDirection
): CanMoveResult {
  let dx = 0;
  let dy = 0;

  switch (direction) {
    case 'UP':
      dy = -1;
      break;
    case 'DOWN':
      dy = 1;
      break;
    case 'LEFT':
      dx = -1;
      break;
    case 'RIGHT':
      dx = 1;
      break;
  }

  const targetX = from.x + dx;
  const targetY = from.y + dy;

  // 1. Bounds check
  if (targetX < 0 || targetX >= map.width || targetY < 0 || targetY >= map.height) {
    return {
      allowed: false,
      nextPosition: { ...from, facing: direction },
      reason: 'OUT_OF_BOUNDS',
    };
  }

  const targetRow = map.tiles[targetY];
  if (!targetRow) {
    return {
      allowed: false,
      nextPosition: { ...from, facing: direction },
      reason: 'INVALID_MAP',
    };
  }

  const tile = targetRow[targetX];

  // 2. Obstacle / collision check
  if (tile === 'WALL') {
    return {
      allowed: false,
      nextPosition: { ...from, facing: direction },
      tile,
      reason: 'TILE_BLOCKED',
    };
  }

  if (tile === 'WATER') {
    return {
      allowed: false,
      nextPosition: { ...from, facing: direction },
      tile,
      reason: 'TILE_WATER',
    };
  }

  // 3. Warp check
  if (tile === 'WARP') {
    const warp = map.warps.find((w) => w.x === targetX && w.y === targetY);
    if (warp) {
      return {
        allowed: true,
        nextPosition: {
          x: warp.targetX,
          y: warp.targetY,
          facing: warp.targetFacing ?? direction,
        },
        tile,
        warp,
      };
    }
  }

  // 4. Walkable / Grass move
  return {
    allowed: true,
    nextPosition: {
      x: targetX,
      y: targetY,
      facing: direction,
    },
    tile,
  };
}
