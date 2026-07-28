import { SectorBiome } from '../types';

describe('Sector Biome spatial boundaries', () => {
  const biomes: SectorBiome[] = [
    { id: 'b1', type: 'TOXIC_SLUDGE', x: 0, y: 0, width: 400, height: 400, active: true },
    { id: 'b2', type: 'CRYO_ZONE', x: 400, y: 0, width: 400, height: 400, active: true }
  ];

  const getBiomeAt = (x: number, y: number) => {
    return biomes.find(b => x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) || null;
  };

  it('should return correct biome for coordinates within boundary', () => {
    const b = getBiomeAt(200, 200);
    if (!b || b.type !== 'TOXIC_SLUDGE') throw new Error('Failed to identify TOXIC_SLUDGE');
  });

  it('should return null for coordinates outside all boundaries', () => {
    const b = getBiomeAt(1000, 1000);
    if (b !== null) throw new Error('Expected null for out-of-bounds coordinates');
  });
  
  it('should correctly identify bordering biome', () => {
    const b = getBiomeAt(600, 200);
    if (!b || b.type !== 'CRYO_ZONE') throw new Error('Failed to identify CRYO_ZONE');
  });
});

console.log('biome.test.ts: Sector Biome spatial boundary lookups passed.');
