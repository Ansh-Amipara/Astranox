import { PrismaClient } from '@prisma/client';
import { prisma } from '../core/db/prisma';
import { logger } from '../config/logger';
import { Migration } from './types';
import { migration0001 } from './0001_initial_data_version';

export class MigrationRunner {
  private migrations: Migration[] = [
    migration0001,
  ];

  constructor(private client: PrismaClient = prisma) {}

  public registerMigration(migration: Migration): void {
    if (this.migrations.some((m) => m.id === migration.id)) {
      throw new Error(`Migration with ID '${migration.id}' is already registered.`);
    }
    this.migrations.push(migration);
  }

  public async getAppliedMigrationNames(): Promise<Set<string>> {
    const runs = await this.client.migrationRun.findMany({
      select: { name: true },
    });
    return new Set(runs.map((r) => r.name));
  }

  public async runMigrations(): Promise<{ applied: string[]; skipped: string[] }> {
    const appliedSet = await this.getAppliedMigrationNames();
    const applied: string[] = [];
    const skipped: string[] = [];

    // Determine current batch number
    const lastRun = await this.client.migrationRun.findFirst({
      orderBy: { batch: 'desc' },
      select: { batch: true },
    });
    const nextBatch = (lastRun?.batch ?? 0) + 1;

    for (const migration of this.migrations) {
      if (appliedSet.has(migration.id)) {
        skipped.push(migration.id);
        continue;
      }

      logger.info(`[MigrationRunner] Executing migration '${migration.id}' (${migration.description})...`);

      try {
        await migration.up({
          prisma: this.client,
          logger,
        });

        await this.client.migrationRun.create({
          data: {
            name: migration.id,
            batch: nextBatch,
          },
        });

        applied.push(migration.id);
        logger.info(`[MigrationRunner] Successfully applied migration '${migration.id}'.`);
      } catch (err) {
        logger.error({ err }, `[MigrationRunner] Migration '${migration.id}' failed! Aborting.`);
        throw err;
      }
    }

    return { applied, skipped };
  }
}
