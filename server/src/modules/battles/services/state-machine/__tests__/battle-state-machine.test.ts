import { describe, it, expect, vi } from 'vitest';
import { BattleStateMachine } from '../battle-state-machine';
import { BattleStatus } from '@prisma/client';
import { ValidationError } from '../../../../../common/errors/AppError';

describe('BattleStateMachine', () => {
  it('should initialize with predefined states', () => {
    const machine = new BattleStateMachine();
    expect(machine['states'][BattleStatus.ACTIVE]).toBeDefined();
    expect(machine['states'][BattleStatus.WAITING_SWITCH]).toBeDefined();
    expect(machine['states'][BattleStatus.WAITING_MOVE_LEARN]).toBeDefined();
  });

  it('should route processAction to the correct state handler', async () => {
    const machine = new BattleStateMachine();
    
    // Mock the handleAction method of the ActiveState
    const handleActionMock = vi.fn().mockResolvedValue('success');
    machine['states'][BattleStatus.ACTIVE].handleAction = handleActionMock;

    const mockSession = { status: BattleStatus.ACTIVE } as any;
    const mockTrainerSave = {} as any;
    const mockTx = {} as any;
    const mockServices = {} as any;

    const result = await machine.processAction('attack', mockSession, mockTrainerSave, mockTx, mockServices);
    
    expect(handleActionMock).toHaveBeenCalledWith('attack', mockSession, mockTrainerSave, mockTx, mockServices);
    expect(result).toBe('success');
  });

  it('should throw ValidationError if current state is unsupported', async () => {
    const machine = new BattleStateMachine();
    
    const mockSession = { status: BattleStatus.WON } as any;

    await expect(
      machine.processAction('attack', mockSession, {} as any, {} as any, {} as any)
    ).rejects.toThrow(ValidationError);
  });
});
