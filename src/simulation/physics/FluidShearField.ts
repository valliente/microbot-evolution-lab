export class FluidShearField {
  public cols: number;
  public rows: number;
  public cellSize: number;
  public shearMagnitude: Float32Array;
  public vorticity: Float32Array;

  constructor(width: number = 2000, height: number = 2000, cellSize: number = 32) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    const size = this.cols * this.rows;
    this.shearMagnitude = new Float32Array(size);
    this.vorticity = new Float32Array(size);
  }

  public getShearStress(x: number, y: number): { shear: number; eddyTorque: number } {
    const col = Math.max(0, Math.min(this.cols - 1, Math.floor(x / this.cellSize)));
    const row = Math.max(0, Math.min(this.rows - 1, Math.floor(y / this.cellSize)));
    const idx = row * this.cols + col;
    return {
      shear: this.shearMagnitude[idx] || 0,
      eddyTorque: this.vorticity[idx] || 0
    };
  }

  public calculateBoundaryLayerShear(
    fluidVelX: Float32Array,
    fluidVelY: Float32Array,
    obstacles: Array<{ x: number; y: number; radius: number }> = []
  ): void {
    for (let r = 1; r < this.rows - 1; r++) {
      for (let c = 1; c < this.cols - 1; c++) {
        const idx = r * this.cols + c;
        const top = (r - 1) * this.cols + c;
        const btm = (r + 1) * this.cols + c;
        const lft = r * this.cols + (c - 1);
        const rgt = r * this.cols + (c + 1);

        // Velocity spatial gradients: du/dy, dv/dx
        const dudy = (fluidVelX[btm] - fluidVelX[top]) * 0.5;
        const dvdx = (fluidVelY[rgt] - fluidVelY[lft]) * 0.5;

        // Shear strain rate and vorticity (curl)
        const shear = Math.abs(dudy + dvdx);
        const vort = dvdx - dudy;

        // Obstacle no-slip boundary boost
        let obstacleBoost = 1.0;
        const cellX = (c + 0.5) * this.cellSize;
        const cellY = (r + 0.5) * this.cellSize;
        for (const obs of obstacles) {
          const d = Math.hypot(cellX - obs.x, cellY - obs.y);
          if (d < obs.radius + this.cellSize * 1.5) {
            obstacleBoost += 2.0 * (1.0 - d / (obs.radius + this.cellSize * 1.5));
          }
        }

        this.shearMagnitude[idx] = Math.min(10.0, shear * obstacleBoost);
        this.vorticity[idx] = Math.max(-5.0, Math.min(5.0, vort));
      }
    }
  }
}
