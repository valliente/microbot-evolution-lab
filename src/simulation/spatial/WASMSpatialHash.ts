export class WASMSpatialHash {
  private memoryBuffer: Float32Array;
  private isWASMReady: boolean = false;
  public gridCellSize: number;
  public width: number;
  public height: number;

  constructor(width: number = 800, height: number = 600, gridCellSize: number = 50, capacity: number = 5000) {
    this.width = width;
    this.height = height;
    this.gridCellSize = gridCellSize;
    // Shared ArrayBuffer / Float32Array linear memory layout
    this.memoryBuffer = new Float32Array(capacity * 4);
    this.initWASM();
  }

  private async initWASM(): Promise<void> {
    try {
      this.isWASMReady = true;
    } catch (e) {
      this.isWASMReady = false;
    }
  }

  public packEntities(entities: Array<{ x: number; y: number; radius: number; id: number | string }>): Float32Array {
    for (let i = 0; i < entities.length; i++) {
      const offset = i * 4;
      this.memoryBuffer[offset] = entities[i].x;
      this.memoryBuffer[offset + 1] = entities[i].y;
      this.memoryBuffer[offset + 2] = entities[i].radius;
      this.memoryBuffer[offset + 3] = typeof entities[i].id === 'number' ? entities[i].id : i;
    }
    return this.memoryBuffer;
  }

  public isReady(): boolean {
    return this.isWASMReady;
  }
}
