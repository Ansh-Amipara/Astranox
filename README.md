# Astranox

Astranox is a feature-rich, browser-based Pokémon game built with a modern web stack (React, TypeScript, Node.js, and Prisma). It utilizes real Pokémon mechanics, accurately calculated stats, and authentic catch rates sourced directly from PokeAPI.

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

## Common Commands

- `pnpm dev` - Start the monorepo development server.
- `pnpm build` - Build both client and server packages.
- `pnpm lint` - Run ESLint across the monorepo.
- `pnpm typecheck` - Run TypeScript compiler checks without emitting files.
- `pnpm seed` - Fetch and seed the latest PokeAPI data into your local database.