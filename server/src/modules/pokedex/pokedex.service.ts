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

    if (category === 'mega') {
      where.name = { contains: '-mega' };
    } else if (category === 'gmax') {
      where.name = { contains: '-gmax' };
    } else if (category === 'regular') {
      where.NOT = [
        { name: { contains: '-mega' } },
        { name: { contains: '-gmax' } },
      ];
    }

    const [species, total] = await Promise.all([
      prisma.species.findMany({
        skip,
        take: limit,
        where,
        orderBy: { id: 'asc' },
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
    return prisma.species.findUnique({
      where: { id },
      include: {
        type1: true,
        type2: true,
        evolvesTo: true,
        evolvesFrom: true,
      },
    });
  }
}

export const pokedexService = new PokedexService();
