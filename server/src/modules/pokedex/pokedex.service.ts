import { injectable } from 'tsyringe';
import { prisma } from '../../core/db/prisma';
import { CacheService } from '../../core/services/cache.service';

@injectable()
export class PokedexService {
  constructor(private cache: CacheService) { }

  async getAllSpecies(page: number, limit: number, type?: string, category?: string, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

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

    const cacheKey = `pokedex:all:${page}:${limit}:${type || 'none'}:${category || 'none'}:${search || 'none'}`;

    return this.cache.getOrSet(cacheKey, async () => {
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
    }, 86400); // cache for 24 hours
  }

  async getSpeciesById(id: number) {
    const cacheKey = `pokedex:species:${id}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const species = await prisma.species.findUnique({
        where: { id },
        include: {
          type1: true,
          type2: true,
          evolvesTo: true,
          evolvesFrom: true,
          learnsets: { include: { move: true } },
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

        // Inherit G-Max learnset from base
        if (species.isGmax && species.baseSpeciesId && (!species.learnsets || species.learnsets.length === 0)) {
          const baseSpecies = await prisma.species.findUnique({
            where: { id: species.baseSpeciesId },
            include: { learnsets: { include: { move: true } } },
          });
          if (baseSpecies && baseSpecies.learnsets) {
            species.learnsets = baseSpecies.learnsets;
          }
        }
      }

      return species;
    }, 86400); // cache for 24 hours
  }
}
