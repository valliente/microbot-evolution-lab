import { describe, it, expect } from 'vitest';
import { EpigeneticEngine } from '../genetics/EpigeneticEngine';
import { EpigeneticMarker } from '../types';

describe('Epigenetic Engine & Inheritance Decay', () => {
  it('correctly modulates gene expression based on stress threshold', () => {
    const ee = EpigeneticEngine.getInstance();
    const markers = ee.getDefaultMarkers();
    const mockBot: any = {
      speed: 2.0,
      maxSpeed: 2.0,
      energyEfficiency: 1.0,
      epigenome: markers
    };

    ee.modulateGeneExpression(mockBot, 0.8);
    expect(mockBot.epigenome[0].activationLevel).toBeGreaterThan(0);
  });

  it('decays epigenetic trait activation across generations', () => {
    const ee = EpigeneticEngine.getInstance();
    const parentMarkers: EpigeneticMarker[] = [
      { geneId: 'SPEED', activationLevel: 1.0, heritability: 1.0, stressThreshold: 0.4 }
    ];

    const childMarkers = ee.inheritEpigenome(parentMarkers, 0.85);
    expect(childMarkers[0].activationLevel).toBeCloseTo(0.85);
  });
});
