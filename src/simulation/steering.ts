import { Microbot, Vector2D, HazardZone } from './types';

/**
 * Calculates turn angle adjustment (-maxTurn to +maxTurn) to rotate towards target angle.
 */
export function clampAngleStep(currentHeading: number, targetAngle: number, maxTurnSpeed: number): number {
  let diff = targetAngle - currentHeading;
  // Normalize difference to [-PI, PI]
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;

  return Math.max(-maxTurnSpeed, Math.min(maxTurnSpeed, diff));
}

/**
 * Wandering steering behavior: generates smooth continuous directional change.
 */
export function calculateWanderHeading(microbot: Microbot): number {
  const angleDelta = (Math.random() - 0.5) * 0.35;
  return microbot.heading + angleDelta;
}

/**
 * Seek behavior: points directly towards a target (energy particle).
 */
export function calculateSeekHeading(microbot: Microbot, target: Vector2D): number {
  return Math.atan2(target.y - microbot.y, target.x - microbot.x);
}

/**
 * Flee behavior: points directly away from a hazard center.
 */
export function calculateFleeHeading(microbot: Microbot, hazard: HazardZone): number {
  return Math.atan2(microbot.y - hazard.y, microbot.x - hazard.x);
}

/**
 * Boundary steering: nudges heading away from canvas borders.
 */
export function calculateBoundaryCorrection(
  x: number,
  y: number,
  heading: number,
  width: number,
  height: number,
  margin: number = 50
): number {
  let forceX = 0;
  let forceY = 0;

  if (x < margin) forceX = (margin - x) / margin;
  else if (x > width - margin) forceX = -(x - (width - margin)) / margin;

  if (y < margin) forceY = (margin - y) / margin;
  else if (y > height - margin) forceY = -(y - (height - margin)) / margin;

  if (forceX !== 0 || forceY !== 0) {
    const boundaryAngle = Math.atan2(forceY, forceX);
    // Blend current heading with boundary angle
    const weight = 0.6;
    let diff = boundaryAngle - heading;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    return heading + diff * weight;
  }

  return heading;
}
