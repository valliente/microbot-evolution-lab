import { ChemicalGrid } from '../simulation/pheromones/ChemicalGrid';
import { Microbot } from '../simulation/types';

describe('Chemotaxis', () => {
  it('should adjust heading towards higher pheromone concentration', () => {
    const grid = new ChemicalGrid(800, 600, 20);
    const bot: Microbot = {
      id: 'bot1',
      x: 100, y: 100, vx: 0, vy: 0, heading: 0,
      speed: 2, maxSpeed: 2, energyEfficiency: 1, visionRadius: 100,
      battery: 100, maxBattery: 100, age: 0, generation: 1,
      color: '#fff', hue: 0, lineageParentId: null, behaviorState: 'WANDERING',
      trail: []
    };

    // Add pheromones to the right (heading 0 is exactly right)
    // We add more pheromones slightly below (positive y) to test alignment
    grid.addPheromone(bot.x + 15, bot.y + 10, 1.0); 

    // Simulate the chemotaxis loop from MicrobotEngine
    let desiredHeading = bot.heading;
    const pLeft = grid.getPheromone(
      bot.x + Math.cos(bot.heading - 0.5) * 15,
      bot.y + Math.sin(bot.heading - 0.5) * 15
    );
    const pRight = grid.getPheromone(
      bot.x + Math.cos(bot.heading + 0.5) * 15,
      bot.y + Math.sin(bot.heading + 0.5) * 15
    );
    const pCenter = grid.getPheromone(
      bot.x + Math.cos(bot.heading) * 15,
      bot.y + Math.sin(bot.heading) * 15
    );

    if (pLeft > 0 || pRight > 0 || pCenter > 0) {
      if (pLeft > pRight && pLeft > pCenter) {
         desiredHeading -= 0.2;
      } else if (pRight > pLeft && pRight > pCenter) {
         desiredHeading += 0.2;
      }
    }

    // Since we added pheromones to the "right" of the heading (y + 10), pRight should be higher
    expect(pRight).toBeGreaterThan(pLeft);
    expect(desiredHeading).toBeGreaterThan(bot.heading);
  });
});
