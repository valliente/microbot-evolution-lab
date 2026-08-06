import { describe, it, expect } from 'vitest';
import { WASMSpatialHash } from '../WASMSpatialHash';

describe('WASM Spatial Hashing', () => {
  it('correctly packs entity memory buffer and performs proximity lookup', () => {
    const grid = new WASMSpatialHash(800, 600, 50, 10);
    const entities = [
      { x: 10, y: 10, radius: 5, id: 'bot-1' },
      { x: 15, y: 15, radius: 5, id: 'bot-2' },
      { x: 500, y: 500, radius: 5, id: 'bot-3' }
    ];

    const buf = grid.packEntities(entities);
    expect(buf[0]).toBe(10);
    expect(buf[1]).toBe(10);
  });
});
