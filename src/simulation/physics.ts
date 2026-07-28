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

export function sanitizeVector(v: number): number {
  return isNaN(v) || !isFinite(v) ? 0 : v;
}

export function normalizeVector(vx: number, vy: number): { x: number, y: number } {
  const len = Math.hypot(vx, vy);
  if (len === 0 || isNaN(len)) return { x: 0, y: 0 };
  return { x: sanitizeVector(vx / len), y: sanitizeVector(vy / len) };
}

export function ccdSubstep(
  x: number, y: number, 
  vx: number, vy: number, 
  speedMult: number, 
  width: number, height: number, margin: number = 15,
  hazards: any[] = []
): { x: number; y: number; hitHazard: boolean } {
  const steps = Math.ceil(Math.hypot(vx * speedMult, vy * speedMult) / 10);
  const stepX = (vx * speedMult) / steps;
  const stepY = (vy * speedMult) / steps;
  let cx = x;
  let cy = y;
  let hitHazard = false;

  for (let i = 0; i < steps; i++) {
    cx += stepX;
    cy += stepY;
    cx = sanitizeVector(cx);
    cy = sanitizeVector(cy);
    
    // Check hazard boundaries
    for (const h of hazards) {
      if (Math.hypot(cx - h.x, cy - h.y) < h.radius) {
        hitHazard = true;
        // Simple bounce back out of hazard
        const angle = Math.atan2(cy - h.y, cx - h.x);
        cx = h.x + Math.cos(angle) * h.radius;
        cy = h.y + Math.sin(angle) * h.radius;
      }
    }

    if (cx < margin || cx > width - margin || cy < margin || cy > height - margin) {
      cx = clamp(cx, margin, width - margin);
      cy = clamp(cy, margin, height - margin);
      break; // stop stepping if hitting wall
    }
  }

  return { x: cx, y: cy, hitHazard };
}
