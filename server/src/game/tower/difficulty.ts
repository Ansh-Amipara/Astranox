export function calculateTowerLevel(floor: number): number {
  if (floor <= 10) {
    return floor * 10;
  }
  if (floor >= 1000) {
    return 15000;
  }
  
  return 100 + (floor - 10) * 15;
}

export function calculateTowerIVs(floor: number): number {
  const iv = Math.floor(10 + floor / 5);
  return Math.min(iv, 31);
}
