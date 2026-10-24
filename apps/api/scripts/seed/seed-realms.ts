import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import {
  CANON_REALMS,
  REALM_RANK_SPAWN_WEIGHTS,
  APEX_GUARDIAN_WEIGHT,
} from '@astranox/constants';
import { RealmSpawnEntry } from '@astranox/types';

const prisma = new PrismaClient();

const ALL_18_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export async function seedRealms() {
  console.log('--- Starting Wilderness Realms Seed Pipeline ---');

  // 1. Fetch all species from database
  const allSpecies = await prisma.species.findMany({
    include: {
      type1: true,
      type2: true,
    },
    orderBy: { id: 'asc' },
  });

  if (allSpecies.length === 0) {
    throw new Error('No species found in database! Please seed Astranox-data species first.');
  }

  console.log(`Loaded ${allSpecies.length} total species from database.`);

  // 2. Validate all 18 types are covered across CANON_REALMS
  const coveredTypes = new Set<string>();
  for (const realm of CANON_REALMS) {
    for (const t of realm.types) {
      coveredTypes.add(t.toLowerCase());
    }
  }

  for (const expectedType of ALL_18_TYPES) {
    if (!coveredTypes.has(expectedType)) {
      throw new Error(`Coverage failure: Type '${expectedType}' is not covered by any Realm!`);
    }
  }
  console.log(`Verified 100% type coverage: All 18 elemental types are assigned to Realms.`);

  // 3. Track reachable species
  const reachableSpeciesIds = new Set<number>();
  const realmSummaries: Array<{ name: string; types: string[]; count: number }> = [];

  // 4. Build and seed each Realm
  for (const def of CANON_REALMS) {
    const realmTypes = new Set(def.types.map((t) => t.toLowerCase()));

    // Filter species having type1 or type2 in this Realm's types
    const matchingSpecies = allSpecies.filter((s) => {
      const t1 = s.type1?.name?.toLowerCase();
      const t2 = s.type2?.name?.toLowerCase();
      return (t1 && realmTypes.has(t1)) || (t2 && realmTypes.has(t2));
    });

    const spawns: RealmSpawnEntry[] = matchingSpecies.map((s) => {
      reachableSpeciesIds.add(s.id);

      const isApex = Boolean(s.isMega || s.isGmax);
      const baseWeight = isApex
        ? APEX_GUARDIAN_WEIGHT
        : (REALM_RANK_SPAWN_WEIGHTS[s.rank] ?? 100);

      const speciesTypes = [s.type1.name.toLowerCase()];
      if (s.type2?.name) {
        speciesTypes.push(s.type2.name.toLowerCase());
      }

      return {
        speciesId: s.id,
        speciesName: s.name,
        types: speciesTypes,
        rank: s.rank,
        weight: baseWeight,
        minLevel: def.spawnLevelMin,
        maxLevel: def.spawnLevelMax,
        isApex,
      };
    });

    await prisma.realm.upsert({
      where: { realmId: def.realmId },
      create: {
        realmId: def.realmId,
        name: def.name,
        description: def.description,
        themeKey: def.themeKey,
        types: def.types.map((t) => t.toLowerCase()),
        spawnLevelMin: def.spawnLevelMin,
        spawnLevelMax: def.spawnLevelMax,
        spawns: spawns as any,
        enabled: true,
        sortOrder: def.sortOrder,
        dataVersion: 1,
      },
      update: {
        name: def.name,
        description: def.description,
        themeKey: def.themeKey,
        types: def.types.map((t) => t.toLowerCase()),
        spawnLevelMin: def.spawnLevelMin,
        spawnLevelMax: def.spawnLevelMax,
        spawns: spawns as any,
        enabled: true,
        sortOrder: def.sortOrder,
      },
    });

    realmSummaries.push({
      name: def.name,
      types: def.types,
      count: spawns.length,
    });
  }

  // 5. Hard Coverage Verification: Zero unreachable species
  const unreachable = allSpecies.filter((s) => !reachableSpeciesIds.has(s.id));
  if (unreachable.length > 0) {
    const list = unreachable.map((u) => `${u.id}:${u.name} (${u.type1?.name}/${u.type2?.name})`).join(', ');
    throw new Error(`Coverage failure: ${unreachable.length} species are unreachable! Species: ${list}`);
  }

  console.log('\n--- Realm Seed Summary ---');
  for (const s of realmSummaries) {
    console.log(`• ${s.name} [${s.types.join(', ')}]: ${s.count} species`);
  }
  console.log(`\nReachable Species: ${reachableSpeciesIds.size} / ${allSpecies.length}`);
  console.log('Unreachable Species: 0 (100% species reachable)');
  console.log('--- Wilderness Realms Seed Completed Successfully ---\n');
}

if (require.main === module) {
  seedRealms()
    .catch((err) => {
      console.error('Fatal error during seedRealms:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
