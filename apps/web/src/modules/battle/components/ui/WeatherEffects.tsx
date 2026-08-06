import { memo } from 'react';

interface Props {
  weather?: string | null;
}

export const WeatherEffects = memo(function WeatherEffects({ weather }: Props) {
  if (!weather) return null;

  // Render weather overlay (rain, sun, etc.)
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-30 mix-blend-overlay">
      {/* Visual weather overlay elements will go here */}
    </div>
  );
});
