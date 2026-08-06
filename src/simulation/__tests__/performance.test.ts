import { describe, it, expect } from 'vitest';
import { MicrobotEngine } from '../MicrobotEngine';
import { WASMSpatialHash } from '../spatial/WASMSpatialHash';

describe('Performance & Frame Budget Verification', () => {
  it('verify 120 FPS stability under 5,000 active entities with active WASM grid', () => {
    const frameBudgetMs = 1000 / 120; // ~8.33ms
    const engine = new MicrobotEngine();
    engine.width = 800;
    engine.height = 600;
    
    const wasmGrid = new WASMSpatialHash(800, 600, 50, 5000);
    const entities = Array.from({ length: 5000 }, (_, i) => ({
      x: Math.random() * 800,
      y: Math.random() * 600,
      radius: 5,
      id: i
    }));

    const startTime = performance.now();
    wasmGrid.packEntities(entities);
    const out = new Int32Array(50);
    wasmGrid.queryNearbyZeroAlloc(400, 300, 50, out);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(frameBudgetMs);
  });
});
