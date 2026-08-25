export class MorphogenGrid {
  public cols: number;
  public rows: number;
  public cellSize: number;
  public activator: Float32Array; // Morphogen A
  public inhibitor: Float32Array; // Morphogen B
  public da: number = 1.0; // Activator diffusion rate
  public db: number = 0.5; // Inhibitor diffusion rate
  public feed: number = 0.055;
  public kill: number = 0.062;

  constructor(width: number = 2000, height: number = 2000, cellSize: number = 32) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    const size = this.cols * this.rows;
    this.activator = new Float32Array(size).fill(1.0);
    this.inhibitor = new Float32Array(size).fill(0.0);

    // Initial perturbation spot in center
    const midX = Math.floor(this.cols / 2);
    const midY = Math.floor(this.rows / 2);
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const idx = (midY + dy) * this.cols + (midX + dx);
        if (idx >= 0 && idx < size) {
          this.inhibitor[idx] = 0.8;
        }
      }
    }
  }

  public getConcentration(x: number, y: number): { a: number; b: number } {
    const col = Math.max(0, Math.min(this.cols - 1, Math.floor(x / this.cellSize)));
    const row = Math.max(0, Math.min(this.rows - 1, Math.floor(y / this.cellSize)));
    const idx = row * this.cols + col;
    return {
      a: this.activator[idx] || 0,
      b: this.inhibitor[idx] || 0
    };
  }

  public updateTuringStep(dt: number = 1.0): void {
    const nextA = new Float32Array(this.activator.length);
    const nextB = new Float32Array(this.inhibitor.length);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = r * this.cols + c;
        const a = this.activator[idx];
        const b = this.inhibitor[idx];

        // 5-point discrete Laplacian stencil
        const top = r > 0 ? (r - 1) * this.cols + c : idx;
        const btm = r < this.rows - 1 ? (r + 1) * this.cols + c : idx;
        const lft = c > 0 ? r * this.cols + (c - 1) : idx;
        const rgt = c < this.cols - 1 ? r * this.cols + (c + 1) : idx;

        const lapA = (this.activator[top] + this.activator[btm] + this.activator[lft] + this.activator[rgt]) * 0.25 - a;
        const lapB = (this.inhibitor[top] + this.inhibitor[btm] + this.inhibitor[lft] + this.inhibitor[rgt]) * 0.25 - b;

        const abb = a * b * b;
        const deltaA = (this.da * lapA - abb + this.feed * (1.0 - a)) * dt;
        const deltaB = (this.db * lapB + abb - (this.kill + this.feed) * b) * dt;

        nextA[idx] = Math.max(0, Math.min(1.0, a + deltaA));
        nextB[idx] = Math.max(0, Math.min(1.0, b + deltaB));
      }
    }

    this.activator.set(nextA);
    this.inhibitor.set(nextB);
  }

  public getDifferentiationFate(x: number, y: number): 'ECTODERM' | 'MESODERM' | 'ENDODERM' {
    const { a, b } = this.getConcentration(x, y);
    const ratio = b > 0 ? a / (b + 0.001) : a * 10;

    if (ratio > 2.5) return 'ECTODERM';
    if (ratio > 1.2) return 'MESODERM';
    return 'ENDODERM';
  }

  public calculateSymmetryOffset(x: number, y: number, baseRadius: number = 8.0): { offsetX: number; offsetY: number } {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    const top = Math.max(0, row - 1) * this.cols + col;
    const btm = Math.min(this.rows - 1, row + 1) * this.cols + col;
    const lft = row * this.cols + Math.max(0, col - 1);
    const rgt = row * this.cols + Math.min(this.cols - 1, col + 1);

    const gradX = (this.activator[rgt] - this.activator[lft]) * 0.5;
    const gradY = (this.activator[btm] - this.activator[top]) * 0.5;

    return {
      offsetX: gradX * baseRadius,
      offsetY: gradY * baseRadius
    };
  }

  public packMorphogenToFloat32(targetBuffer?: Float32Array): Float32Array {
    const buffer = targetBuffer && targetBuffer.length >= this.activator.length
      ? targetBuffer
      : new Float32Array(this.activator.length);
    buffer.set(this.activator);
    return buffer;
  }

  public setDiffusionAndDecayRates(da?: number, db?: number, feed?: number, kill?: number): void {
    if (da !== undefined) this.da = Math.max(0.1, Math.min(2.0, da));
    if (db !== undefined) this.db = Math.max(0.05, Math.min(1.0, db));
    if (feed !== undefined) this.feed = Math.max(0.01, Math.min(0.1, feed));
    if (kill !== undefined) this.kill = Math.max(0.01, Math.min(0.1, kill));
  }
}
