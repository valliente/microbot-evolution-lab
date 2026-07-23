/**
 * Utility functions for HSL visual color mutation and conversion.
 */

export function getRandomHue(): number {
  return Math.floor(Math.random() * 360);
}

export function mutateHue(parentHue: number, mutationRate: number): number {
  const delta = (Math.random() - 0.5) * 60 * mutationRate;
  return Math.round((parentHue + delta + 360) % 360);
}

export function formatHueToHSL(hue: number, saturation: number = 85, lightness: number = 60): string {
  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
}
