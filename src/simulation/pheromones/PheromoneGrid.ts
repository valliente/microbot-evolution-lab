import { ObjectPool } from '../ObjectPool';

export interface ChemicalEmitter {
  x: number;
  y: number;
  amount: number;
  life: number;
  active: boolean;
}

export class PheromoneGrid {
  private width: number;
  private height: number;
  private resolution: number;
  public cols: number;
  public rows: number;
  public buffer: Float32Array;

  public activeEmitters: ChemicalEmitter[] = [];
  private emitterPool: ObjectPool<ChemicalEmitter>;

  constructor(width: number, height: number, resolution: number = 10) {
    this.width = width;
    this.height = height;
    this.resolution = resolution;
    this.cols = Math.ceil(width / resolution);
    this.rows = Math.ceil(height / resolution);
    this.buffer = new Float32Array(this.cols * this.rows);
    
    this.emitterPool = new ObjectPool<ChemicalEmitter>(
      () => ({ x: 0, y: 0, amount: 0, life: 0, active: false }),
      (emitter) => { emitter.active = false; },
      100
    );
  }

  public registerEmitter(x: number, y: number, amount: number, life: number = 60): void {
    const emitter = this.emitterPool.acquire();
    emitter.x = x;
    emitter.y = y;
    emitter.amount = amount;
    emitter.life = life;
    emitter.active = true;
    this.activeEmitters.push(emitter);
  }

  public processEmitters(): void {
    for (let i = this.activeEmitters.length - 1; i >= 0; i--) {
      const emitter = this.activeEmitters[i];
      if (emitter.life <= 0) {
        this.emitterPool.release(emitter);
        this.activeEmitters.splice(i, 1);
      } else {
        this.addPheromone(emitter.x, emitter.y, emitter.amount);
        emitter.life--;
      }
    }
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

  public decay(decayRate: number = 0.98): void {
    const newBuffer = new Float32Array(this.cols * this.rows);
    const diffRate = 0.1; // Diffusion factor

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = r * this.cols + c;
        let val = this.buffer[idx];
        
        if (val > 0) {
          // Diffuse to neighbors
          let neighbors = 0;
          let sum = 0;
          
          if (r > 0) { sum += this.buffer[(r - 1) * this.cols + c]; neighbors++; }
          if (r < this.rows - 1) { sum += this.buffer[(r + 1) * this.cols + c]; neighbors++; }
          if (c > 0) { sum += this.buffer[r * this.cols + (c - 1)]; neighbors++; }
          if (c < this.cols - 1) { sum += this.buffer[r * this.cols + (c + 1)]; neighbors++; }
          
          const diffused = val * (1 - diffRate) + (sum / Math.max(1, neighbors)) * diffRate;
          newBuffer[idx] = diffused * decayRate;
          
          if (newBuffer[idx] < 0.01) {
            newBuffer[idx] = 0;
          }
        }
      }
    }
    
    this.buffer = newBuffer;
  }
}
