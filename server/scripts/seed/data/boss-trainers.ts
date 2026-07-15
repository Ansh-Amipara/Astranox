export interface BossTrainerData {
  name: string;
  region: string;
  trainerClass: string;
  trainerType: string;
  spriteId: string;
  rewardMoney: number;
  badgeName?: string;
  party: [string, number][]; // [speciesName, level]
}

export const bossTrainers: BossTrainerData[] = [
  // --- KANTO ---
  { name: 'Brock', region: 'Kanto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'brock', rewardMoney: 1500, badgeName: 'Boulder Badge', party: [['geodude', 12], ['onix', 14]] },
  { name: 'Misty', region: 'Kanto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'misty', rewardMoney: 2100, badgeName: 'Cascade Badge', party: [['staryu', 18], ['starmie', 21]] },
  { name: 'Lt. Surge', region: 'Kanto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'surge', rewardMoney: 2400, badgeName: 'Thunder Badge', party: [['voltorb', 21], ['pikachu', 18], ['raichu', 24]] },
  { name: 'Erika', region: 'Kanto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'erika', rewardMoney: 2900, badgeName: 'Rainbow Badge', party: [['victreebel', 29], ['tangela', 24], ['vileplume', 29]] },
  { name: 'Koga', region: 'Kanto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'koga', rewardMoney: 4300, badgeName: 'Soul Badge', party: [['koffing', 37], ['muk', 39], ['koffing', 37], ['weezing', 43]] },
  { name: 'Sabrina', region: 'Kanto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'sabrina', rewardMoney: 4300, badgeName: 'Marsh Badge', party: [['kadabra', 38], ['mr-mime', 37], ['venomoth', 38], ['alakazam', 43]] },
  { name: 'Blaine', region: 'Kanto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'blaine', rewardMoney: 4700, badgeName: 'Volcano Badge', party: [['growlithe', 42], ['ponyta', 40], ['rapidash', 42], ['arcanine', 47]] },
  { name: 'Giovanni', region: 'Kanto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'giovanni', rewardMoney: 5000, badgeName: 'Earth Badge', party: [['rhyhorn', 45], ['dugtrio', 42], ['nidoqueen', 44], ['nidoking', 45], ['rhydon', 50]] },
  { name: 'Lorelei', region: 'Kanto', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'lorelei', rewardMoney: 5600, party: [['dewgong', 54], ['cloyster', 53], ['slowbro', 54], ['jynx', 56], ['lapras', 56]] },
  { name: 'Bruno', region: 'Kanto', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'bruno', rewardMoney: 5800, party: [['onix', 53], ['hitmonchan', 55], ['hitmonlee', 55], ['onix', 56], ['machamp', 58]] },
  { name: 'Agatha', region: 'Kanto', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'agatha', rewardMoney: 6000, party: [['gengar', 56], ['golbat', 56], ['haunter', 55], ['arbok', 58], ['gengar', 60]] },
  { name: 'Lance', region: 'Kanto', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'lance', rewardMoney: 6200, party: [['gyarados', 58], ['dragonair', 56], ['dragonair', 56], ['aerodactyl', 60], ['dragonite', 62]] },
  { name: 'Blue', region: 'Kanto', trainerClass: 'Champion', trainerType: 'CHAMPION', spriteId: 'blue', rewardMoney: 6500, party: [['pidgeot', 61], ['alakazam', 59], ['rhydon', 61], ['exeggutor', 61], ['arcanine', 61], ['blastoise', 65]] },

  // --- JOHTO ---
  { name: 'Falkner', region: 'Johto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'falkner', rewardMoney: 900, badgeName: 'Zephyr Badge', party: [['pidgey', 7], ['pidgeotto', 9]] },
  { name: 'Bugsy', region: 'Johto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'bugsy', rewardMoney: 1600, badgeName: 'Hive Badge', party: [['metapod', 14], ['kakuna', 14], ['scyther', 16]] },
  { name: 'Whitney', region: 'Johto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'whitney', rewardMoney: 1900, badgeName: 'Plain Badge', party: [['clefairy', 17], ['miltank', 19]] },
  { name: 'Morty', region: 'Johto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'morty', rewardMoney: 2500, badgeName: 'Fog Badge', party: [['gastly', 21], ['haunter', 21], ['haunter', 23], ['gengar', 25]] },
  { name: 'Chuck', region: 'Johto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'chuck', rewardMoney: 3100, badgeName: 'Storm Badge', party: [['primeape', 27], ['poliwrath', 31]] },
  { name: 'Jasmine', region: 'Johto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'jasmine', rewardMoney: 3500, badgeName: 'Mineral Badge', party: [['magnemite', 30], ['magnemite', 30], ['steelix', 35]] },
  { name: 'Pryce', region: 'Johto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'pryce', rewardMoney: 3400, badgeName: 'Glacier Badge', party: [['seel', 27], ['dewgong', 29], ['piloswine', 31]] },
  { name: 'Clair', region: 'Johto', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'clair', rewardMoney: 4000, badgeName: 'Rising Badge', party: [['dragonair', 38], ['dragonair', 38], ['gyarados', 38], ['kingdra', 41]] },
  { name: 'Will', region: 'Johto', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'will', rewardMoney: 4200, party: [['xatu', 40], ['jynx', 41], ['exeggutor', 41], ['slowbro', 41], ['xatu', 42]] },
  { name: 'Koga (Johto)', region: 'Johto', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'koga', rewardMoney: 4400, party: [['ariados', 40], ['venomoth', 41], ['forretress', 43], ['muk', 42], ['crobat', 44]] },
  { name: 'Bruno (Johto)', region: 'Johto', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'bruno', rewardMoney: 4600, party: [['hitmontop', 42], ['hitmonlee', 42], ['hitmonchan', 42], ['onix', 43], ['machamp', 46]] },
  { name: 'Karen', region: 'Johto', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'karen', rewardMoney: 4700, party: [['umbreon', 42], ['vileplume', 42], ['murkrow', 44], ['gengar', 45], ['houndoom', 47]] },
  { name: 'Lance (Johto)', region: 'Johto', trainerClass: 'Champion', trainerType: 'CHAMPION', spriteId: 'lance', rewardMoney: 5000, party: [['gyarados', 44], ['dragonite', 49], ['dragonite', 49], ['aerodactyl', 46], ['charizard', 46], ['dragonite', 50]] },

  // --- HOENN ---
  { name: 'Roxanne', region: 'Hoenn', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'roxanne', rewardMoney: 1500, badgeName: 'Stone Badge', party: [['geodude', 14], ['nosepass', 15]] },
  { name: 'Brawly', region: 'Hoenn', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'brawly', rewardMoney: 1900, badgeName: 'Knuckle Badge', party: [['machop', 17], ['makuhita', 18]] },
  { name: 'Wattson', region: 'Hoenn', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'wattson', rewardMoney: 2300, badgeName: 'Dynamo Badge', party: [['magnemite', 22], ['voltorb', 20], ['magneton', 23]] },
  { name: 'Flannery', region: 'Hoenn', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'flannery', rewardMoney: 2800, badgeName: 'Heat Badge', party: [['slugma', 26], ['slugma', 26], ['torkoal', 28]] },
  { name: 'Norman', region: 'Hoenn', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'norman', rewardMoney: 3100, badgeName: 'Balance Badge', party: [['slaking', 28], ['vigoroth', 30], ['slaking', 31]] },
  { name: 'Winona', region: 'Hoenn', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'winona', rewardMoney: 3300, badgeName: 'Feather Badge', party: [['swellow', 31], ['pelipper', 30], ['skarmory', 32], ['altaria', 33]] },
  { name: 'Tate & Liza', region: 'Hoenn', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'tateliza', rewardMoney: 4200, badgeName: 'Mind Badge', party: [['lunatone', 42], ['solrock', 42]] },
  { name: 'Wallace', region: 'Hoenn', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'wallace', rewardMoney: 4300, badgeName: 'Rain Badge', party: [['luvdisc', 40], ['whiscash', 42], ['sealeo', 40], ['crawdaunt', 42], ['milotic', 43]] },
  { name: 'Sidney', region: 'Hoenn', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'sidney', rewardMoney: 4900, party: [['mightyena', 46], ['shiftry', 48], ['cacturne', 46], ['sharpedo', 48], ['absol', 49]] },
  { name: 'Phoebe', region: 'Hoenn', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'phoebe', rewardMoney: 5100, party: [['dusclops', 48], ['banette', 49], ['sableye', 50], ['banette', 49], ['dusclops', 51]] },
  { name: 'Glacia', region: 'Hoenn', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'glacia', rewardMoney: 5300, party: [['glalie', 50], ['sealeo', 50], ['sealeo', 52], ['glalie', 52], ['walrein', 53]] },
  { name: 'Drake', region: 'Hoenn', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'drake', rewardMoney: 5500, party: [['shelgon', 52], ['altaria', 54], ['flygon', 53], ['flygon', 53], ['salamence', 55]] },
  { name: 'Steven', region: 'Hoenn', trainerClass: 'Champion', trainerType: 'CHAMPION', spriteId: 'steven', rewardMoney: 5800, party: [['skarmory', 57], ['claydol', 55], ['aggron', 56], ['cradily', 56], ['armaldo', 56], ['metagross', 58]] },

  // --- SINNOH ---
  { name: 'Roark', region: 'Sinnoh', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'roark', rewardMoney: 1600, badgeName: 'Coal Badge', party: [['geodude', 12], ['onix', 12], ['cranidos', 14]] },
  { name: 'Gardenia', region: 'Sinnoh', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'gardenia', rewardMoney: 2200, badgeName: 'Forest Badge', party: [['cherubi', 19], ['turtwig', 19], ['roserade', 22]] },
  { name: 'Maylene', region: 'Sinnoh', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'maylene', rewardMoney: 3000, badgeName: 'Cobble Badge', party: [['meditite', 27], ['machoke', 27], ['lucario', 30]] },
  { name: 'Crasher Wake', region: 'Sinnoh', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'crasherwake', rewardMoney: 3000, badgeName: 'Fen Badge', party: [['gyarados', 27], ['quagsire', 27], ['floatzel', 30]] },
  { name: 'Fantina', region: 'Sinnoh', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'fantina', rewardMoney: 3600, badgeName: 'Relic Badge', party: [['drifblim', 32], ['gengar', 34], ['mismagius', 36]] },
  { name: 'Byron', region: 'Sinnoh', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'byron', rewardMoney: 3900, badgeName: 'Mine Badge', party: [['bronzor', 37], ['steelix', 38], ['bastiodon', 39]] },
  { name: 'Candice', region: 'Sinnoh', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'candice', rewardMoney: 4200, badgeName: 'Icicle Badge', party: [['snover', 38], ['sneasel', 38], ['medicham', 40], ['abomasnow', 42]] },
  { name: 'Volkner', region: 'Sinnoh', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'volkner', rewardMoney: 4900, badgeName: 'Beacon Badge', party: [['raichu', 46], ['ambipom', 47], ['octillery', 47], ['luxray', 49]] },
  { name: 'Aaron', region: 'Sinnoh', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'aaron', rewardMoney: 5300, party: [['dustox', 53], ['beautifly', 53], ['vespiquen', 54], ['heracross', 54], ['drapion', 57]] },
  { name: 'Bertha', region: 'Sinnoh', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'bertha', rewardMoney: 5500, party: [['quagsire', 55], ['sudowoodo', 56], ['golem', 56], ['whiscash', 55], ['hippowdon', 59]] },
  { name: 'Flint', region: 'Sinnoh', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'flint', rewardMoney: 5700, party: [['rapidash', 58], ['infernape', 61], ['steelix', 57], ['lopunny', 57], ['drifblim', 58]] },
  { name: 'Lucian', region: 'Sinnoh', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'lucian', rewardMoney: 5900, party: [['mr-mime', 59], ['girafarig', 59], ['medicham', 60], ['alakazam', 60], ['bronzong', 63]] },
  { name: 'Cynthia', region: 'Sinnoh', trainerClass: 'Champion', trainerType: 'CHAMPION', spriteId: 'cynthia', rewardMoney: 6600, party: [['spiritomb', 61], ['roserade', 60], ['gastrodon', 60], ['lucario', 63], ['milotic', 63], ['garchomp', 66]] },

  // --- UNOVA ---
  { name: 'Cilan, Chili, Cress', region: 'Unova', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'cilan', rewardMoney: 1400, badgeName: 'Trio Badge', party: [['lillipup', 12], ['pansage', 14]] },
  { name: 'Lenora', region: 'Unova', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'lenora', rewardMoney: 2000, badgeName: 'Basic Badge', party: [['herdier', 18], ['watchog', 20]] },
  { name: 'Burgh', region: 'Unova', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'burgh', rewardMoney: 2300, badgeName: 'Insect Badge', party: [['whirlipede', 21], ['dwebble', 21], ['leavanny', 23]] },
  { name: 'Elesa', region: 'Unova', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'elesa', rewardMoney: 2700, badgeName: 'Bolt Badge', party: [['emolga', 25], ['emolga', 25], ['zebstrika', 27]] },
  { name: 'Clay', region: 'Unova', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'clay', rewardMoney: 3100, badgeName: 'Quake Badge', party: [['krokorok', 29], ['palpitoad', 29], ['excadrill', 31]] },
  { name: 'Skyla', region: 'Unova', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'skyla', rewardMoney: 3500, badgeName: 'Jet Badge', party: [['swoobat', 33], ['unfezant', 33], ['swanna', 35]] },
  { name: 'Brycen', region: 'Unova', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'brycen', rewardMoney: 3900, badgeName: 'Freeze Badge', party: [['vanillish', 37], ['cryogonal', 37], ['beartic', 39]] },
  { name: 'Drayden', region: 'Unova', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'drayden', rewardMoney: 4300, badgeName: 'Legend Badge', party: [['fraxure', 41], ['druddigon', 41], ['haxorus', 43]] },
  { name: 'Shauntal', region: 'Unova', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'shauntal', rewardMoney: 5000, party: [['cofagrigus', 48], ['jellicent', 48], ['golurk', 48], ['chandelure', 50]] },
  { name: 'Marshal', region: 'Unova', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'marshal', rewardMoney: 5000, party: [['throh', 48], ['sawk', 48], ['conkeldurr', 48], ['mienshao', 50]] },
  { name: 'Grimsley', region: 'Unova', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'grimsley', rewardMoney: 5000, party: [['scrafty', 48], ['krookodile', 48], ['liepard', 48], ['bisharp', 50]] },
  { name: 'Caitlin', region: 'Unova', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'caitlin', rewardMoney: 5000, party: [['reuniclus', 48], ['musharna', 48], ['sigilyph', 48], ['gothitelle', 50]] },
  { name: 'Alder', region: 'Unova', trainerClass: 'Champion', trainerType: 'CHAMPION', spriteId: 'alder', rewardMoney: 7500, party: [['accelgor', 75], ['bouffalant', 75], ['druddigon', 75], ['vanilluxe', 75], ['escavalier', 75], ['volcarona', 77]] },

  // --- KALOS ---
  { name: 'Viola', region: 'Kalos', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'viola', rewardMoney: 1200, badgeName: 'Bug Badge', party: [['surskit', 10], ['vivillon', 12]] },
  { name: 'Grant', region: 'Kalos', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'grant', rewardMoney: 2500, badgeName: 'Cliff Badge', party: [['amaura', 25], ['tyrunt', 25]] },
  { name: 'Korrina', region: 'Kalos', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'korrina', rewardMoney: 3200, badgeName: 'Rumble Badge', party: [['mienfoo', 29], ['machoke', 28], ['hawlucha', 32]] },
  { name: 'Ramos', region: 'Kalos', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'ramos', rewardMoney: 3400, badgeName: 'Plant Badge', party: [['jumpluff', 30], ['gogoat', 34], ['weepinbell', 31]] },
  { name: 'Clemont', region: 'Kalos', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'clemont', rewardMoney: 3700, badgeName: 'Voltage Badge', party: [['emolga', 35], ['magneton', 35], ['heliolisk', 37]] },
  { name: 'Valerie', region: 'Kalos', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'valerie', rewardMoney: 4200, badgeName: 'Fairy Badge', party: [['mawile', 38], ['mr-mime', 39], ['sylveon', 42]] },
  { name: 'Olympia', region: 'Kalos', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'olympia', rewardMoney: 4800, badgeName: 'Psychic Badge', party: [['sigilyph', 44], ['slowking', 45], ['meowstic-female', 48]] },
  { name: 'Wulfric', region: 'Kalos', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'wulfric', rewardMoney: 5900, badgeName: 'Iceberg Badge', party: [['abomasnow', 56], ['cryogonal', 55], ['avalugg', 59]] },
  { name: 'Malva', region: 'Kalos', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'malva', rewardMoney: 6500, party: [['pyroar', 63], ['torkoal', 63], ['chandelure', 63], ['talonflame', 65]] },
  { name: 'Siebold', region: 'Kalos', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'siebold', rewardMoney: 6500, party: [['clawitzer', 63], ['starmie', 63], ['gyarados', 63], ['barbaracle', 65]] },
  { name: 'Wikstrom', region: 'Kalos', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'wikstrom', rewardMoney: 6500, party: [['klefki', 63], ['probopass', 63], ['scizor', 63], ['aegislash', 65]] },
  { name: 'Drasna', region: 'Kalos', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'drasna', rewardMoney: 6500, party: [['dragalge', 63], ['druddigon', 63], ['altaria', 63], ['noivern', 65]] },
  { name: 'Diantha', region: 'Kalos', trainerClass: 'Champion', trainerType: 'CHAMPION', spriteId: 'diantha', rewardMoney: 6800, party: [['hawlucha', 64], ['tyrantrum', 65], ['aurorus', 65], ['gourgeist-average', 65], ['goodra', 66], ['gardevoir', 68]] },

  // --- ALOLA ---
  { name: 'Ilima', region: 'Alola', trainerClass: 'Trial Captain', trainerType: 'GYM', spriteId: 'ilima', rewardMoney: 1100, badgeName: 'Normalium Z', party: [['yungoos', 9], ['smeargle', 10]] },
  { name: 'Lana', region: 'Alola', trainerClass: 'Trial Captain', trainerType: 'GYM', spriteId: 'lana', rewardMoney: 2000, badgeName: 'Waterium Z', party: [['chinchou', 18], ['shellder', 18], ['araquanid', 20]] },
  { name: 'Kiawe', region: 'Alola', trainerClass: 'Trial Captain', trainerType: 'GYM', spriteId: 'kiawe', rewardMoney: 2300, badgeName: 'Firium Z', party: [['growlithe', 21], ['fletchinder', 21], ['marowak-alola', 23]] },
  { name: 'Mallow', region: 'Alola', trainerClass: 'Trial Captain', trainerType: 'GYM', spriteId: 'mallow', rewardMoney: 2500, badgeName: 'Grassium Z', party: [['phantump', 23], ['shiinotic', 23], ['lurantis', 25]] },
  { name: 'Sophocles', region: 'Alola', trainerClass: 'Trial Captain', trainerType: 'GYM', spriteId: 'sophocles', rewardMoney: 3000, badgeName: 'Electrium Z', party: [['togedemaru', 28], ['magnezone', 28], ['vikavolt', 30]] },
  { name: 'Acerola', region: 'Alola', trainerClass: 'Trial Captain', trainerType: 'GYM', spriteId: 'acerola', rewardMoney: 3300, badgeName: 'Ghostium Z', party: [['sableye', 31], ['drifblim', 31], ['dhelmise', 31], ['palossand', 33]] },
  { name: 'Mina', region: 'Alola', trainerClass: 'Trial Captain', trainerType: 'GYM', spriteId: 'mina', rewardMoney: 5000, badgeName: 'Fairium Z', party: [['klefki', 50], ['granbull', 50], ['shiinotic', 50], ['ribombee', 52]] },
  { name: 'Hapu', region: 'Alola', trainerClass: 'Island Kahuna', trainerType: 'GYM', spriteId: 'hapu', rewardMoney: 5400, badgeName: 'Groundium Z', party: [['dugtrio-alola', 53], ['gastrodon', 53], ['flygon', 53], ['mudsdale', 54]] },
  { name: 'Hala', region: 'Alola', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'hala', rewardMoney: 5500, party: [['hariyama', 54], ['primeape', 54], ['bewear', 54], ['poliwrath', 54], ['crabominable', 55]] },
  { name: 'Olivia', region: 'Alola', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'olivia', rewardMoney: 5500, party: [['relicanth', 54], ['carbink', 54], ['golem-alola', 54], ['probopass', 54], ['lycanroc', 55]] },
  { name: 'Acerola (Elite)', region: 'Alola', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'acerola', rewardMoney: 5500, party: [['sableye', 54], ['drifblim', 54], ['dhelmise', 54], ['froslass', 54], ['palossand', 55]] },
  { name: 'Kahili', region: 'Alola', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'kahili', rewardMoney: 5500, party: [['skarmory', 54], ['crobat', 54], ['oricorio-baile', 54], ['mandibuzz', 54], ['toucannon', 55]] },
  { name: 'Kukui', region: 'Alola', trainerClass: 'Champion', trainerType: 'CHAMPION', spriteId: 'kukui', rewardMoney: 5800, party: [['lycanroc-midday', 57], ['ninetales-alola', 56], ['braviary', 56], ['magnezone', 56], ['snorlax', 56], ['incineroar', 58]] },

  // --- GALAR ---
  { name: 'Milo', region: 'Galar', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'milo', rewardMoney: 3200, badgeName: 'Grass Badge', party: [['gossifleur', 19], ['eldegoss', 20]] },
  { name: 'Nessa', region: 'Galar', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'nessa', rewardMoney: 3800, badgeName: 'Water Badge', party: [['goldeen', 22], ['arrokuda', 23], ['drednaw', 24]] },
  { name: 'Kabu', region: 'Galar', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'kabu', rewardMoney: 4300, badgeName: 'Fire Badge', party: [['ninetales', 25], ['arcanine', 25], ['centiskorch', 27]] },
  { name: 'Bea', region: 'Galar', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'bea', rewardMoney: 5700, badgeName: 'Fighting Badge', party: [['hitmontop', 34], ['pangoro', 34], ['sirfetchd', 35], ['machamp', 36]] },
  { name: 'Opal', region: 'Galar', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'opal', rewardMoney: 6000, badgeName: 'Fairy Badge', party: [['weezing-galar', 36], ['mawile', 36], ['togekiss', 37], ['alcremie', 38]] },
  { name: 'Gordie', region: 'Galar', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'gordie', rewardMoney: 6700, badgeName: 'Rock Badge', party: [['barbaracle', 40], ['shuckle', 40], ['stonjourner', 41], ['coalossal', 42]] },
  { name: 'Piers', region: 'Galar', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'piers', rewardMoney: 7300, badgeName: 'Dark Badge', party: [['scrafty', 44], ['malamar', 45], ['skuntank', 45], ['obstagoon', 46]] },
  { name: 'Raihan', region: 'Galar', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'raihan', rewardMoney: 7600, badgeName: 'Dragon Badge', party: [['gigalith', 46], ['flygon', 47], ['sandaconda', 46], ['duraludon', 48]] },
  { name: 'Marnie', region: 'Galar', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'marnie', rewardMoney: 9400, party: [['liepard', 47], ['toxicroak', 47], ['scrafty', 47], ['morpeko', 48], ['grimmsnarl', 49]] },
  { name: 'Bede', region: 'Galar', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'bede', rewardMoney: 9400, party: [['mawile', 51], ['gardevoir', 51], ['rapidash-galar', 52], ['hatterene', 53]] },
  { name: 'Hop', region: 'Galar', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'hop', rewardMoney: 9400, party: [['dubwool', 59], ['snorlax', 58], ['corviknight', 59], ['pincurchin', 58], ['cinderace', 60]] },
  { name: 'Leon', region: 'Galar', trainerClass: 'Champion', trainerType: 'CHAMPION', spriteId: 'leon', rewardMoney: 10000, party: [['aegislash', 62], ['dragapult', 62], ['haxorus', 63], ['seismitoad', 64], ['cinderace', 64], ['charizard', 65]] },

  // --- PALDEA ---
  { name: 'Katy', region: 'Paldea', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'katy', rewardMoney: 2700, badgeName: 'Bug Badge', party: [['nymble', 14], ['tarountula', 14], ['teddiursa', 15]] },
  { name: 'Brassius', region: 'Paldea', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'brassius', rewardMoney: 3000, badgeName: 'Grass Badge', party: [['petilil', 16], ['smoliv', 16], ['sudowoodo', 17]] },
  { name: 'Iono', region: 'Paldea', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'iono', rewardMoney: 4300, badgeName: 'Electric Badge', party: [['wattrel', 23], ['bellibolt', 23], ['luxio', 23], ['mismagius', 24]] },
  { name: 'Kofu', region: 'Paldea', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'kofu', rewardMoney: 5400, badgeName: 'Water Badge', party: [['veluza', 29], ['wugtrio', 29], ['crabominable', 30]] },
  { name: 'Larry', region: 'Paldea', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'larry', rewardMoney: 6400, badgeName: 'Normal Badge', party: [['komala', 35], ['dudunsparce', 35], ['staraptor', 36]] },
  { name: 'Ryme', region: 'Paldea', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'ryme', rewardMoney: 7500, badgeName: 'Ghost Badge', party: [['banette', 41], ['mimikyu', 41], ['houndstone', 41], ['toxtricity', 42]] },
  { name: 'Tulip', region: 'Paldea', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'tulip', rewardMoney: 8100, badgeName: 'Psychic Badge', party: [['farigiraf', 44], ['espathra', 44], ['gallade', 44], ['florges', 45]] },
  { name: 'Grusha', region: 'Paldea', trainerClass: 'Gym Leader', trainerType: 'GYM', spriteId: 'grusha', rewardMoney: 8600, badgeName: 'Ice Badge', party: [['frosmoth', 47], ['beartic', 47], ['cetitan', 47], ['altaria', 48]] },
  { name: 'Rika', region: 'Paldea', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'rika', rewardMoney: 9800, party: [['whiscash', 57], ['camerupt', 57], ['donphan', 57], ['dugtrio', 57], ['clodsire', 58]] },
  { name: 'Poppy', region: 'Paldea', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'poppy', rewardMoney: 9900, party: [['copperajah', 58], ['magnezone', 58], ['bronzong', 58], ['corviknight', 58], ['tinkaton', 59]] },
  { name: 'Larry (Elite)', region: 'Paldea', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'larry', rewardMoney: 10000, party: [['tropius', 59], ['oricorio-pom-pom', 59], ['altaria', 59], ['staraptor', 59], ['flamigo', 60]] },
  { name: 'Hassel', region: 'Paldea', trainerClass: 'Elite Four', trainerType: 'ELITE', spriteId: 'hassel', rewardMoney: 10100, party: [['noivern', 60], ['haxorus', 60], ['dragalge', 60], ['flapple', 60], ['baxcalibur', 61]] },
  { name: 'Geeta', region: 'Paldea', trainerClass: 'Champion', trainerType: 'CHAMPION', spriteId: 'geeta', rewardMoney: 11000, party: [['espathra', 61], ['gogoat', 61], ['veluza', 61], ['avalugg', 61], ['kingambit', 61], ['glimmora', 62]] },
];
