import { describe, it, expect } from 'vitest';
import { PlanetaryCataclysmManager, CataclysmEvent } from '../PlanetaryCataclysmManager';

describe('Tectonic Terrain Heightmap Deformation', () => {
  it('computes tectonic deformation shift within epicenter radius', () => {
    const manager = new PlanetaryCataclysmManager();
    const event: CataclysmEvent = {
      id: 'cat-1',
      type: 'TECTONIC_INVERSION',
      durationFrames: 300,
      remainingFrames: 300,
      intensity: 1.0,
      epicenterX: 400,
      epicenterY: 300,
      radius: 200
    };

    const res = manager.computeTectonicDeformation(450, 300, event);
    expect(res.heightShift).toBeGreaterThan(0);
  });
});
