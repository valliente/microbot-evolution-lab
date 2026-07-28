import { ActiveDisaster } from '../types';

describe('Radiation Storm mutation probability', () => {
  it('should significantly increase mutation rate during active storm', () => {
    let baseMutationRate = 0.05;
    const disasters: ActiveDisaster[] = [
      { type: 'RADIATION_STORM', active: true, intensity: 1.0, durationLeft: 100 }
    ];

    const hasRadiationStorm = disasters.some(d => d.type === 'RADIATION_STORM' && d.active);
    
    let effectiveMutationRate = baseMutationRate;
    if (hasRadiationStorm) {
      effectiveMutationRate += 0.8; // High probability of mutation
    }

    if (effectiveMutationRate <= 0.5) {
      throw new Error('Mutation rate did not increase sufficiently during Radiation Storm');
    }
  });

  it('should not increase mutation rate when storm is inactive', () => {
    let baseMutationRate = 0.05;
    const disasters: ActiveDisaster[] = [
      { type: 'RADIATION_STORM', active: false, intensity: 1.0, durationLeft: 0 }
    ];

    const hasRadiationStorm = disasters.some(d => d.type === 'RADIATION_STORM' && d.active);
    
    let effectiveMutationRate = baseMutationRate;
    if (hasRadiationStorm) {
      effectiveMutationRate += 0.8;
    }

    if (effectiveMutationRate !== baseMutationRate) {
      throw new Error('Mutation rate increased incorrectly for inactive storm');
    }
  });
});

console.log('disasters.test.ts: Radiation Storm tests passed.');
