import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PokedexService {
  async getAllSpecies(page: number, limit: number, type?: string, category?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) {
      where.OR = [
        { type1: { name: type } },
        { type2: { name: type } }
      ];
    }

    if (category && category !== 'all') {
      if (category === 'mega') {
        where.isMega = true;
      } else if (category === 'gmax') {
        where.isGmax = true;
      } else {
        where.category = category;
      }
    }

    const [species, total] = await Promise.all([
      prisma.species.findMany({
        skip,
        take: limit,
        where,
        orderBy: [
          { pokedexNumber: 'asc' },
          { id: 'asc' }
        ],
        include: {
          type1: true,
          type2: true,
        },
      }),
      prisma.species.count({ where }),
    ]);

    return {
      species,
      total,
      page,
      limit,
    };
  }

  async getSpeciesById(id: number) {
    const species = await prisma.species.findUnique({
      where: { id },
      include: {
        type1: true,
        type2: true,
        evolvesTo: true,
        evolvesFrom: true,
      },
    });
    
    if (species) {
      const [megas, gmaxes] = await Promise.all([
        prisma.species.findMany({
          where: { baseSpeciesId: id, isMega: true },
          include: { type1: true, type2: true }
        }),
        prisma.species.findMany({
          where: { baseSpeciesId: id, isGmax: true },
          include: { type1: true, type2: true }
        })
      ]);
      (species as any).megas = megas;
      (species as any).gmaxes = gmaxes;
    }
    
    return species;
  }
}

export const pokedexService = new PokedexService();
