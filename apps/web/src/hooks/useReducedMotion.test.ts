import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

describe('useReducedMotion', () => {
  let listeners: ((e: MediaQueryListEvent) => void)[] = [];
  let matchesValue = false;

  beforeEach(() => {
    listeners = [];
    matchesValue = false;

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: matchesValue,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, cb: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') listeners.push(cb);
      }),
      removeEventListener: vi.fn((event: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners = listeners.filter((l) => l !== cb);
      }),
      dispatchEvent: vi.fn(),
    }));
  });

  it('returns false by default when reduced motion is not preferred', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when reduced motion is preferred', () => {
    matchesValue = true;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('reacts dynamically to media query changes', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      listeners.forEach((listener) =>
        listener({ matches: true } as MediaQueryListEvent)
      );
    });

    expect(result.current).toBe(true);
  });
});
