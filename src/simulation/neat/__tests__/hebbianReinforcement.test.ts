import { describe, it, expect } from 'vitest';
import { NeuralPlasticityManager } from '../NeuralPlasticityManager';

describe('Hebbian Synaptic Weight Reinforcement', () => {
  it('adjusts connection weights on positive reward events', () => {
    const manager = new NeuralPlasticityManager(0.1, 0.9);
    const connections = manager.createInitialWeights(2, 2);
    const initialWeight = connections[0].weight;

    manager.adjustWeightsOnEvent(connections, [1.0, 0.5], [1.0, 0.5], 1.0);
    expect(connections[0].weight).toBeGreaterThan(initialWeight);
  });
});
