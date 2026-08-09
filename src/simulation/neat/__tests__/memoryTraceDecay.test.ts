import { describe, it, expect } from 'vitest';
import { NeuralPlasticityManager } from '../NeuralPlasticityManager';

describe('Lifetime Learning Memory Trace Decay', () => {
  it('applies intra-generational decay based on bot age', () => {
    const manager = new NeuralPlasticityManager(0.1, 0.9);
    const connections = manager.createInitialWeights(2, 2);

    manager.applyIntraGenerationalDecay(connections, 500, 500);
    expect(connections[0].learningRate).toBeLessThan(0.1);
  });
});
