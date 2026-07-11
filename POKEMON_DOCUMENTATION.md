# Astranox: Pokémon Mechanics & Architecture Documentation

This document serves as the central source of truth for all Pokémon-related features, data models, mechanics, and house rules implemented in the **Astranox** project.

---

## 1. Core Philosophy & Data Truth
- **Fidelity:** Astranox is a **real Pokémon game** (actual species, mechanics, data), not a reskinned monster catcher.
- **Data Source:** [PokeAPI](https://pokeapi.co/) is the single source of truth for base stats, types, and learnsets. The data is seeded into PostgreSQL via `scripts/seed/pokeapi-seed.ts` and is **never called live at runtime**.
- **Mechanics Baseline:** The game uses exact **Gen 9 (Scarlet/Violet)** rules for status effects, damage calculation, and turn order, unless explicitly noted in the House Rules section.
- **Formulas:** Stat generation and damage calculation use exact, verified Gen V+ formulas (including intermediate truncations).

---

## 2. Database Models (`schema.prisma`)

The core static data and dynamic player data are separated strictly.

### Static Data (Seeded from PokeAPI)
- **`Species`**: Contains base stats (hp, attack, defense, spAtk, spDef, speed), `catchRate`, `baseExp`, and `spriteUrl`. (1025 species seeded).
- **`Move`**: Contains `power`, `accuracy`, `priority`, `damageClass` (Physical/Special/Status), and an associated `Type`. (937 moves seeded).
- **`Type` & `TypeMatchup`**: Defines the full elemental weakness/resistance matrix.
- **`Nature`**: Defines stat modifiers (+10% to one stat, -10% to another).

### Dynamic Data (Player Owned)
- **`OwnedPokemon`**: Represents an individual Pokémon owned by a player (or wild).
  - **Core:** `speciesId`, `nickname`, `level`, `exp`.
  - **Genetics/Training:** Individual Values (`ivHp`, `ivAtk`, etc.) and Effort Values (`evHp`, `evAtk`, etc.).
  - **State:** `currentHp`, `statusAilment`, `natureId`, `ability`.
  - **Storage:** `slotIndex` and `pcBoxId` (to determine if it's in the Party or PC).
  - **Moves:** `move1Id`, `move2Id`, `move3Id`, `move4Id`.

---

## 3. The `PokemonInstance` Domain Object

To keep the game engine pure and DB-agnostic, the backend converts `OwnedPokemon` rows into a `PokemonInstance` object (`server/src/game/instance/pokemon-instance.ts`).

- **Pure Functions:** `PokemonInstance` calculates its actual stats on the fly based on base stats, IVs, EVs, Nature, and Level.
- **DB-Free Boundary:** The battle engine and game logic folders (`server/src/game/`) contain **zero Prisma imports**. All static reference data (Species, Moves, Types) is injected via a `SpeciesContext`.
- **Mapper:** `trainers/owned-pokemon.mapper.ts` handles the bidirectional mapping between the Prisma `OwnedPokemon` row and the pure `PokemonInstance` class.

---

## 4. Battle Engine Mechanics

The battle engine (`server/src/game/battle-state/`) resolves turns based on Gen 9 rules.

- **Turn Order:** Determined strictly by the `speed` stat, applying a 0.5x speed penalty for Paralysis. Speed ties are broken via RNG (with injectable seeds for deterministic testing).
- **Damage Rolls:** Standard Gen 9 damage formula with the 0.85 - 1.00 random modifier.
- **Status Effects:**
  - **Burn:** 1/16 max HP damage per turn. Halves Physical attack damage.
  - **Poison:** 1/16 max HP damage per turn. (Bad Poison / Toxic is planned).
  - **Paralysis:** 25% chance to skip turn. Speed halved.
  - **Freeze:** 20% chance to thaw each turn.
  - **Sleep:** Lasts 1-3 turns.
- **Randomness:** All RNG (accuracy checks, damage variance, status procs) is built to accept an optional injected override, making the engine 100% unit-testable.

---

## 5. Persistence (Party & PC)

- **Party Constraints:** A trainer can hold exactly 6 Pokémon. Gaps are not allowed (e.g., you cannot have a Pokémon in Slot 1 and Slot 3 while Slot 2 is empty).
- **PC Storage:** The PC contains 32 Boxes, each holding up to 30 slots.
- **Transactions:** Swapping Pokémon between the party and the PC utilizes atomic `prisma.$transaction` blocks to prevent data loss or cloning.

---

## 6. Official House Rules (Deviations from Canon)

While Astranox strives for perfect Gen 9 fidelity, specific design choices have been made for the MMO format. These are the **only** permitted deviations:

1. **Pseudo-Legendary Starters:**
   - Players do not choose Grass/Fire/Water.
   - Starters are pseudo-legendary base forms: *Dratini, Larvitar, Bagon, Beldum, Gible, Deino, Goomy, Jangmo-o, Dreepy*.
   - They are given at Level 5 with random, canon-accurate IVs, Natures, and learnsets.
2. **Infinite PP:**
   - The concept of Power Points (PP) is completely removed. Moves can be used infinitely.
   - Consequently, the move *Struggle* does not exist.
3. **Level Difference Stat Scaling:**
   - If the level gap between two battling Pokémon is greater than 5, the lower-level Pokémon will have its stats artificially reduced to prevent stalling or cheese strategies. If the gap is 5 or less, stats are unaffected.
4. **Wild Encounters (Placeholder):**
   - Currently, wild encounters are completely randomized (random species, random level 3-15) rather than using location-specific encounter tables.

---

## 7. Open Architectural Goals (To-Do)

- **Move Secondary Effects:** The PokeAPI `Move` schema needs patching to include structured JSON for `ailment_chance`, `stat_changes`, and `flinch_chance`.
- **Stat Changing Moves:** Swords Dance, Growl, etc., cannot be implemented until the `Move` schema is patched.
- **Catching & Leveling:** The mechanics for throwing Pokéballs and distributing EXP post-battle remain unbuilt.
- **Abilities & Items:** Currently stubbed or unimplemented in the damage formula.
- **Zone/Encounter Tables:** Replacing the placeholder random spawns with actual location-based encounter rates (e.g., Pidgey on Route 1).
