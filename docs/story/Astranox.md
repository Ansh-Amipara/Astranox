# World of Astranox

## Continents and Regions

### Solaris
- **Astera**
- **Pyron**
- **Verdantia**

### Lunaria
- **Noctis**
- **Frostveil**
- **Moonfall**

### Aetheria
- **Stormreach**
- **Skyhaven**
- **Crystalmere**

### Nerevia
- **Tidewatch**
- **Coralyn**
- **Abyssara**

---
# Pokémon Potential and Trainer Rank System
A Pokémon's **Potential** (or Rank) dictates the absolute maximum level it can reach through training.

| Trainer Rank   | Pokemon Potentials   | Maximum Level |
| -------------- | -------------------- | ------------- |
| **NO RANK**    | None (Unranked)      | 5             |
| **F**          | Black Iron, Bronze   | 60            |
| **E**          | Silver, Gold         | 120           |
| **D**          | Platinum, Adamantite | 200           |
| **C**          | Diamond,             | 300           |
| **B**          | Crystal              | 400           |
| **A**          | Epic                 | 500           |
| **S-**         | Heroic               | 700           |
| **S**          | Sovereign            | 900           |
| **S+**         | Legendary            | 1100          |
| **SS-**        | Divine               | 1400          |
| **SS**         | Celestial            | 1700          |
| **SS+**        | Primordial           | 2000          |
| **SSS-**       | Mythical             | 3000          |
| **SSS**        | Infinity             | 4000          |
| **SSS+**       | Eternal              | 5000          |

# Battle & Capture Rules

* **Astral Realms:** Pokémon encountered within an Astral Realm **are capturable**.
* **Standard Fights:** Pokémon encountered in normal Wild or NPC fights **are NOT capturable**.
* **Level Generation:** The level range of Pokémon in any fight spans from **Lv. 1 to Lv. 5000**, depending on your current progress and the tier of the realm or region.

---

# Experience & Leveling

Astranox uses a **Quadratic Experience Curve** house rule for leveling, rather than the traditional growth rate curves (Fast, Medium Slow, etc.). 

* **Leveling Up:** The XP required to level up from `Level L` to `Level L+1` is exactly `L * 100`. 
  * *Example:* Going from Level 50 to 51 requires `5,000 XP`.
* **Total XP Formula:** `Total XP = 50 * L * (L - 1)`
* **XP Yield:** Defeating a wild Pokémon yields Experience based on a modified Gen 5 formula: `(Base Experience * Defeated Level) / 5`. This ensures that leveling speed remains balanced as XP requirements grow.

---

# Legendary Pokémon Tiers

This classification works well for Astranox because it separates the true "world-defining" Legendary Pokémon from the rest, giving you a clear endgame progression.

## super Legendary Pokémon (8)

These are the absolute highest-tier Legendary Pokémon in the world and should be the rarest encounters
| Pokémon   |
| --------- |
| Arceus    |
| Zygarde   |
| Necrozma  |
| Eternatus |
| Kyurem    |
| Rayquaza  |
| Hoopa     |
| Mewtwo    |

---

## Tier 1 Legendary Pokémon (19)

These are incredibly powerful, world-defining Legendary Pokémon that sit just below the absolute highest tier.

| Pokémon   |
| --------- |
| Groudon   |
| Kyogre    |
| Dialga    |
| Palkia    |
| Giratina  |
| Reshiram  |
| Zekrom    |
| Solgaleo  |
| Lunala    |
| Koraidon  |
| Miraidon  |
| Calyrex   |
| Xerneas   |
| Yveltal   |
| Regigigas |
| Lugia     |
| Ho-Oh     |
| Zacian    |
| Zamazenta |

---
## Tier 2 Legendary Pokémon

* Urshifu
* Terapagos
* Glastrier
* Spectrier
* Mew
* Celebi
* Jirachi
* Deoxys
* Manaphy
* Darkrai
* Keldeo
* Meloetta
* Genesect
* Diancie
* Volcanion
* Melmetal
* Zarude
* Marshadow
* Zeraora
* Victini

## Tier 3 Legendary 
* Articuno
* Zapdos
* Moltres
* Raikou
* Entei
* Suicune
* Regirock
* Regice
* Registeel
* Latias
* Latios
* Uxie
* Mesprit
* Azelf
* Heatran
* Cresselia
* Cobalion
* Terrakion
* Virizion
* Tornadus
* Thundurus
* Landorus
* Type: Null
* Silvally
* Tapu Koko
* Tapu Lele
* Tapu Bulu
* Tapu Fini
* Cosmog
* Cosmoem
* Kubfu
* Urshifu
* Regieleki
* Regidrago
* Glastrier
* Spectrier
* Wo-Chien
* Chien-Pao
* Ting-Lu
* Chi-Yu
* Ogerpon
* Terapagos
* Okidogi
* Munkidori
* Fezandipiti
* Phione
* Shaymin
* Magearna
* Meltan
* Pecharunt

> Official Master Registry of Custom or Tracked Pokémon in Astranox.

---

## Universal Pokémon Data Template

Every Pokémon entry should follow this strict template:

```yaml
Species: <string>        # Base Species Name (e.g., Charizard)
Form: <string>           # Base / Mega-X / G-Max / Regional Form
DexNumber: <number>      # National Pokédex Number
Category: <string>       # Normal / Legendary / Mythical / Pseudo Legendary / Ultra Beast / Paradox
Typing:
  Type1: <string>        # Primary Type (e.g., Fire)
  Type2: <string>        # Secondary Type (e.g., Flying) / Optional
BaseStats:
  HP: <number>           
  Atk: <number>          
  Def: <number>          
  SpAtk: <number>        
  SpDef: <number>        
  Speed: <number>        
Abilities:
  Normal: [<string>]     # List of standard abilities
  Hidden: <string>       # Hidden ability / Optional
Evolution:
  From: <string>         # Pre-evolution / Optional
  To: <string>           # Next evolution / Optional
  Method: <string>       # e.g., "Level 36" or "Fire Stone"
```

## Universal NPC Data Template

Every NPC entry follows this strict template:

```yaml
Name: <string>           # Unique NPC Name
Title: <string>          # Optional Honorific / Title
Rank: <string>           # Competitive Rank & Level
Identity: <string>       # Faction Identity & Lore Role
Location:
  World: <string>        # astranox / void / Optional
  Continent: <string>    # Solaris / Lunaria / Aetheria / Nerevia / Optional
  Region: <string>       # Region Name / Optional
Reward:
  Coins: <number>        # Astral Coins
  XP: <number>           # Experience Points
  Items: [<string>]      # Reward Items / Optional
Pokémon:
  Ace: <string>          # Primary Ace Pokémon
  Team: [<string>]       # Full 6-Pokémon Roster
```

---

# Core Facilities & Features

## Smelt Pokémon (Astral Furnace)
The **Astral Furnace** allows players to permanently destroy ("Smelt") unwanted Pokémon in exchange for Stored XP and Potential Pearls. This completely replaces the traditional "Release Pokémon" functionality. 
- Smelted Pokémon are permanently deleted from the player's collection.
- Players are instantly rewarded with **Stored XP** (Floor of Current Pokémon XP × 0.60) and **Potential Pearls** (based on the Pokémon's Potential tier).
- **Precise Mechanics:** 60% XP return, 50% chance for a same-rank pearl, 100% chance for a lower-rank pearl.

## Infinity Tower
A challenging gauntlet where players ascend through increasingly difficult floors to test their strength and earn rare rewards. As Trainers climb higher, they will encounter elite NPC teams and uniquely powerful wild Pokémon scaled to their progress.
- **Endless Scaling:** Difficulty and rewards scale infinitely.
- **Boss Milestones:** 25 floors (Mini-Boss, 2x multiplier), 50 floors (Boss, 5x multiplier, guaranteed legendaries), 100 floors (Mega Boss, 10x multiplier, guaranteed legendaries).
- **Floor Sweeping (Skip):** Skip mechanics available for overwhelmingly powerful teams.

## Arena
The competitive heart of Astranox where Trainers can test their teams against other powerful opponents and climb the Trainer Ranks. Winning in the Arena yields Astral Coins, Experience, and prestige on the path to reaching the highest ranks (from F up to S-).

## Rift
Dynamic, time-limited anomalies that tear through the fabric of the Astranox universe. Rifts offer high-stakes, multi-floor encounters with uniquely augmented "Corrupted" Pokémon (scaling up to God Tier) and multiple difficulty modifiers (Normal to Abyss). Conquering Rifts yields Infinity Coins and legendary rewards not found anywhere else.
- **Corrupted Stats Multipliers:**
  - **Normal:** HP +50%, ATK/DEF/SPA/SPD +10%, SPE +5%
  - **Hard:** HP +100%, ATK/DEF/SPA/SPD +25%, SPE +10%
  - **Nightmare:** HP +175%, ATK/DEF/SPA/SPD +50%, SPE +20%
  - **Abyss:** HP +250%, ATK/DEF/SPA/SPD +75%, SPE +30%

### Void Rifts Rewards

| Rank | Floor | Level | Normal | Hard | Nightmare | Abyss |
| ---- | ----- | ----- | ------ | ---- | --------- | ----- |
| **F** | 1 | Lv 17 | 10 | 15 | 25 | 40 |
| **F** | 2 | Lv 25 | 15 | 22 | 37 | 60 |
| **E** | 1 | Lv 40 | 25 | 37 | 62 | 100 |
| **E** | 2 | Lv 50 | 37 | 56 | 93 | 150 |
| **D** | 1 | Lv 70 | 50 | 75 | 125 | 200 |
| **D** | 2 | Lv 80 | 75 | 112 | 187 | 300 |
| **D** | 3 | Lv 90 | 100 | 150 | 250 | 400 |
| **C** | 1 | Lv 116 | 100 | 150 | 250 | 400 |
| **C** | 2 | Lv 133 | 150 | 225 | 375 | 600 |
| **C** | 3 | Lv 150 | 200 | 300 | 500 | 800 |
| **B** | 1 | Lv 182 | 200 | 300 | 500 | 800 |
| **B** | 2 | Lv 205 | 300 | 450 | 750 | 1,200 |
| **B** | 3 | Lv 227 | 400 | 600 | 1,000 | 1,600 |
| **B** | 4 | Lv 250 | 500 | 750 | 1,250 | 2,000 |
| **A** | 1 | Lv 295 | 400 | 600 | 1,000 | 1,600 |
| **A** | 2 | Lv 330 | 600 | 900 | 1,500 | 2,400 |
| **A** | 3 | Lv 365 | 800 | 1,200 | 2,000 | 3,200 |
| **A** | 4 | Lv 400 | 1,000 | 1,500 | 2,500 | 4,000 |
| **S-** | 1 | Lv 448 | 800 | 1,200 | 2,000 | 3,200 |
| **S-** | 2 | Lv 486 | 1,200 | 1,800 | 3,000 | 4,800 |
| **S-** | 3 | Lv 524 | 1,600 | 2,400 | 4,000 | 6,400 |
| **S-** | 4 | Lv 562 | 2,000 | 3,000 | 5,000 | 8,000 |
| **S-** | 5 | Lv 600 | 2,400 | 3,600 | 6,000 | 9,600 |
| **S** | 1 | Lv 648 | 1,500 | 2,250 | 3,750 | 6,000 |
| **S** | 2 | Lv 686 | 2,250 | 3,375 | 5,625 | 9,000 |
| **S** | 3 | Lv 724 | 3,000 | 4,500 | 7,500 | 12,000 |
| **S** | 4 | Lv 762 | 3,750 | 5,625 | 9,375 | 15,000 |
| **S** | 5 | Lv 800 | 4,500 | 6,750 | 11,250 | 18,000 |
| **S+** | 1 | Lv 848 | 3,000 | 4,500 | 7,500 | 12,000 |
| **S+** | 2 | Lv 886 | 4,500 | 6,750 | 11,250 | 18,000 |
| **S+** | 3 | Lv 924 | 6,000 | 9,000 | 15,000 | 24,000 |
| **S+** | 4 | Lv 962 | 7,500 | 11,250 | 18,750 | 30,000 |
| **S+** | 5 | Lv 1000 | 9,000 | 13,500 | 22,500 | 36,000 |
| **SS-** | 1 | Lv 1068 | 5,000 | 7,500 | 12,500 | 20,000 |
| **SS-** | 2 | Lv 1126 | 7,500 | 11,250 | 18,750 | 30,000 |
| **SS-** | 3 | Lv 1184 | 10,000 | 15,000 | 25,000 | 40,000 |
| **SS-** | 4 | Lv 1242 | 12,500 | 18,750 | 31,250 | 50,000 |
| **SS-** | 5 | Lv 1300 | 15,000 | 22,500 | 37,500 | 60,000 |
| **SS** | 1 | Lv 1368 | 8,000 | 12,000 | 20,000 | 32,000 |
| **SS** | 2 | Lv 1426 | 12,000 | 18,000 | 30,000 | 48,000 |
| **SS** | 3 | Lv 1484 | 16,000 | 24,000 | 40,000 | 64,000 |
| **SS** | 4 | Lv 1542 | 20,000 | 30,000 | 50,000 | 80,000 |
| **SS** | 5 | Lv 1600 | 24,000 | 36,000 | 60,000 | 96,000 |
| **SS+** | 1 | Lv 1668 | 12,000 | 18,000 | 30,000 | 48,000 |
| **SS+** | 2 | Lv 1726 | 18,000 | 27,000 | 45,000 | 72,000 |
| **SS+** | 3 | Lv 1784 | 24,000 | 36,000 | 60,000 | 96,000 |
| **SS+** | 4 | Lv 1842 | 30,000 | 45,000 | 75,000 | 120,000 |
| **SS+** | 5 | Lv 1900 | 36,000 | 54,000 | 90,000 | 144,000 |
| **SSS-** | 1 | Lv 2028 | 20,000 | 30,000 | 50,000 | 80,000 |
| **SSS-** | 2 | Lv 2146 | 30,000 | 45,000 | 75,000 | 120,000 |
| **SSS-** | 3 | Lv 2264 | 40,000 | 60,000 | 100,000 | 160,000 |
| **SSS-** | 4 | Lv 2382 | 50,000 | 75,000 | 125,000 | 200,000 |
| **SSS-** | 5 | Lv 2500 | 60,000 | 90,000 | 150,000 | 240,000 |
| **SSS** | 1 | Lv 2708 | 35,000 | 52,500 | 87,500 | 140,000 |
| **SSS** | 2 | Lv 2906 | 52,500 | 78,750 | 131,250 | 210,000 |
| **SSS** | 3 | Lv 3104 | 70,000 | 105,000 | 175,000 | 280,000 |
| **SSS** | 4 | Lv 3302 | 87,500 | 131,250 | 218,750 | 350,000 |
| **SSS** | 5 | Lv 3500 | 105,000 | 157,500 | 262,500 | 420,000 |
| **SSS+** | 1 | Lv 3708 | 50,000 | 75,000 | 125,000 | 200,000 |
| **SSS+** | 2 | Lv 3906 | 75,000 | 112,500 | 187,500 | 300,000 |
| **SSS+** | 3 | Lv 4104 | 100,000 | 150,000 | 250,000 | 400,000 |
| **SSS+** | 4 | Lv 4302 | 125,000 | 187,500 | 312,500 | 500,000 |
| **SSS+** | 5 | Lv 4500 | 150,000 | 225,000 | 375,000 | 600,000 |
