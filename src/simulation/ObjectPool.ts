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

export interface TrailPoint {
  x: number;
  y: number;
}

export const trailPointPool = new ObjectPool<TrailPoint>(
  () => ({ x: 0, y: 0 }),
  (t) => { t.x = 0; t.y = 0; },
  200
);

export interface PooledFoodParticle {
  id: string;
  x: number;
  y: number;
  value: number;
  radius: number;
  type: string;
  color: string;
}

export const foodParticlePool = new ObjectPool<PooledFoodParticle>(
  () => ({ id: '', x: 0, y: 0, value: 25, radius: 3.5, type: 'NUTRIENT_DOT', color: '#00E676' }),
  (f) => { f.id = ''; f.x = 0; f.y = 0; f.value = 25; f.radius = 3.5; f.type = 'NUTRIENT_DOT'; f.color = '#00E676'; },
  150
);

export interface PooledDisasterParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const disasterParticlePool = new ObjectPool<PooledDisasterParticle>(
  () => ({ id: 0, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, color: '#ffffff', size: 1 }),
  (p) => { p.id = 0; p.x = 0; p.y = 0; p.vx = 0; p.vy = 0; p.life = 0; p.maxLife = 0; p.color = '#ffffff'; p.size = 1; },
  100
);

export interface PooledTrailParticle {
  x: number;
  y: number;
  life: number;
  color: string;
}

export const trailParticlePool = new ObjectPool<PooledTrailParticle>(
  () => ({ x: 0, y: 0, life: 1.0, color: '#ffffff' }),
  (p) => { p.x = 0; p.y = 0; p.life = 1.0; p.color = '#ffffff'; },
  500
);

export interface PooledChemicalParticle {
  x: number;
  y: number;
  intensity: number;
  color: string;
}

export const chemicalParticlePool = new ObjectPool<PooledChemicalParticle>(
  () => ({ x: 0, y: 0, intensity: 1.0, color: '#00E676' }),
  (p) => { p.x = 0; p.y = 0; p.intensity = 1.0; p.color = '#00E676'; },
  1000
);
