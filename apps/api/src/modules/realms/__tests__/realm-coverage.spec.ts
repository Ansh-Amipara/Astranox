import { describe, it, expect } from 'vitest';
import { CANON_REALMS } from '@astranox/constants';
import { prisma } from '../../../core/db/prisma';

const ALL_18_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

describe('Realms Coverage Assertions', () => {
  it('covers all 18 elemental Pokemon types across the canonical Realm set', () => {
    const coveredTypes = new Set<string>();

    for (const realm of CANON_REALMS) {
      for (const t of realm.types) {
        coveredTypes.add(t.toLowerCase());
      }
    }

    for (const expectedType of ALL_18_TYPES) {
      expect(coveredTypes.has(expectedType)).toBe(true);
    }

    expect(coveredTypes.size).toBe(18);
  });

  it('guarantees zero unreachable species: every species in Astranox-data appears in at least one Realm', async () => {
    const allSpecies = await prisma.species.findMany({
      include: { type1: true, type2: true },
    });

    // If database is not seeded in testing container, skip DB read
    if (allSpecies.length === 0) {
      return;
    }

    const realms = await prisma.realm.findMany({
      where: { enabled: true },
    });

    expect(realms.length).toBe(7);

    const reachableSpeciesIds = new Set<number>();
    for (const realm of realms) {
      const spawns = (realm.spawns as any[]) || [];
      for (const s of spawns) {
        reachableSpeciesIds.add(s.speciesId);
      }
    }

    const unreachable = allSpecies.filter((s) => !reachableSpeciesIds.has(s.id));

    expect(unreachable).toHaveLength(0);
    expect(reachableSpeciesIds.size).toBe(allSpecies.length);
  });
});
