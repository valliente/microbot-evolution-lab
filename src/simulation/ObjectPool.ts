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
