# Astranox - System Design & Architecture

## 1. Overview
Astranox is a highly-accurate, browser-based Pokémon RPG. It strives for fidelity to the actual Pokémon games, using real species, real mechanics, and real data sourced from PokeAPI (seeded into PostgreSQL) rather than relying on live API calls at runtime. 

## 2. Technology Stack

### Frontend
- **Framework**: React + Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching & Caching**: TanStack Query (React Query)
- **Client State**: Zustand (primarily used for in-memory access tokens and active user sessions)

### Backend
- **Framework**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Logging**: Pino

### Authentication
- **Mechanism**: JWT Access Tokens + Refresh Tokens
- **Storage**: Access tokens are kept **in-memory only** on the client. Refresh tokens are hashed server-side and delivered via `httpOnly`, `sameSite: lax` cookies.

---

## 3. Architecture & Data Flow

### Backend Layering (Strict Dependency Direction)
`routes` ➔ `controller` ➔ `service` ➔ `repository` ➔ `database`

- **Routes**: Exclusively wire up endpoints and middleware. No business logic.
- **Controllers**: Parse requests, invoke services, and shape responses. Never touch Prisma directly.
- **Services**: Execute business logic and orchestrate domain rules.
- **Repositories**: All Prisma database queries are isolated here.
- **Game Domain (`/game`)**: **Pure and DB-free**. The battle engine and stat calculation modules operate strictly on provided context objects (`SpeciesContext`, `BattleContext`) without any DB imports.

### Frontend Layering
- **Components**: Strictly presentational.
- **Services/API**: No raw `fetch` or `axios` calls within components. All network requests go through centralized API services, consumed via TanStack Query hooks.

---

## 4. Core Game Mechanics & Systems

### 4.1 Game Logic
- **Baseline**: Mechanics are strictly locked to **Gen 9-era rules** (e.g., 0.5x paralysis speed, 1/16 burn residual damage) unless explicitly defined as a house rule.
- **Stat Math & Damage**: Accurate truncation formulas mapping precisely to the main series math.
- **Deterministic RNG**: Any function relying on randomness (accuracy, status checks, speed ties) takes an optional override value to ensure pure deterministic unit testing.

### 4.2 House Rules (Intentional Deviations)
- **Starters**: Instead of the standard Fire/Water/Grass trio, players choose from pseudo-legendary baby forms (Dratini, Larvitar, Bagon, Beldum, Gible, Deino, Goomy, Jangmo-o, Dreepy).
- **Infinite PP**: The concept of Power Points (PP) is removed. Moves can be used infinitely, and "Struggle" is eliminated.
- **Stat Scaling**: If the level gap between battling Pokémon exceeds 5, the lower-level Pokémon has its stats reduced dynamically.

---

## 5. Security & Error Handling

- **Error Format**: All endpoints return a unified response envelope:
  - Success: `{ "success": true, "data": {}, "meta": { "page": 1, "total": 0 } }`
  - Error: `{ "success": false, "error": { "code": "...", "message": "..." } }`
- **Ownership Checks**: Endpoints do not blindly rely on authentication middleware; they strictly verify resource ownership (e.g., ensuring a player can only access their own Pokémon).
- **Input Validation**: All inbound payloads are strictly validated using Zod at the controller layer.

---

## 6. Project Structure

```text
/client
  ├── src/
      ├── app/              # Next.js App Router structure
      ├── pages/            # FSD UI Views (Pokemart, Battle, Team, etc.)
      ├── shared/           # API config, shared types, utils
      ├── features/         # Feature-bound domain logic (Auth, Battle hooks)
      └── components/ui/    # Reusable generic UI components (Buttons, Modals)

/server
  ├── src/
      ├── game/             # Pure domain logic (Stats, Damage, Turn Resolver)
      ├── modules/          # Feature-sliced backend modules (Auth, Trainers, Battles)
      ├── common/           # Shared middleware, custom errors, global constants
      ├── config/           # Zod-validated env configs, Pino logger
      └── scripts/seed/     # Data ingestion pipeline from PokeAPI
```
