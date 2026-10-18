import './setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  socketAuthMiddleware,
  handleSocketConnection,
  verifySocketOwnership,
  userSockets,
} from '../socket';
import { generateAccessToken } from '../core/utils/jwt';
import type { UserPayload } from '@astranox/types';

describe('Socket.io Authentication, Policy & Ownership', () => {
  const mockUser: UserPayload = {
    id: '65e9f1a2b3c4d5e6f7a8b9c0',
    username: 'testTrainer',
    email: 'test@trainer.com',
    role: 'USER',
  };

  beforeEach(() => {
    userSockets.clear();
  });

  it('rejects connection when no cookie or authorization header is provided', () => {
    const mockSocket: any = {
      handshake: {
        headers: {},
        auth: {},
      },
      data: {},
    };

    let middlewareError: Error | null = null;
    socketAuthMiddleware(mockSocket, (err?: Error) => {
      middlewareError = err || null;
    });

    expect(middlewareError).toBeDefined();
    expect((middlewareError as any)?.message).toContain('AUTHENTICATION_ERROR');
  });

  it('authenticates socket when valid accessToken cookie is in handshake headers', () => {
    const validToken = generateAccessToken(mockUser);

    const mockSocket: any = {
      handshake: {
        headers: {
          cookie: `accessToken=${validToken}; otherCookie=123`,
        },
        auth: {},
      },
      data: {},
    };

    let middlewareError: Error | null = null;
    socketAuthMiddleware(mockSocket, (err?: Error) => {
      middlewareError = err || null;
    });

    expect(middlewareError).toBeNull();
    expect(mockSocket.data.user).toBeDefined();
    expect(mockSocket.data.user.id).toBe(mockUser.id);
    expect(mockSocket.data.user.username).toBe(mockUser.username);
  });

  it('rejects socket when accessToken cookie is invalid or expired', () => {
    const mockSocket: any = {
      handshake: {
        headers: {
          cookie: 'accessToken=invalid.jwt.token',
        },
        auth: {},
      },
      data: {},
    };

    let middlewareError: Error | null = null;
    socketAuthMiddleware(mockSocket, (err?: Error) => {
      middlewareError = err || null;
    });

    expect(middlewareError).toBeDefined();
    expect((middlewareError as any)?.message).toContain('AUTHENTICATION_ERROR');
  });

  it('enforces one active socket per user policy (disconnects superseded socket)', () => {
    const oldSocketEmit = vi.fn();
    const oldSocketDisconnect = vi.fn();

    const mockSocket1: any = {
      id: 'socket-1',
      data: { user: mockUser },
      join: vi.fn(),
      emit: oldSocketEmit,
      disconnect: oldSocketDisconnect,
      on: vi.fn(),
    };

    const mockSocketsMap = new Map<string, any>();
    mockSocketsMap.set('socket-1', mockSocket1);

    const mockServerIO: any = {
      sockets: {
        sockets: mockSocketsMap,
      },
    };

    // First connection from user
    handleSocketConnection(mockSocket1, mockServerIO);
    expect(userSockets.get(mockUser.id)).toBe('socket-1');

    // Second connection from same user
    const mockSocket2: any = {
      id: 'socket-2',
      data: { user: mockUser },
      join: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
      on: vi.fn(),
    };
    mockSocketsMap.set('socket-2', mockSocket2);

    handleSocketConnection(mockSocket2, mockServerIO);

    expect(oldSocketEmit).toHaveBeenCalledWith('auth:superseded', {
      code: 'SESSION_SUPERSEDED',
      message: 'You have connected from another window or device.',
    });
    expect(oldSocketDisconnect).toHaveBeenCalledWith(true);
    expect(userSockets.get(mockUser.id)).toBe('socket-2');
  });

  it('verifies resource ownership correctly via verifySocketOwnership helper', () => {
    let emittedError: any = null;
    const mockSocket = {
      data: { user: { id: 'user-123' } },
      emit: (_event: string, payload: any) => {
        emittedError = payload;
      },
    };

    // Owner matches
    const isAuthorized = verifySocketOwnership(mockSocket, 'user-123');
    expect(isAuthorized).toBe(true);
    expect(emittedError).toBeNull();

    // Owner does not match
    const isUnauthorized = verifySocketOwnership(mockSocket, 'different-user');
    expect(isUnauthorized).toBe(false);
    expect(emittedError).toMatchObject({
      code: 'FORBIDDEN',
      message: 'You are not authorized to perform actions on this resource.',
    });
    expect(emittedError.requestId).toBeDefined();
  });
});
