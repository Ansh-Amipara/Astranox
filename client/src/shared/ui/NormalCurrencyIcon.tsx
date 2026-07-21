export function NormalCurrencyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient cx="50%" cy="50%" id="goldenGlow" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50%" cy="50%" fill="url(#goldenGlow)" r="45">
        <animate attributeName="r" dur="4s" repeatCount="indefinite" values="40;48;40" />
      </circle>
      <circle cx="50%" cy="50%" fill="white" opacity="0.4" r="25">
        <animate attributeName="opacity" dur="1.5s" repeatCount="indefinite" values="0.2;0.6;0.2" />
      </circle>
      <circle cx="50%" cy="50%" fill="#fbbf24" r="15" />
    </svg>
  );
}
