import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface EncounterTransitionProps {
  active: boolean;
  onComplete: () => void;
}

export const EncounterTransition: React.FC<EncounterTransitionProps> = ({
  active,
  onComplete,
}) => {
  const isReducedMotion = useReducedMotion();
  const [stage, setStage] = useState<'idle' | 'flashing' | 'wiping'>('idle');

  useEffect(() => {
    if (!active) {
      setStage('idle');
      return;
    }

    if (isReducedMotion) {
      onComplete();
      return;
    }

    setStage('flashing');
    const timer1 = setTimeout(() => {
      setStage('wiping');
    }, 300);

    const timer2 = setTimeout(() => {
      onComplete();
    }, 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [active, isReducedMotion, onComplete]);

  if (!active || stage === 'idle') return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      {stage === 'flashing' && (
        <div className="absolute inset-0 bg-foreground/90 animate-pulse duration-150" />
      )}
      {stage === 'wiping' && (
        <div className="absolute inset-0 bg-background transition-opacity duration-300 opacity-100 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
