import { PrismaClient } from '@prisma/client';

export interface MigrationContext {
  prisma: PrismaClient;
  logger: {
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };
}

export interface Migration {
  id: string; // e.g. "0001_initial_data_version"
  description: string;
  up: (ctx: MigrationContext) => Promise<void>;
  down?: (ctx: MigrationContext) => Promise<void>;
}
