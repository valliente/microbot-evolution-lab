export class ChemicalGrid {
  public width: number;
  public height: number;
  public resolution: number;
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
      const idx = row * this.cols + col;
      this.buffer[idx] = Math.min(1.0, this.buffer[idx] + amount);
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

  public decay(rate: number): void {
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.buffer[i] > 0) {
        this.buffer[i] = Math.max(0, this.buffer[i] - rate);
      }
    }
  }

  public reset(): void {
    this.buffer.fill(0);
  }
}
