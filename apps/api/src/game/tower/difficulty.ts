export function calculateTowerLevel(floor: number): number {
  return Math.min(1000, Math.max(1, floor));
}

export function calculateTowerIVs(floor: number): number {
  const iv = Math.floor(10 + floor / 5);
  return Math.min(iv, 31);
}
