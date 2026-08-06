import { describe, it, expect } from 'vitest';
import { PhenotypeEngine } from '../PhenotypeEngine';

describe('Gene-to-Geometry Phenotype Morphing', () => {
  it('maps genome alleles accurately to structural phenotype features', () => {
    const genome = {
      defenseAllele: { baseValue: 3.0 },
      speedAllele: { baseValue: 4.0 },
      visionAllele: { baseValue: 200.0 },
      hueAllele: { baseValue: 240 }
    };

    const phenotype = PhenotypeEngine.mapGenomeToPhenotype(genome);

    expect(phenotype.armorPlatesCount).toBe(6);
    expect(phenotype.thrustFinsLength).toBe(12);
    expect(phenotype.bioluminescentLureGlow).toBe(0.8);
    expect(phenotype.lureHue).toBe(240);
  });
});
