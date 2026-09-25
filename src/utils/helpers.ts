/**
 * Math and animation helper utilities for cinematic 3D interactions.
 */

/**
 * Linear interpolation between two values.
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Clamp a number between a minimum and maximum value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map a number from one range to another range with optional clamping.
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  shouldClamp: boolean = true
): number {
  if (inMax - inMin === 0) return outMin;
  const mapped = ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  return shouldClamp
    ? clamp(mapped, Math.min(outMin, outMax), Math.max(outMin, outMax))
    : mapped;
}

/**
 * Frame-rate independent exponential damping (smooth lerp with delta time).
 * lambda controls damping speed: higher = faster response (e.g. 3 to 10).
 */
export function damp(
  current: number,
  target: number,
  lambda: number,
  delta: number
): number {
  return lerp(current, target, 1 - Math.exp(-lambda * delta));
}

/**
 * Normalized viewport mouse coordinates [-1 to 1] centered at (0, 0).
 */
export function getNormalizedPointer(
  clientX: number,
  clientY: number,
  width: number,
  height: number
): { x: number; y: number } {
  return {
    x: (clientX / width) * 2 - 1,
    y: -(clientY / height) * 2 + 1,
  };
}

/**
 * Smoothstep easing interpolation.
 */
export function smoothstep(min: number, max: number, value: number): number {
  const x = clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
}
