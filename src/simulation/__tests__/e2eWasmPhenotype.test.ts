import { describe, it, expect } from 'vitest';
import { MicrobotEngine } from '../MicrobotEngine';
import { WASMSpatialHash } from '../spatial/WASMSpatialHash';
import { PhenotypeEngine } from '../genetics/PhenotypeEngine';

describe('E2E WASM Hashing and Phenotype Inspector Flow', () => {
  it('executes full simulation run verifying WASM Hashing and Phenotype Inspector integration', () => {
    const engine = new MicrobotEngine();
    engine.width = 800;
    engine.height = 600;
    engine.spawnMultipleBots(20);

    const wasmGrid = new WASMSpatialHash(800, 600, 50, 100);
    const entities = engine.microbots.map(b => ({ x: b.x, y: b.y, radius: (b as any).radius || 6, id: b.id }));
    const buf = wasmGrid.packEntities(entities);
    expect(buf.length).toBeGreaterThan(0);

    const bot = engine.microbots[0];
    const phenotype = PhenotypeEngine.mapGenomeToPhenotype(bot.genome);
    expect(phenotype).toBeDefined();
    expect(phenotype.armorPlates).toBeGreaterThanOrEqual(1);
  });
});
