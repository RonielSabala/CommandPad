export function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : greatestCommonDivisor(b, a % b);
}

/** `value` kept within `min`..`max`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}
