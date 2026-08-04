import { Microbot, EnergyParticle, HazardZone } from './types';
import { PheromoneGrid } from './pheromones/PheromoneGrid';

export function calculateSteering(
  bot: Microbot,
  nearbyEnergy: EnergyParticle[],
  hazards: HazardZone[],
  width: number,
  height: number,
  pheromoneGrid?: PheromoneGrid
): { desiredHeading: number; state: 'WANDERING' | 'SEEKING_ENERGY' | 'EVADING_HAZARD' | 'REPRODUCING' | 'HUNTING_PREY' | 'INFECTED' } {
  let steerX = 0;
  let steerY = 0;

  // 1. Evade Hazards (Highest Priority)
  let closestHazardDist = Infinity;
  let hazardForceX = 0;
  let hazardForceY = 0;

  for (const hazard of hazards) {
    const dx = bot.x - hazard.x;
    const dy = bot.y - hazard.y;
    const dist = Math.hypot(dx, dy);
    if (dist < hazard.radius + bot.visionRadius) {
      if (dist < closestHazardDist) {
        closestHazardDist = dist;
      }
      const factor = (hazard.radius + bot.visionRadius - dist) / (hazard.radius + bot.visionRadius);
      hazardForceX += (dx / (dist || 1)) * factor * 4.0;
      hazardForceY += (dy / (dist || 1)) * factor * 4.0;
    }
  }

  if (Math.hypot(hazardForceX, hazardForceY) > 0.1) {
    steerX += hazardForceX;
    steerY += hazardForceY;
    const desiredHeading = Math.atan2(steerY, steerX);
    return { desiredHeading, state: 'EVADING_HAZARD' };
  }

  // 2. Seek Energy (Food)
  let closestEnergy: EnergyParticle | null = null;
  let minEnergyDist = Infinity;

  for (const food of nearbyEnergy) {
    const dx = food.x - bot.x;
    const dy = food.y - bot.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= bot.visionRadius && dist < minEnergyDist) {
      minEnergyDist = dist;
      closestEnergy = food;
    }
  }

  if (closestEnergy) {
    const dx = closestEnergy.x - bot.x;
    const dy = closestEnergy.y - bot.y;
    const desiredHeading = Math.atan2(dy, dx);
    return { desiredHeading, state: 'SEEKING_ENERGY' };
  }

  // 2.5 Chemotaxis (Pheromone following)
  if (pheromoneGrid && bot.battery > bot.maxBattery * 0.5) {
    const sensorDist = 20;
    const sensorAngle = 0.5; // radians

    // Left sensor
    const leftX = bot.x + Math.cos(bot.heading - sensorAngle) * sensorDist;
    const leftY = bot.y + Math.sin(bot.heading - sensorAngle) * sensorDist;
    const leftPheromone = pheromoneGrid.getPheromone(leftX, leftY);

    // Right sensor
    const rightX = bot.x + Math.cos(bot.heading + sensorAngle) * sensorDist;
    const rightY = bot.y + Math.sin(bot.heading + sensorAngle) * sensorDist;
    const rightPheromone = pheromoneGrid.getPheromone(rightX, rightY);

    if (leftPheromone > 0.1 || rightPheromone > 0.1) {
      // Steer towards higher pheromone
      if (leftPheromone > rightPheromone) {
        return { desiredHeading: bot.heading - 0.2, state: 'WANDERING' };
      } else if (rightPheromone > leftPheromone) {
        return { desiredHeading: bot.heading + 0.2, state: 'WANDERING' };
      }
    }
  }

  // 3. Boundary Avoidance & Random Wander
  const margin = 60;
  let wallForceX = 0;
  let wallForceY = 0;

  if (bot.x < margin) wallForceX = (margin - bot.x) / margin;
  else if (bot.x > width - margin) wallForceX = -(bot.x - (width - margin)) / margin;

  if (bot.y < margin) wallForceY = (margin - bot.y) / margin;
  else if (bot.y > height - margin) wallForceY = -(bot.y - (height - margin)) / margin;

  if (Math.hypot(wallForceX, wallForceY) > 0.1) {
    const desiredHeading = Math.atan2(wallForceY + Math.sin(bot.heading) * 0.5, wallForceX + Math.cos(bot.heading) * 0.5);
    return { desiredHeading, state: 'WANDERING' };
  }

  // Pure Wander jitter
  const jitter = (Math.random() - 0.5) * 0.3;
  const desiredHeading = bot.heading + jitter;
  return { desiredHeading, state: 'WANDERING' };
}
