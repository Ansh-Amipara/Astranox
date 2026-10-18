import { GameMap, TileType } from '../types';

// 12x10 Map
const W: TileType = 'WALL';
const _: TileType = 'WALKABLE';
const A: TileType = 'WATER';
const P: TileType = 'WARP';

const tiles: TileType[][] = [
  [W, W, W, W, W, P, P, W, W, W, W, W], // y=0: North exit to Route 1
  [W, _, _, _, _, _, _, _, _, _, _, W], // y=1
  [W, _, W, W, _, _, _, _, W, W, _, W], // y=2 (Houses)
  [W, _, W, W, _, _, _, _, W, W, _, W], // y=3
  [W, _, _, _, _, _, _, _, _, _, _, W], // y=4
  [W, _, _, _, _, _, _, _, _, _, _, W], // y=5: Spawn area
  [W, _, W, W, W, _, _, _, _, _, _, W], // y=6 (Oak Lab)
  [W, _, W, W, W, _, _, A, A, A, _, W], // y=7 (Lab + Pond)
  [W, _, _, _, _, _, _, A, A, A, _, W], // y=8 (Pond)
  [W, W, W, W, W, W, W, W, W, W, W, W], // y=9: South blocked
];

export const palletTownMap: GameMap = {
  id: 'pallet-town',
  name: 'Pallet Town',
  width: 12,
  height: 10,
  tiles,
  spawnPoint: {
    x: 5,
    y: 5,
    facing: 'DOWN',
  },
  warps: [
    {
      x: 5,
      y: 0,
      targetMapId: 'route-1',
      targetX: 5,
      targetY: 14,
      targetFacing: 'UP',
    },
    {
      x: 6,
      y: 0,
      targetMapId: 'route-1',
      targetX: 6,
      targetY: 14,
      targetFacing: 'UP',
    },
  ],
  encounterTables: {},
};
