import { ChemicalGrid } from '../simulation/pheromones/ChemicalGrid';

describe('ChemicalGrid', () => {
  it('should initialize correctly', () => {
    const grid = new ChemicalGrid(800, 600, 20);
    expect(grid.rows).toBe(30);
    expect(grid.cols).toBe(40);
    expect(grid.buffer.length).toBe(1200);
  });

  it('should add pheromones and bound coordinates correctly', () => {
    const grid = new ChemicalGrid(800, 600, 20);
    grid.addPheromone(100, 100, 0.5);
    const col = Math.floor(100 / 20);
    const row = Math.floor(100 / 20);
    expect(grid.buffer[row * grid.cols + col]).toBe(0.5);
  });

  it('should cap max pheromone intensity at 1.0', () => {
    const grid = new ChemicalGrid(800, 600, 20);
    grid.addPheromone(100, 100, 0.8);
    grid.addPheromone(100, 100, 0.5);
    const col = Math.floor(100 / 20);
    const row = Math.floor(100 / 20);
    expect(grid.buffer[row * grid.cols + col]).toBe(1.0);
  });

  it('should decay correctly', () => {
    const grid = new ChemicalGrid(800, 600, 20);
    grid.addPheromone(100, 100, 0.8);
    grid.decay(0.1);
    
    const col = Math.floor(100 / 20);
    const row = Math.floor(100 / 20);
    expect(grid.buffer[row * grid.cols + col]).toBeCloseTo(0.7);
  });
});
