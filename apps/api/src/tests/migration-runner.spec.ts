import './setup';
import { describe, it, expect, beforeEach } from 'vitest';
import { MigrationRunner } from '../migrations/runner';
import { migrateOnRead } from '../migrations/migrate-on-read';
import { prismaTest } from './setup';
import { CURRENT_DATA_VERSION } from '@astranox/constants';

describe('Data Migration Runner & Migrate-On-Read', { timeout: 30000 }, () => {
  beforeEach(async () => {
    await prismaTest.migrationRun.deleteMany().catch(() => {});
  });

  it('runs registered migrations and records them in MigrationRun', async () => {
    const runner = new MigrationRunner(prismaTest as any);

    const firstRun = await runner.runMigrations();
    expect(firstRun.applied).toContain('0001_initial_data_version');
    expect(firstRun.applied).toContain('0002_normalize_pokemon_level_and_xp');
    expect(firstRun.skipped).toHaveLength(0);

    const recorded = await prismaTest.migrationRun.findMany({
      where: { name: '0001_initial_data_version' },
    });
    expect(recorded).toHaveLength(1);
    expect(recorded[0].batch).toBe(1);

    // Second run should be idempotent and skip already-applied migration
    const secondRun = await runner.runMigrations();
    expect(secondRun.applied).toHaveLength(0);
    expect(secondRun.skipped).toContain('0001_initial_data_version');
    expect(secondRun.skipped).toContain('0002_normalize_pokemon_level_and_xp');
  });

  it('executes custom migrations in sequential order with incrementing batches', async () => {
    const runner = new MigrationRunner(prismaTest as any);
    await runner.runMigrations(); // batch 1

    let customMigrationExecuted = false;
    runner.registerMigration({
      id: '0003_test_custom_noop',
      description: 'Test no-op custom migration',
      up: async () => {
        customMigrationExecuted = true;
      },
    });

    const runResult = await runner.runMigrations();
    expect(customMigrationExecuted).toBe(true);
    expect(runResult.applied).toContain('0003_test_custom_noop');
    expect(runResult.skipped).toContain('0001_initial_data_version');
    expect(runResult.skipped).toContain('0002_normalize_pokemon_level_and_xp');

    const recorded2 = await prismaTest.migrationRun.findUnique({
      where: { name: '0003_test_custom_noop' },
    });
    expect(recorded2?.batch).toBe(2);
  });

  it('migrateOnRead upgrades older documents in-memory and returns correct target dataVersion', () => {
    const legacyPokemon = {
      id: 'mock-poke-123',
      speciesId: 25,
      dataVersion: 0,
    };

    const migrated = migrateOnRead('OWNED_POKEMON', legacyPokemon);
    expect(migrated.dataVersion).toBe(CURRENT_DATA_VERSION.OWNED_POKEMON);

    const upToDatePokemon = {
      id: 'mock-poke-456',
      speciesId: 25,
      dataVersion: CURRENT_DATA_VERSION.OWNED_POKEMON,
    };
    const notModified = migrateOnRead('OWNED_POKEMON', upToDatePokemon);
    expect(notModified.dataVersion).toBe(CURRENT_DATA_VERSION.OWNED_POKEMON);
  });
});
