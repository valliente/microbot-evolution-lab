import { EnergyParticle } from './types';

export class SpatialGrid {
  private cellSize: number;
  private cols: number;
  private rows: number;
  private grid: Map<string, EnergyParticle[]>;

  constructor(width: number, height: number, cellSize: number = 60) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.grid = new Map();
  }

  public clear(): void {
    this.grid.clear();
  }

  private getKey(col: number, row: number): string {
    return `${col},${row}`;
  }

  public insert(particle: EnergyParticle): void {
    const col = Math.floor(particle.x / this.cellSize);
    const row = Math.floor(particle.y / this.cellSize);
    const key = this.getKey(col, row);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(particle);
  }

  public getNearby(x: number, y: number, radius: number): EnergyParticle[] {
    const minCol = Math.max(0, Math.floor((x - radius) / this.cellSize));
    const maxCol = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
    const minRow = Math.max(0, Math.floor((y - radius) / this.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));

    const results: EnergyParticle[] = [];
    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        const key = this.getKey(col, row);
        const cellParticles = this.grid.get(key);
        if (cellParticles) {
          results.push(...cellParticles);
        }
      }
    }
    return results;
  }
}
