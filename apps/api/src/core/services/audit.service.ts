import { injectable, singleton } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { logger } from '../../config/logger';

export type AuditActorType = 'user' | 'system' | 'admin';

export interface CreateAuditEntryInput {
  actorId?: string | null;
  actorType?: AuditActorType;
  action: string;
  entityType: string;
  entityId?: string | null;
  reason?: string | null;
  before?: unknown;
  after?: unknown;
  meta?: unknown;
  requestId?: string | null;
  ip?: string | null;
}

@singleton()
@injectable()
export class AuditService {
  /**
   * Records an immutable, append-only audit log entry.
   * If a Prisma transaction client `tx` is provided, writes within that transaction.
   */
  public async log(entry: CreateAuditEntryInput, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;

    const data: Prisma.AuditLogCreateInput = {
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      actorId: entry.actorId ?? null,
      actorType: entry.actorType ?? 'user',
      reason: entry.reason ?? null,
      before: (entry.before as Prisma.InputJsonValue) ?? undefined,
      after: (entry.after as Prisma.InputJsonValue) ?? undefined,
      meta: (entry.meta as Prisma.InputJsonValue) ?? undefined,
      requestId: entry.requestId ?? null,
      ip: entry.ip ?? null,

      // Backward compatibility fields for legacy admin queries
      adminId: entry.actorId ?? undefined,
      beforeValues: (entry.before as Prisma.InputJsonValue) ?? undefined,
      afterValues: (entry.after as Prisma.InputJsonValue) ?? undefined,
      ipAddress: entry.ip ?? null,
    };

    try {
      await client.auditLog.create({ data });
    } catch (err: unknown) {
      // Never crash the primary flow if an audit log write outside a transaction fails, but log heavily
      logger.error({ err, entry }, '[AuditService] Failed to persist audit log entry');
      if (tx) {
        // In a transaction, rethrow to ensure transactional atomicity
        throw err;
      }
    }
  }

  /**
   * Helper for recording authentication attempts.
   */
  public async logAuthAttempt(params: {
    action: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE';
    actorId?: string | null;
    actorType?: AuditActorType;
    ip?: string | null;
    requestId?: string | null;
    reason?: string | null;
    meta?: Record<string, unknown>;
  }): Promise<void> {
    await this.log({
      action: params.action,
      entityType: 'AUTH',
      entityId: params.actorId ?? null,
      actorId: params.actorId ?? null,
      actorType: params.actorType ?? 'user',
      ip: params.ip ?? null,
      requestId: params.requestId ?? null,
      reason: params.reason ?? null,
      meta: params.meta,
    });
  }
}
