export interface FluidCell {
  vx: number;
  vy: number;
  viscosity: number;
  vorticity: number;
}

export class FluidVectorField {
  public cols: number;
  public rows: number;
  public cellSize: number;
  public velocityX: Float32Array;
  public velocityY: Float32Array;
  public viscosityField: Float32Array;

  constructor(width: number = 2000, height: number = 2000, cellSize: number = 40) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    const totalCells = this.cols * this.rows;
    this.velocityX = new Float32Array(totalCells);
    this.velocityY = new Float32Array(totalCells);
    this.viscosityField = new Float32Array(totalCells).fill(1.0);
  }

  public getVelocity(x: number, y: number): { vx: number; vy: number } {
    const col = Math.max(0, Math.min(this.cols - 1, Math.floor(x / this.cellSize)));
    const row = Math.max(0, Math.min(this.rows - 1, Math.floor(y / this.cellSize)));
    const index = row * this.cols + col;
    return {
      vx: this.velocityX[index] || 0,
      vy: this.velocityY[index] || 0
    };
  }

  public addForce(x: number, y: number, fx: number, fy: number, radius: number = 60): void {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    const cellRadius = Math.ceil(radius / this.cellSize);

    for (let r = Math.max(0, row - cellRadius); r <= Math.min(this.rows - 1, row + cellRadius); r++) {
      for (let c = Math.max(0, col - cellRadius); c <= Math.min(this.cols - 1, col + cellRadius); c++) {
        const index = r * this.cols + c;
        const cellCenterX = (c + 0.5) * this.cellSize;
        const cellCenterY = (r + 0.5) * this.cellSize;
        const distSq = (cellCenterX - x) * (cellCenterX - x) + (cellCenterY - y) * (cellCenterY - y);
        if (distSq < radius * radius) {
          const falloff = 1.0 - Math.sqrt(distSq) / radius;
          this.velocityX[index] += fx * falloff * 0.1;
          this.velocityY[index] += fy * falloff * 0.1;
        }
      }
    }
  }

  public advectAndDiffuse(_dt: number, viscosityDecay: number = 0.985): void {
    const totalCells = this.cols * this.rows;
    for (let i = 0; i < totalCells; i++) {
      this.velocityX[i] *= viscosityDecay;
      this.velocityY[i] *= viscosityDecay;

      // Prevent NaN/Infinity runaway values
      if (!isFinite(this.velocityX[i])) this.velocityX[i] = 0;
      if (!isFinite(this.velocityY[i])) this.velocityY[i] = 0;
    }
  }

  public calculateFluidInfluence(
    entityX: number,
    entityY: number,
    entityVx: number,
    entityVy: number,
    dragCoefficient: number = 0.05
  ): { forceX: number; forceY: number } {
    const fluidVel = this.getVelocity(entityX, entityY);
    const relVx = fluidVel.vx - entityVx;
    const relVy = fluidVel.vy - entityVy;

    const forceX = relVx * dragCoefficient;
    const forceY = relVy * dragCoefficient;

    return { forceX, forceY };
  }

  public disperseParticles<T extends { x: number; y: number; vx?: number; vy?: number }>(
    particles: T[],
    currentWeight: number = 0.2
  ): void {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const vel = this.getVelocity(p.x, p.y);
      p.x += vel.vx * currentWeight;
      p.y += vel.vy * currentWeight;
      if (p.vx !== undefined) p.vx += vel.vx * currentWeight * 0.1;
      if (p.vy !== undefined) p.vy += vel.vy * currentWeight * 0.1;
    }
  }
}
