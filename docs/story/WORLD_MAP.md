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
> Use this file to document new forms, custom species, or keep track of specific Pokémon details.

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
