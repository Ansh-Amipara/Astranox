import { PrismaClient, TrainerRank } from '@prisma/client';

export async function seedMythicals(prisma: PrismaClient) {
  console.log('Seeding Mythical Trainers...');

  const zodaicCouncil = [
    { title: 'Flame Warden (Aries)', ace: 'Victini', team: ['Salamence', 'Arcanine', 'Ceruledge', 'Blaziken', 'Armarouge'] },
    { title: 'Earth Guardian (Taurus)', ace: 'Terrakion', team: ['Tyranitar', 'Rhyperior', 'Copperajah', 'Ursaluna', 'Aggron'] },
    { title: 'Twin Oracle (Gemini)', ace: 'Latios', team: ['Latias', 'Gardevoir', 'Gallade', 'Metagross', 'Zoroark'] }, // Note: Users requested Latios & Latias as signature, we'll make Latios Ace, Latias part of team
    { title: 'Moon Keeper (Cancer)', ace: 'Cresselia', team: ['Milotic', 'Primarina', 'Lapras', 'Kingdra', 'Goodra'] },
    { title: 'Solar King (Leo)', ace: 'Solgaleo', team: ['Pyroar', 'Incineroar', 'Dragonite', 'Luxray', 'Volcarona'] },
    { title: 'Nature Sage (Virgo)', ace: 'Shaymin', team: ['Roserade', 'Serperior', 'Lilligant', 'Florges', 'Goodra'] },
    { title: 'Balance Judge (Libra)', ace: 'Xerneas', team: ['Gardevoir', 'Metagross', 'Lucario', 'Gallade', 'Togekiss'] },
    { title: 'Venom Lord (Scorpio)', ace: 'Nihilego', team: ['Drapion', 'Gliscor', 'Hydreigon', 'Toxtricity', 'Gengar'] },
    { title: 'Sky Archer (Sagittarius)', ace: 'Virizion', team: ['Decidueye', 'Noivern', 'Dragonite', 'Talonflame', 'Sceptile'] },
    { title: 'Mountain King (Capricorn)', ace: 'Regirock', team: ['Tyranitar', 'Baxcalibur', 'Aurorus', 'Aggron', 'Garchomp'] },
    { title: 'Tide Seer (Aquarius)', ace: 'Manaphy', team: ['Milotic', 'Greninja', 'Gyarados', 'Kingdra', 'Primarina'] },
    { title: 'Dream Weaver (Pisces)', ace: 'Lugia', team: ['Milotic', 'Gardevoir', 'Dragonite', 'Lapras', 'Ninetales'] } // Assuming Alolan Ninetales is mapped to Ninetales or ninetales-alola, we use ninetales for safety
  ];

  const nineThrones = [
    { title: 'Throne of Creation', ace: 'Arceus', team: ['Mew', 'Dragonite', 'Metagross', 'Garchomp', 'Hydreigon'] },
    { title: 'Throne of Time', ace: 'Dialga', team: ['Celebi', 'Metagross', 'Salamence', 'Dragapult', 'Lucario'] },
    { title: 'Throne of Space', ace: 'Palkia', team: ['Deoxys', 'Garchomp', 'Goodra', 'Dragonite', 'Hydreigon'] },
    { title: 'Throne of Order', ace: 'Zygarde', team: ['Regigigas', 'Metagross', 'Corviknight', 'Aggron', 'Gallade'] },
    { title: 'Throne of Chaos', ace: 'Giratina', team: ['Darkrai', 'Hydreigon', 'Chandelure', 'Tyranitar', 'Dragapult'] },
    { title: 'Throne of Life', ace: 'Xerneas', team: ['Shaymin', 'Celebi', 'Goodra', 'Florges', 'Roserade'] },
    { title: 'Throne of Death', ace: 'Yveltal', team: ['Darkrai', 'Gengar', 'Hydreigon', 'Chandelure', 'Spiritomb'] },
    { title: 'Throne of Dreams', ace: 'Lunala', team: ['Cresselia', 'Darkrai', 'Gardevoir', 'Hatterene', 'Dragapult'] },
    { title: 'Throne of Eternity', ace: 'Eternatus', team: ['Rayquaza', 'Necrozma', 'Deoxys', 'Metagross', 'Salamence'] }
  ];

  const allMythicals = [
    ...zodaicCouncil.map(t => ({ ...t, group: 'Zodiac Council' })),
    ...nineThrones.map(t => ({ ...t, group: 'Nine Thrones' }))
  ];

  for (const trainerData of allMythicals) {
    // Delete if exists
    const existing = await prisma.npcTrainer.findFirst({
      where: { name: trainerData.title, trainerClass: trainerData.group }
    });
    if (existing) {
      await prisma.npcTrainerPokemon.deleteMany({ where: { npcTrainerId: existing.id } });
      await prisma.npcTrainer.delete({ where: { id: existing.id } });
    }

    const trainer = await prisma.npcTrainer.create({
      data: {
        name: trainerData.title,
        trainerClass: trainerData.group,
        trainerType: 'LEGENDARY',
        rewardMoney: 100000,
        spriteUrl: `/sprites/trainers/${trainerData.group.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`
      }
    });

    const fullTeam = [...trainerData.team, trainerData.ace];

    for (let i = 0; i < fullTeam.length; i++) {
      const speciesName = fullTeam[i].toLowerCase().replace(/[^a-z0-9]/g, '');
      const species = await prisma.species.findFirst({
        where: { name: { equals: speciesName, mode: 'insensitive' } }
      });

      if (!species) {
        console.warn(`  ⚠️ Species not found: ${fullTeam[i]} (normalized: ${speciesName})`);
        continue;
      }

      const isAce = i === 5;
      const level = isAce ? 200 : 195 + i; // 195, 196, 197, 198, 199, 200

      // All Mythicals have 31 in every stat
      await prisma.npcTrainerPokemon.create({
        data: {
          npcTrainerId: trainer.id,
          speciesId: species.id,
          level,
          position: i + 1,
          ivHp: 31,
          ivAttack: 31,
          ivDefense: 31,
          ivSpAtk: 31,
          ivSpDef: 31,
          ivSpeed: 31
        }
      });
    }

    console.log(`  ✅ Inserted Mythical: ${trainerData.title}`);
  }

  console.log('Finished seeding Mythical Trainers!');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedMythicals(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
