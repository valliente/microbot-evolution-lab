export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private resetFn: (obj: T) => void;

  constructor(factory: () => T, resetFn: (obj: T) => void, initialCapacity: number = 50) {
    this.factory = factory;
    this.resetFn = resetFn;

    for (let i = 0; i < initialCapacity; i++) {
      this.pool.push(this.factory());
    }
  }

  public acquire(): T {
    const obj = this.pool.pop() || this.factory();
    this.resetFn(obj);
    return obj;
  }

  public release(obj: T): void {
    this.pool.push(obj);
  }

  public get size(): number {
    return this.pool.length;
  }
}

export interface RayParticle {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  intensity: number;
}

export const rayPool = new ObjectPool<RayParticle>(
  () => ({ x1: 0, y1: 0, x2: 0, y2: 0, intensity: 1.0 }),
  (r) => { r.x1 = 0; r.y1 = 0; r.x2 = 0; r.y2 = 0; r.intensity = 1.0; },
  100
);
