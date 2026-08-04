export class PheromoneGrid {
  private width: number;
  private height: number;
  private resolution: number;
  public cols: number;
  public rows: number;
  public buffer: Float32Array;

  constructor(width: number, height: number, resolution: number = 10) {
    this.width = width;
    this.height = height;
    this.resolution = resolution;
    this.cols = Math.ceil(width / resolution);
    this.rows = Math.ceil(height / resolution);
    this.buffer = new Float32Array(this.cols * this.rows);
  }

  public addPheromone(x: number, y: number, amount: number): void {
    const col = Math.floor(x / this.resolution);
    const row = Math.floor(y / this.resolution);
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.buffer[row * this.cols + col] += amount;
    }
  }

  public getPheromone(x: number, y: number): number {
    const col = Math.floor(x / this.resolution);
    const row = Math.floor(y / this.resolution);
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      return this.buffer[row * this.cols + col];
    }
    return 0;
  }

  public update(decayRate: number = 0.98): void {
    // Basic decay; diffusion to be implemented
    for (let i = 0; i < this.buffer.length; i++) {
      this.buffer[i] *= decayRate;
      if (this.buffer[i] < 0.01) {
        this.buffer[i] = 0;
      }
    }
  }
}
