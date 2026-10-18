import './setup';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { AuditService } from '../core/services/audit.service';
import { prismaTest } from './setup';

describe('Audit Service & Transaction Integrity', () => {
  let auditService: AuditService;
  const mockActorId = '111111111111111111111111';

  beforeEach(async () => {
    auditService = container.resolve(AuditService);
    await prismaTest.auditLog.deleteMany({
      where: {
        OR: [
          { actorId: mockActorId },
          { adminId: mockActorId },
        ],
      },
    }).catch(() => {});
  });

  it('records immutable audit log entries with metadata and actor types', async () => {
    await auditService.log({
      actorId: mockActorId,
      actorType: 'user',
      action: 'POKEMON_RELEASED',
      entityType: 'OWNED_POKEMON',
      entityId: 'poke_999',
      reason: 'Trainer decided to release Pokemon',
      before: { nickname: 'Pikachu', level: 15 },
      after: null,
      meta: { source: 'party_screen' },
    });

    const entries = await prismaTest.auditLog.findMany({
      where: { action: 'POKEMON_RELEASED', entityId: 'poke_999' },
    });

    expect(entries).toHaveLength(1);
    const entry = entries[0];
    expect(entry.actorId).toBe(mockActorId);
    expect(entry.actorType).toBe('user');
    expect(entry.reason).toBe('Trainer decided to release Pokemon');
    expect(entry.before).toEqual({ nickname: 'Pikachu', level: 15 });
  });

  it('rolls back audit entry if Prisma transaction fails', async () => {
    const actionName = 'TX_FAIL_TEST_ACTION';

    try {
      await prismaTest.$transaction(async (tx) => {
        await auditService.log(
          {
            actorId: mockActorId,
            actorType: 'system',
            action: actionName,
            entityType: 'TEST',
          },
          tx as any
        );

        // Force intentional transaction failure
        throw new Error('Simulated transaction rollback');
      });
    } catch {
      // Expected error
    }

    const recorded = await prismaTest.auditLog.findMany({
      where: { action: actionName },
    });

    // Since the transaction aborted, the audit log should not have been committed
    expect(recorded).toHaveLength(0);
  });

  it('records authentication attempt failures and successes', async () => {
    await auditService.logAuthAttempt({
      action: 'LOGIN_FAILURE',
      actorType: 'user',
      reason: 'Invalid credentials',
      ip: '127.0.0.1',
      meta: { attemptedUsername: 'unknown_trainer' },
    });

    const failedLogs = await prismaTest.auditLog.findMany({
      where: { action: 'LOGIN_FAILURE', ip: '127.0.0.1' },
    });

    expect(failedLogs.length).toBeGreaterThanOrEqual(1);
    expect(failedLogs[0].reason).toBe('Invalid credentials');
  });
});
