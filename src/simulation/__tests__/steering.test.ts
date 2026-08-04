import { expect, test, describe } from 'vitest';
import { calculateSteering } from '../steering';
import { Microbot } from '../types';
import { PheromoneGrid } from '../pheromones/PheromoneGrid';
import { SpatialGrid } from '../SpatialGrid';

describe('calculateSteering - Chemotaxis', () => {
  test('Microbot steers towards higher pheromone concentration', () => {
    const bot = {
      id: '1',
      x: 50,
      y: 50,
      heading: 0,
      velocity: { x: 0, y: 0 },
      visionRadius: 100,
      maxSpeed: 2,
      maxForce: 0.1,
      isPredator: false,
      behaviorState: 'WANDERING',
      battery: 100,
      maxBattery: 100,
      mass: 1,
      color: '#fff',
      trail: [],
      genome: {},
      age: 0,
      speciesId: 1,
      isHybrid: false,
      fertility: 1.0
    } as Microbot;

    const pheromoneGrid = new PheromoneGrid(100, 100, 10);
    
    // Emit strong pheromone to the right (ahead and slightly right)
    // bot.heading is 0 (facing +X)
    // Sensor right is at angle +0.5 rad (y > 50)
    const sensorDist = 20;
    const rightY = 50 + Math.sin(0.5) * sensorDist;
    const rightX = 50 + Math.cos(0.5) * sensorDist;
    
    pheromoneGrid.addPheromone(rightX, rightY, 1.0);

    const emptySpatialGrid = new SpatialGrid(100, 100, 20);

    const result = calculateSteering(
      bot,
      [],
      [],
      emptySpatialGrid,
      [],
      [],
      pheromoneGrid
    );

    // Should steer towards right (increase heading)
    expect(result.desiredHeading).toBeGreaterThan(0);
  });
});
