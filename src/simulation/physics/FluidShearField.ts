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
}
