import { useEffect, useRef } from 'react';
import { MapDirection } from '@astranox/game-map';
import { EXPLORATION_CONSTANTS } from '@astranox/constants';

interface UseKeyboardMovementOptions {
  onMove: (direction: MapDirection) => void;
  disabled?: boolean;
}

export function useKeyboardMovement({ onMove, disabled = false }: UseKeyboardMovementOptions) {
  const activeKeyRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (disabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      activeKeyRef.current = null;
      return;
    }

    const keyToDirection = (key: string): MapDirection | null => {
      switch (key) {
        case 'ArrowUp':
        case 'KeyW':
        case 'w':
        case 'W':
          return 'UP';
        case 'ArrowDown':
        case 'KeyS':
        case 's':
        case 'S':
          return 'DOWN';
        case 'ArrowLeft':
        case 'KeyA':
        case 'a':
        case 'A':
          return 'LEFT';
        case 'ArrowRight':
        case 'KeyD':
        case 'd':
        case 'D':
          return 'RIGHT';
        default:
          return null;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is interacting with form inputs
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const dir = keyToDirection(e.key);
      if (!dir) return;

      e.preventDefault();

      if (activeKeyRef.current === e.key) {
        return; // Already held
      }

      activeKeyRef.current = e.key;
      onMove(dir);

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (activeKeyRef.current) {
          const currentDir = keyToDirection(activeKeyRef.current);
          if (currentDir) {
            onMove(currentDir);
          }
        }
      }, EXPLORATION_CONSTANTS.MOVE_COOLDOWN_MS);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (activeKeyRef.current === e.key) {
        activeKeyRef.current = null;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    const handleBlur = () => {
      activeKeyRef.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onMove, disabled]);
}
