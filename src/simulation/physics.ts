import { Guardrails } from './physics/Guardrails';

export function clamp(val: number, min: number, max: number): number {
  if (isNaN(val)) return min;
  return Math.max(min, Math.min(max, val));
}

export function safeSqrt(val: number): number {
  return Guardrails.getInstance().safeSqrt(val);
}

export function safeAtan2(y: number, x: number): number {
  return Guardrails.getInstance().safeAtan2(y, x);
}

export function wrapAngle(angle: number): number {
  if (isNaN(angle)) return 0;
  let a = angle;
  while (a < -Math.PI) a += Math.PI * 2;
  while (a > Math.PI) a -= Math.PI * 2;
  return a;
}

export function clampAngle(angle: number): number {
  return wrapAngle(angle);
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const d = Math.hypot(x2 - x1, y2 - y1);
  return isNaN(d) || !isFinite(d) ? 0 : d;
}

export function keepInBounds(x: number, y: number, width: number, height: number, margin: number = 15): { x: number; y: number } {
  return {
    x: clamp(x, margin, width - margin),
    y: clamp(y, margin, height - margin)
  };
}

export function teleportThroughPortal(x: number, y: number, portalX: number, portalY: number, targetWidth: number, targetHeight: number): { x: number; y: number } {
  const relX = (x - portalX) / targetWidth;
  const relY = (y - portalY) / targetHeight;
  return {
    x: clamp(targetWidth * 0.5 + relX * targetWidth * 0.2, 20, targetWidth - 20),
    y: clamp(targetHeight * 0.5 + relY * targetHeight * 0.2, 20, targetHeight - 20)
  };
}

export function sanitizeVector(v: number): number {
  return isNaN(v) || !isFinite(v) ? 0 : v;
}

export function normalizeVector(vx: number, vy: number): { x: number, y: number } {
  const len = Math.hypot(vx, vy);
  if (len === 0 || isNaN(len) || !isFinite(len)) return { x: 0, y: 0 };
  return { 
    x: Guardrails.getInstance().safeDiv(vx, len, 0), 
    y: Guardrails.getInstance().safeDiv(vy, len, 0) 
  };
}

export function ccdSubstep(
  x: number, y: number, 
  vx: number, vy: number, 
  speedMult: number, 
  width: number, height: number, margin: number = 15,
  hazards: any[] = []
): { x: number; y: number; hitHazard: boolean } {
  const rawDist = Math.hypot(vx * speedMult, vy * speedMult);
  const steps = Math.max(1, Math.ceil(isNaN(rawDist) ? 1 : rawDist / 10));
  const stepX = Guardrails.getInstance().safeDiv(vx * speedMult, steps, 0);
  const stepY = Guardrails.getInstance().safeDiv(vy * speedMult, steps, 0);
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
        const angle = Guardrails.getInstance().safeAtan2(cy - h.y, cx - h.x);
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

