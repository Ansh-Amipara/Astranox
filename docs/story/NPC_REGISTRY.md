# Astranox NPC Registry

> Official Master Registry of all NPCs across the 12 Regions of Astranox.

---

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

## Rank Examiners Registry

### F Rank Examiner
```yaml
Name: F Rank Examiner
Title: null
Rank: F (Level 1)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 300
  XP: 1000
  Items: ["Bronze Pearl"]
Pokémon:
  Ace: Luxio
  Team: ["Pidgeotto", "Luxio"]
```

### E Rank Examiner
```yaml
Name: E Rank Examiner
Title: null
Rank: E (Level 61)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 1000
  XP: 5000
  Items: ["Silver Pearl", "Gold Pearl"]
Pokémon:
  Ace: Magmortar
  Team: ["Pidgeot", "Luxray", "Magmortar"]
```

### D Rank Examiner
```yaml
Name: D Rank Examiner
Title: null
Rank: D (Level 121)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 3000
  XP: 15000
  Items: ["Platinum Pearl", "Adamantite Pearl"]
Pokémon:
  Ace: Charizard
  Team: ["Charizard", "Blastoise", "Venusaur", "Sceptile"]
```

### C Rank Examiner
```yaml
Name: C Rank Examiner
Title: null
Rank: C (Level 201)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 10000
  XP: 45000
  Items: ["Diamond Pearl"]
Pokémon:
  Ace: Garchomp
  Team: ["Dragonite", "Tyranitar", "Salamence", "Metagross", "Garchomp"]
```

### B Rank Examiner
```yaml
Name: B Rank Examiner
Title: null
Rank: B (Level 301)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 25000
  XP: 120000
  Items: ["Crystal Pearl"]
Pokémon:
  Ace: Kartana
  Team: ["Nihilego", "Buzzwole", "Pheromosa", "Xurkitree", "Celesteela", "Kartana"]
```

### A Rank Examiner
```yaml
Name: A Rank Examiner
Title: null
Rank: A (Level 401)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 60000
  XP: 300000
  Items: ["Epic Pearl"]
Pokémon:
  Ace: Iron Valiant
  Team: ["Great Tusk", "Roaring Moon", "Iron Valiant", "Iron Thorns", "Iron Bundle", "Flutter Mane"]
```

### S- Rank Examiner
```yaml
Name: S- Rank Examiner
Title: null
Rank: S- (Level 501)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 150000
  XP: 750000
  Items: null
Pokémon:
  Ace: Zapdos
  Team: ["Articuno", "Zapdos", "Moltres", "Raikou", "Entei", "Suicune"]
```

### S Rank Examiner
```yaml
Name: S Rank Examiner
Title: null
Rank: S (Level 701)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 400000
  XP: 1800000
  Items: null
Pokémon:
  Ace: Regieleki
  Team: ["Latios", "Latias", "Heatran", "Cresselia", "Regieleki", "Regidrago"]
```

### S+ Rank Examiner
```yaml
Name: S+ Rank Examiner
Title: null
Rank: S+ (Level 901)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 1000000
  XP: 4000000
  Items: null
Pokémon:
  Ace: Ogerpon
  Team: ["Tapu Koko", "Tapu Lele", "Tapu Bulu", "Tapu Fini", "Ogerpon", "Urshifu"]
```

### SS- Rank Examiner
```yaml
Name: SS- Rank Examiner
Title: null
Rank: SS- (Level 1101)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 2500000
  XP: 10000000
  Items: null
Pokémon:
  Ace: Deoxys
  Team: ["Deoxys", "Darkrai", "Genesect", "Keldeo", "Diancie", "Volcanion"]
```

### SS Rank Examiner
```yaml
Name: SS Rank Examiner
Title: null
Rank: SS (Level 1401)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 6000000
  XP: 25000000
  Items: null
Pokémon:
  Ace: Marshadow
  Team: ["Marshadow", "Zeraora", "Victini", "Melmetal", "Zarude", "Mew"]
```

### SS+ Rank Examiner
```yaml
Name: SS+ Rank Examiner
Title: null
Rank: SS+ (Level 1701)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 15000000
  XP: 60000000
  Items: null
Pokémon:
  Ace: Deoxys
  Team: ["Deoxys", "Darkrai", "Marshadow", "Zeraora", "Melmetal", "Genesect"]
```

### SSS- Rank Examiner
```yaml
Name: SSS- Rank Examiner
Title: null
Rank: SSS- (Level 2001)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 40000000
  XP: 150000000
  Items: null
Pokémon:
  Ace: Giratina
  Team: ["Groudon", "Kyogre", "Dialga", "Palkia", "Giratina", "Reshiram"]
```

### SSS Rank Examiner
```yaml
Name: SSS Rank Examiner
Title: null
Rank: SSS (Level 3001)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 100000000
  XP: 300000000
  Items: null
Pokémon:
  Ace: Koraidon
  Team: ["Zekrom", "Solgaleo", "Lunala", "Koraidon", "Miraidon", "Calyrex"]
```

### SSS+ Rank Examiner
```yaml
Name: SSS+ Rank Examiner
Title: null
Rank: SSS+ (Level 4001)
Identity: Official Astranox Rank Evaluator
Location:
  World: null
  Continent: null
  Region: null
Reward:
  Coins: 250000000
  XP: 600000000
  Items: null
Pokémon:
  Ace: Zacian
  Team: ["Xerneas", "Yveltal", "Lugia", "Ho-Oh", "Zacian", "Zamazenta"]
```

---

## Astranox Academy Registry

The complete roster of 58 NPCs (Principal, Vice Principals, Teachers, and Students from Rank S- down to Rank D) is maintained in [Astranox_Academy.md](file:///d:/Project/Astranox/docs/Astranox_Academy.md).
