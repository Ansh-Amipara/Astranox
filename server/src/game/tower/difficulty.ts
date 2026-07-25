export function calculateTowerLevel(floor: number): number {
  const level = Math.floor(20 + floor * 3 + Math.sqrt(floor) * 8);
  return Math.min(level, 5000);
}

export function calculateTowerIVs(floor: number): number {
  const iv = Math.floor(10 + floor / 5);
  return Math.min(iv, 31);
}
