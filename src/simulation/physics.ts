export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function wrapAngle(angle: number): number {
  let a = angle;
  while (a < -Math.PI) a += Math.PI * 2;
  while (a > Math.PI) a -= Math.PI * 2;
  return a;
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function keepInBounds(x: number, y: number, width: number, height: number, margin: number = 15): { x: number; y: number } {
  return {
    x: clamp(x, margin, width - margin),
    y: clamp(y, margin, height - margin)
  };
}
