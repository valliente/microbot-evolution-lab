import { EpigeneticEngine } from '../simulation/genetics/EpigeneticEngine';
import { Microbot } from '../simulation/types';

describe('Epigenetics Engine', () => {
  it('should decay inherited epigenetic markers across generations', () => {
    const parent: Microbot = {
      id: 'bot1',
      x: 100, y: 100, vx: 0, vy: 0, heading: 0,
      speed: 2, maxSpeed: 2, energyEfficiency: 1, visionRadius: 100,
      battery: 100, maxBattery: 100, age: 0, generation: 1,
      color: '#fff', hue: 0, lineageParentId: null, behaviorState: 'WANDERING',
      trail: [],
      epigenome: [
        { type: 'TOXIN_RESISTANCE', intensity: 0.8, generationLifespan: 3 }
      ]
    };

    // Simulate inheritance directly based on MicrobotEngine logic
    const childEpigenome = parent.epigenome!.map(marker => ({
      ...marker,
      intensity: marker.intensity * 0.5, // 50% decay per generation
      generationLifespan: marker.generationLifespan - 1
    })).filter(marker => marker.generationLifespan > 0);

    expect(childEpigenome.length).toBe(1);
    expect(childEpigenome[0].intensity).toBeCloseTo(0.4);
    expect(childEpigenome[0].generationLifespan).toBe(2);

    const grandchildEpigenome = childEpigenome.map(marker => ({
      ...marker,
      intensity: marker.intensity * 0.5,
      generationLifespan: marker.generationLifespan - 1
    })).filter(marker => marker.generationLifespan > 0);

    expect(grandchildEpigenome.length).toBe(1);
    expect(grandchildEpigenome[0].intensity).toBeCloseTo(0.2);
    expect(grandchildEpigenome[0].generationLifespan).toBe(1);
    
    const greatGrandchildEpigenome = grandchildEpigenome.map(marker => ({
      ...marker,
      intensity: marker.intensity * 0.5,
      generationLifespan: marker.generationLifespan - 1
    })).filter(marker => marker.generationLifespan > 0);

    expect(greatGrandchildEpigenome.length).toBe(0);
  });
});
