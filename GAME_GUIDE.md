# Astranox — Complete Game Guide & Systems Overview

Astranox is an authentic, browser-based Pokémon RPG that faithfully adheres to **Generation 9** battle mechanics while introducing high-tier progression, infinite level scaling (up to Lv 20,000), streamlined mechanics (no PP), and rich PvE/economic game modes.

---

## Table of Contents
1. [Core Concepts & Currencies](#1-core-concepts--currencies)
2. [Rank & Potential System](#2-rank--potential-system)
3. [Exploration Realms (`explore`)](#3-exploration-realms-explore)
4. [Astral Furnace (`smelt`)](#4-astral-furnace-smelt)
5. [Combat & Battle Engine (`battle`)](#5-combat--battle-engine-battle)
6. [Infinity Tower (`tower`)](#6-infinity-tower-tower)
7. [Void Rifts (`rift`)](#7-void-rifts-rift)
8. [Pokémon Growth & Management](#8-pokémon-growth--management)
9. [Evolution & Form Shifting](#9-evolution--form-shifting)
10. [Economy & Pokémart (`shop`, `inventory`)](#10-economy--pokémart-shop-inventory)
11. [Social, Trades & Marketplace (`trade`, `marketplace`)](#11-social-trades--marketplace-trade-marketplace)
12. [Events System (`events`)](#12-events-system-events)

---

## 1. Core Concepts & Currencies

Astranox operates around a persistent **Trainer Save** and features two dedicated currencies:

| Currency | Icon / Type | How to Earn | Primary Uses |
|---|---|---|---|
| **Astral Coins** | Standard Gold | Exploring biomes, battle wins, selling items | Pokémart purchases (Pokéballs, potions, mints, move shop), marketplace |
| **Infinity Coins** | Progression Purple | Clearing Infinity Tower floors, conquering Void Rifts | High-tier enhancement items in the Infinity Store (Potential Pearls, Bottle Caps) |

### Account Progression
* **Trainer Rank:** Represents the trainer's overall mastery (tiers F through EX). Unlocks higher Void Rift levels, rank exams, and high-difficulty zones.
* **Stored XP:** A shared pool of experience belonging to the trainer account. Used to instantly level up any owned Pokémon without needing to grind them in active battles.
* **Unlocked Forms:** Defeating special Pokémon forms (Megas, Gigantamax, item-evolutions) registers them into your account's permanent form database, unlocking free evolutions for your Pokémon.

---

## 2. Rank & Potential System

Every Pokémon possesses a **Potential Rank** that dictates its maximum level cap and Combat Power (CP) ceiling. Trainers also progress through a mirrored ranking ladder.

### Pokémon Potential Rank with Max Level

| Rank | Level |
| :--- | :--- |
| **F** | 25 |
| **E** | 50 |
| **D** | 75 |
| **C** | 100 |
| **B** | 150 |
| **A** | 200 |
| **S -** | 300 |
| **S** | 350 |
| **S +** | 400 |
| **SS -** | 500 |
| **SS** | 600 |
| **SS +** | 700 |
| **SSS -** | 800 |
| **SSS** | 900 |
| **SSS +** | 1000 |
| **EX** | 5000 |

### Experience & Leveling Math
Each level requires **100 XP** to level up:
* **Level 1:** `001 - 100 XP` (0 XP is also Level 1)
* **Level 2:** `101 - 200 XP`
* **Level 3:** `201 - 300 XP`
* **Level L:** `((L - 1) * 100 + 1)` to `(L * 100) XP`

### Trainer Rank Requirements

| Rank | Requirement |
| :--- | :--- |
| **F** | 1 pokemon with level 1 |
| **E** | 2 pokemon with level 26 |
| **D** | 2 pokemon with level 51 |
| **C** | 3 pokemon with level 76 |
| **B** | 3 pokemon with level 101 |
| **A** | 3 pokemon with level 151 |
| **S -** | 4 pokemon with level 201 |
| **S** | 4 pokemon with level 301 |
| **S +** | 4 pokemon with level 351 |
| **SS -** | 5 pokemon with level 401 |
| **SS** | 5 pokemon with level 501 |
| **SS +** | 5 pokemon with level 601 |
| **SSS -** | 6 pokemon with level 701 |
| **SSS** | 6 pokemon with level 801 |
| **SSS +** | 6 pokemon with level 901 |
| **EX** | 6 pokemon with level 1001 |

---

## 3. Exploration Realms (`explore`)

The **Explore** system allows trainers to send their active party to search 18 elemental regions and special biomes for Pokémon, Astral Coins, or hidden treasures.

### 1. Outcome Rates per Explore Action
Every exploration attempt triggers one of three randomized results:
* **75% — Wild Pokémon Encounter:** Initiates a wild battle session where you can fight or capture the Pokémon.
* **15% — Astral Coins:** Uncovers a stash of **500 to 1,500 Astral Coins**.
* **10% — Nothing:** The expedition finds nothing of interest.

### 2. Rare Encounter Priority Pools
Before selecting normal regional species, the encounter engine rolls against ultra-rare pools:

| Priority Category | Spawn Chance | Example Species |
|---|---:|---|
| **Super Legendary** | 0.001% | Arceus, Mewtwo, Rayquaza |
| **Legendary** | 0.019% | Dialga, Palkia, Zacian, Groudon |
| **Mythical** | 0.030% | Mew, Celebi, Jirachi, Darkrai |
| **Paradox** | 0.070% | Roaring Moon, Iron Valiant, Flutter Mane |
| **Ultra Beast** | 0.080% | Nihilego, Buzzwole, Kartana |
| **Pseudo Legendary** | 0.300% | Garchomp, Dragapult, Tyranitar, Salamence |

### 3. Regional Biomes & Potential
If a rare pool does not trigger, the engine selects species matching the region's elemental type (e.g., Plains = Normal/Grass/Flying, Volcano = Fire/Rock/Ground).
* Wild Pokémon levels are tailored per region (baseline 30–50).
* Potential ranges naturally from **F Rank** up to **SSS+ Rank**, giving every expedition an authentic chance to discover high-potential Pokémon.

---

## 4. Astral Furnace (`smelt`)

The **Astral Furnace** is the recycling and progression-conversion chamber. It allows trainers to permanently dismantle ("smelt") unwanted Pokémon from their collection to extract **Stored XP** and **Potential Pearls**.

### How Smelting Works:
1. **Eligibility Requirements:**
   * The Pokémon must be owned by the trainer.
   * The Pokémon **must NOT be in the active 6-slot party** (must be moved to storage first).
   * The Pokémon **must NOT be locked in escrow** (not listed on the marketplace or pending in an active trade offer).
2. **Rewards Granted Upon Smelt:**
   * **Stored XP:** Grants **60% of the Pokémon's total accumulated XP**. This XP is immediately deposited into your trainer account balance and can be funneled into any Pokémon of your choice.
   * **Guaranteed Lower-Tier Pearls (100%):** You receive 1 Potential Pearl for every rank tier below the smelted Pokémon's rank (down to Bronze/F rank).
   * **Same-Tier Pearl Chance:**
     * **50% chance** to receive a Potential Pearl of the **same rank** as the smelted Pokémon if it is unbound.
     * **20% chance** to receive the same-rank pearl if the Pokémon is account-bound.
3. **Irreversibility:** Smelting permanently removes the Pokémon from the player's collection.

---

## 5. Combat & Battle Engine (`battle`)

Astranox's battle engine delivers true **Generation 9** turn-based battle mechanics with deliberate modern quality-of-life adjustments:

### Key Battle Mechanics
1. **Infinite PP (No Power Points):**
   * Moves have unlimited uses. Moves never run out of PP, and the recoil move *Struggle* has been removed.
2. **Gen 9 Stat & Damage Formulas:**
   * Preserves precise integer truncation and Gen 9 modifiers (burn deals 1/16th max HP, paralysis reduces Speed by 50%, etc.).
3. **Persistent Battle Sessions:**
   * Active battles are stored in the database. If a player disconnects, refreshes, or leaves, they can resume their exact battle state without penalty.
4. **Capturing:**
   * In wild battles, trainers can throw Pokéballs from their inventory. Catch rate calculations incorporate current HP percentage, status ailments (Sleep/Freeze give 2.5x, Paralysis/Poison/Burn give 1.5x), and ball multipliers.

---

## 6. Infinity Tower (`tower`)

The **Infinity Tower** is an endless climbing gauntlet designed to test party strength and reward **Infinity Coins** and **Stored XP**.

### Key Tower Mechanics
* **1,000 Floors:** Climb up to 1,000 floors against escalating enemy teams.
* **Progressive Difficulty:**
  * **Enemy Level:** Scales smoothly from Level 1 up to **Level 1,000** at Floor 1,000.
  * **Enemy IVs:** Start at 10 and increase by +1 every 5 floors up to a max of 31.
  * **Enemy Team Size:** Starts at 1 Pokémon and expands by +1 every 20 floors up to a full party of 6.
* **Boss Milestones:**
  * **Mini-Boss (Every 25 floors):** 2× rewards.
  * **Boss (Every 50 floors):** 5× rewards, full 6-Pokémon team, max 31 IVs.
  * **Mega Boss (Every 100 floors):** 10× rewards, full 6-Pokémon team, max 31 IVs.
* **Encounter Unlocks:**
  * Pseudo-Legendaries and Megas appear past Floor 100.
  * Gigantamax, Paradox, and Ultra Beasts appear past Floor 300.
  * Legendaries and Mythicals appear past Floor 500 on milestone floors.
* **Floor Sweeping (Skip Feature):**
  * If your active party's Combat Power (CP) is **at least 10× higher** than the estimated floor CP, you can instantly sweep up to **100 floors at once** (up to floor 1,000), collecting all accumulated Infinity Coins and Stored XP in one click without fighting.
* **Daily Runs:** Tower runs reset daily at UTC midnight, while highest-floor personal records and earned currencies are saved permanently.

---

## 7. Void Rifts (`rift`)

**Void Rifts** are high-risk, multi-floor dimensional dungeons inhabited by corrupted Pokémon with multiplied stats. Rifts are the premier late-game source of **Infinity Coins**.

### Difficulties & Corrupted Multipliers

| Difficulty | Coin Reward Multiplier | Corrupted HP Multiplier | Atk / Def / SpA / SpD Multiplier | Speed Multiplier |
|---|---:|---:|---:|---:|
| **Normal** | 1.0× | +50% (1.50×) | +10% (1.10×) | +5% (1.05×) |
| **Hard** | 1.5× | +100% (2.00×) | +25% (1.25×) | +10% (1.10×) |
| **Nightmare** | 2.5× | +175% (2.75×) | +50% (1.50×) | +20% (1.20×) |
| **Abyss** | 4.0× | +250% (3.50×) | +75% (1.75×) | +30% (1.30×) |

### Structure & Progression
* **Floors Per Run:** Ranks F, E have 2 floors; D, C have 3 floors; B, A have 4 floors; S- through EX have 5 floors.
* **Rank Lock:** You can only enter Void Rifts up to your current Trainer Rank.
* **Floor Multiplier:** Each subsequent floor in a run increases the coin reward by +0.5× before difficulty multipliers are applied.

---

## 8. Pokémon Growth & Management

Trainers customize and maximize their Pokémon through specialized systems:

### 1. Stored XP Distribution (`distributeXp`)
* Trainers can feed Stored XP directly to any owned Pokémon via the management screen to raise its level instantly.
* The system prevents over-leveling past the Pokémon's current Potential Rank cap.

### 2. Potential Boosting (`boostPotential`)
* Consuming a corresponding **Potential Pearl** (e.g., `s-pearl` to upgrade from S- to S) permanently promotes the Pokémon's rank tier and raises its level cap.

### 3. IV Training (`boostIv`)
* **Bottle Cap:** Maxes out a single stat's Individual Value (IV) to 31.
* **Gold Bottle Cap:** Instantly maxes out all 6 stats' IVs to 31.

### 4. Move Relearner & Move Shop (`changeMoves`)
* Pokémon equip up to 4 moves.
* Moves learned naturally by leveling up are permanently unlocked.
* Additional moves can be purchased once from the **Astral Move Shop** and taught freely.

---

## 9. Evolution & Form Shifting

Astranox eliminates tedious evolution stones and trade cables in favor of modern, combat-oriented progression:

1. **Level-Based Evolution:**
   * Occurs automatically when the Pokémon meets its natural evolution level threshold.
2. **Defeat-Unlock Evolution (Mega, Gigantamax, Stone Evolutions):**
   * **No evolution stones or Mega Bracelets required!**
   * To evolve into a Mega form, Gigantamax form, or item-evolved form (e.g., Gengar, Raichu, Lucario-Mega), you must **defeat that form in battle at least once** (in Arena, Tower, Rift, or Wilds).
   * Once defeated, the form is added to your account's permanent `unlockedForms` list.
3. **Devolution & Form Re-rolling:**
   * Any Mega or Gigantamax Pokémon can freely devolve back to its base species form.
   * A devolved Pokémon can subsequently evolve into any other unlocked form of that species at any time.

---

## 10. Economy & Pokémart (`shop`, `inventory`)

The in-game economy features two distinct shopping experiences:

### 1. Astral Pokémart (Astral Coins)
* **Pokéballs:** Standard Pokéball, Great Ball, Ultra Ball, Master Ball, and specialty balls (Net Ball, Dusk Ball, etc.).
* **Medicine & Recovery:** Potions, Full Restores, Revives, Status Healers.
* **Mints & Training:** Nature Mints to optimize stat growths.
* **Move Catalog:** Permanent unlocks for competitive TMs and moves.

### 2. Infinity Store (Infinity Coins)
* **Potential Pearls:** Rank advancement pearls (from F up to EX).
* **Bottle Caps:** Silver and Gold Bottle Caps for perfect 31 IV stats.
* **Rare Curiosities:** High-tier consumable boosters and special rewards.

---

## 11. Social, Trades & Marketplace (`trade`, `marketplace`)

Astranox features a fully secure player-to-player trade economy protected by an automated server escrow system:

### 1. Direct Pokémon Trades (`trade`)
* Players can flag Pokémon as "Tradeable" in their profile.
* Send direct 1-for-1 trade proposals to other online trainers.
* Upon acceptance, Pokémon are transferred atomically between trainer saves.

### 2. Public Marketplace (`marketplace`)
* **Listings:** List any eligible owned Pokémon for public offer. Listed Pokémon are locked into escrow so they cannot be battled, evolved, or smelted while on the market.
* **Offers:** Prospective buyers make offers using their own owned Pokémon. Offered Pokémon are escrowed while the offer is pending.
* **Settlement:** When a seller accepts an offer, ownership swaps automatically. Cancelling or rejecting an offer instantly releases the escrowed Pokémon back to the owner.

---

## 12. Events System (`events`)

Limited-time community and seasonal events grant exclusive rewards:

* **Challenge Quests:** Tasks such as "Clear 10 Void Rift Floors", "Defeat 25 Ghost-Type Pokémon", or "Climb 50 Tower Floors".
* **Event Rewards:**
  * Bound event-exclusive Pokémon (with custom IVs, movesets, or rare forms).
  * Astral Coin packages and Infinity Coins.
* **Audit & History:** Past completed and expired events remain reviewable in the Event History log.

---

## Quick Reference Summary

| Feature | Primary Action | Key Resource / Requirement |
|---|---|---|
| **Explore** | Discover wild Pokémon & Astral Coins | Party with at least 1 Pokémon |
| **Smelt** | Dismantle Pokémon for Stored XP & Potential Pearls | Boxed Pokémon (not party, not escrowed) |
| **Battle** | Turn-based Gen 9 combat with infinite PP | Lead party Pokémon |
| **Infinity Tower** | Climb 1,000 floors (max Lv 1,000) for Infinity Coins & XP | Party CP (10x CP allows floor sweeps) |
| **Void Rifts** | Corrupted multi-floor dungeon challenges | Matching Trainer Rank |
| **Level Up** | Feed Stored XP directly to Pokémon | Stored XP pool + Pokémon Potential Cap |
| **Rank Up** | Promote Pokémon potential | Potential Pearls matching rank |
| **Evolve / Devolve** | Form change into Megas and G-Max | Defeat target form in battle once |
| **Trade / Market** | P2P trading with secure escrow | Non-party, non-bound Pokémon |
