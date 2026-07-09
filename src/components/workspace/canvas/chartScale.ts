// Rounds `max` up to a "nice" bound (1/2/5 × 10ⁿ) and returns `count` evenly spaced ticks from 0.
export const buildTicks = (max: number, count: number): number[] => {
  if (max <= 0) return Array.from({ length: count }, (_, i) => i);
  const rawStep = max / (count - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  return Array.from({ length: count }, (_, i) => Math.round(i * step));
};

export const niceMax = (value: number): number => {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceNormalized * magnitude;
};
