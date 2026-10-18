# Astranox

Astranox is a feature-rich, browser-based Pokémon game built with a modern web stack (React, TypeScript, Node.js, and Prisma). It utilizes real Pokémon mechanics, accurately calculated stats, and authentic catch rates sourced directly from PokeAPI.

📖 **For an in-depth explanation of game mechanics, exploration, smelting, battles, towers, and rifts, check out the [Complete Game Guide](GAME_GUIDE.md).**

## Features

- **Authentication System**: Secure JWT-based registration and login, including a specialized `Admin` role.
- **Dynamic Starter Selection**: Choose from pseudo-legendary baby forms as your first partner.
- **Turn-Based Battle Engine**: Includes exact Gen V+ damage math, status effects, and real-time HP/Stat calculations.
- **Persistent Data**: 
  - Manage a party of 6 Pokémon and 32 fully-featured PC Boxes.
  - Backpack inventory for managing your Pokéballs and currency.
- **World Map Hierarchy**: Explore a massive world with Continents, Regions, Areas, and GameMaps populated by real Pokémon encounters.
- **Astral Realms**: Delve into 42 unique tiered mystical dimensions that scale with your Trainer Rank, offering chances to encounter extremely powerful wild Pokémon, discover rare items, and find wealth.
- **Pokémart**: Purchase items and Pokéballs using in-game currency.
- **Modern UI & UX**: Clean, responsive design featuring seamless Light and Dark modes, strict digitized numeric inputs, intuitive smart-search dropdowns, and global React Error Boundaries.

## Admin Panel

The game includes a powerful Admin portal (`/admin/login`) for managing the game state:
- **User Management**: View all registered players, inject currency (₽), and instantly distribute custom Pokémon (with specific levels and IVs) directly to their PC/Party.
- **Map & Encounter Management**: Modify wild encounters in real-time. Assign specific Pokémon species, set their exact encounter rates (%), and define their guaranteed IV ranges across different Map Zones.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query (Structured using Feature-Sliced Design [FSD])
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Vitest with `@vitest/coverage-v8` for comprehensive backend and frontend testing.

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   pnpm install
   ```
2. Set up your `.env` file with your PostgreSQL connection string and JWT secrets.
3. Apply the database schema and seed the Pokémon data:
   ```bash
   pnpm prisma migrate dev
   pnpm run seed
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```

## Testing

Astranox includes a comprehensive test suite covering both the React frontend and the backend Game Engine using Vitest.

- **Run all tests:**
  ```bash
  pnpm test
  ```
- **Run tests with coverage reporting:**
  ```bash
  pnpm test -- --coverage
  ```

## 2D Exploration & Map Authoring Guide

Astranox features a server-authoritative 2D grid exploration engine. Game rules, maps, and collision are pure packages shared between server and client.

### 1. Adding a New Tile Type
1. **Declare Type**: Add the new identifier to `TileType` in `packages/game-map/src/types.ts`:
   ```ts
   export type TileType = 'WALKABLE' | 'WALL' | 'GRASS' | 'WATER' | 'WARP' | 'SAND';
   ```
2. **Configure Collision**: Update `canMove()` in `packages/game-map/src/collision.ts`:
   ```ts
   export function canMove(map: GameMap, x: number, y: number): boolean {
     const tile = map.tiles[y]?.[x];
     return tile === 'WALKABLE' || tile === 'GRASS' || tile === 'WARP' || tile === 'SAND';
   }
   ```
3. **Render Tile**: Add the rendering pattern in `apps/web/src/features/explore/components/MapView.tsx` inside `drawTilePattern()`.

### 2. Creating a New Map
1. **Define Map**: Create a file in `packages/game-map/src/maps/<map-id>.ts`:
   ```ts
   import { GameMap, TileType } from '../types';

   const W: TileType = 'WALL';
   const _: TileType = 'WALKABLE';
   const G: TileType = 'GRASS';
   const P: TileType = 'WARP';

   export const viridianCityMap: GameMap = {
     id: 'viridian-city',
     name: 'Viridian City',
     width: 12,
     height: 16,
     tiles: [
       [W, W, W, W, W, _, _, W, W, W, W, W],
       // ... full tile matrix
     ],
     spawnPoint: { x: 5, y: 14, facing: 'UP' },
     warps: [
       { x: 5, y: 15, targetMapId: 'route-1', targetX: 5, targetY: 1, targetFacing: 'DOWN' }
     ],
     encounterTables: {
       grass: {
         id: 'viridian-grass',
         entries: [
           { speciesId: 16, speciesName: 'Pidgey', minLevel: 3, maxLevel: 6, weight: 60 },
           { speciesId: 19, speciesName: 'Rattata', minLevel: 3, maxLevel: 5, weight: 40 },
         ]
       }
     }
   };
   ```
2. **Register Map**: Export and register the map in `packages/game-map/src/index.ts`:
   ```ts
   export const ALL_MAPS: Record<string, GameMap> = {
     'pallet-town': palletTownMap,
     'route-1': route1Map,
     'viridian-city': viridianCityMap,
   };
   ```

### 3. Adding an Encounter Table
Encounter tables define weighted distributions of species and level ranges:
- **`speciesId`**: Canonical national Pokédex ID.
- **`speciesName`**: Display species name.
- **`minLevel` / `maxLevel`**: Inclusive level bounds rolled upon encounter.
- **`weight`**: Relative probability weight.
The server-authoritative exploration engine evaluates encounters on stepping onto encounter tiles using a deterministic seeded PRNG (`mulberry32`), preventing client-side spoofing.

## Common Commands

- `pnpm dev` - Start the monorepo development server.
- `pnpm build` - Build both client and server packages.
- `pnpm lint` - Run ESLint across the monorepo.
- `pnpm typecheck` - Run TypeScript compiler checks without emitting files.
- `pnpm seed` - Fetch and seed the latest PokeAPI data into your local database.