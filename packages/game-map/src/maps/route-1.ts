import { GameMap, TileType } from '../types';

// 12x16 Map
const W: TileType = 'WALL';
const _: TileType = 'WALKABLE';
const G: TileType = 'GRASS';
const P: TileType = 'WARP';

const tiles: TileType[][] = [
  [W, W, W, W, W, _, _, W, W, W, W, W], // y=0: Viridian City exit
  [W, _, _, _, _, _, _, _, _, _, _, W], // y=1
  [W, _, G, G, _, _, _, G, G, G, _, W], // y=2: Grass patches
  [W, _, G, G, _, _, _, G, G, G, _, W], // y=3
  [W, _, _, _, _, _, _, _, _, _, _, W], // y=4
  [W, W, W, _, _, W, W, W, _, _, _, W], // y=5: Ledges
  [W, _, _, _, _, _, _, _, _, _, _, W], // y=6
  [W, _, G, G, G, _, _, _, G, G, _, W], // y=7
  [W, _, G, G, G, _, _, _, G, G, _, W], // y=8
  [W, _, _, _, _, _, _, _, _, _, _, W], // y=9
  [W, _, _, G, G, G, G, _, _, _, _, W], // y=10
  [W, _, _, G, G, G, G, _, _, _, _, W], // y=11
  [W, _, _, _, _, _, _, _, _, _, _, W], // y=12
  [W, _, _, _, _, _, _, _, _, _, _, W], // y=13
  [W, W, W, W, W, P, P, W, W, W, W, W], // y=14: South exit to Pallet Town
  [W, W, W, W, W, W, W, W, W, W, W, W], // y=15
];

export const route1Map: GameMap = {
  id: 'route-1',
  name: 'Route 1',
  width: 12,
  height: 16,
  tiles,
  spawnPoint: {
    x: 5,
    y: 13,
    facing: 'UP',
  },
  warps: [
    {
      x: 5,
      y: 14,
      targetMapId: 'pallet-town',
      targetX: 5,
      targetY: 1,
      targetFacing: 'DOWN',
    },
    {
      x: 6,
      y: 14,
      targetMapId: 'pallet-town',
      targetX: 6,
      targetY: 1,
      targetFacing: 'DOWN',
    },
  ],
  encounterTables: {
    grass: {
      id: 'route-1-grass',
      entries: [
        {
          speciesId: 16,
          speciesName: 'Pidgey',
          minLevel: 2,
          maxLevel: 5,
          weight: 50,
        },
        {
          speciesId: 19,
          speciesName: 'Rattata',
          minLevel: 2,
          maxLevel: 4,
          weight: 50,
        },
        {
          speciesId: 25,
          speciesName: 'Pikachu',
          minLevel: 3,
          maxLevel: 5,
          weight: 5,
        },
      ],
    },
  },
};
