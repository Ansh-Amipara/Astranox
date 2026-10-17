import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { MigrationRunner } from './runner';
import { prisma } from '../core/db/prisma';
import { logger } from '../config/logger';

async function main() {
  logger.info('[MigrateCLI] Starting database dataVersion migration runner...');
  const runner = new MigrationRunner(prisma);

  try {
    const result = await runner.runMigrations();
    logger.info(
      `[MigrateCLI] Completed! Applied: ${result.applied.length} (${result.applied.join(', ') || 'none'}), Skipped: ${result.skipped.length}`
    );
    process.exit(0);
  } catch (error) {
    logger.error({ error }, '[MigrateCLI] Migration runner encountered a fatal error.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
