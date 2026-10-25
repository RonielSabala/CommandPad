/** `value` kept within `min`..`max`; `min` wins when they cross. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}
