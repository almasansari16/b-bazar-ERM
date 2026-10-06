/** Deterministic PRNG so mock data is stable across reloads. */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const makeRng = (seed: number) => {
  const r = mulberry32(seed);
  return {
    next: r,
    int: (min: number, max: number) => Math.floor(r() * (max - min + 1)) + min,
    pick: <T,>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)],
    float: (min: number, max: number, dp = 1) => Number((r() * (max - min) + min).toFixed(dp)),
    chance: (p: number) => r() < p,
  };
};
