/**
 * Spatial Hash Grid for high-performance spatial partitioning.
 * Accelerates neighbor searches for 300+ microbots from O(N^2) to O(1).
 */
export class SpatialGrid<T extends { x: number; y: number; id: string }> {
  private cellSize: number;
  private grid: Map<string, T[]> = new Map();

  constructor(cellSize: number = 80) {
    this.cellSize = cellSize;
  }

  private getKey(x: number, y: number): string {
    const gx = Math.floor(x / this.cellSize);
    const gy = Math.floor(y / this.cellSize);
    return `${gx},${gy}`;
  }

  public clear(): void {
    this.grid.clear();
  }

  public insert(item: T): void {
    const key = this.getKey(item.x, item.y);
    let cell = this.grid.get(key);
    if (!cell) {
      cell = [];
      this.grid.set(key, cell);
    }
    cell.push(item);
  }

  public insertAll(items: T[]): void {
    for (let i = 0; i < items.length; i++) {
      this.insert(items[i]);
    }
  }

  /**
   * Query all items within a given bounding box / radius.
   */
  public queryRadius(x: number, y: number, radius: number): T[] {
    const minGx = Math.floor((x - radius) / this.cellSize);
    const maxGx = Math.floor((x + radius) / this.cellSize);
    const minGy = Math.floor((y - radius) / this.cellSize);
    const maxGy = Math.floor((y + radius) / this.cellSize);

    const radiusSq = radius * radius;
    const results: T[] = [];

    for (let gx = minGx; gx <= maxGx; gx++) {
      for (let gy = minGy; gy <= maxGy; gy++) {
        const key = `${gx},${gy}`;
        const cell = this.grid.get(key);
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
            const item = cell[i];
            const dx = item.x - x;
            const dy = item.y - y;
            if (dx * dx + dy * dy <= radiusSq) {
              results.push(item);
            }
          }
        }
      }
    }

    return results;
  }
}
