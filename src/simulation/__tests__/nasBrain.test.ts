import { describe, it, expect } from 'vitest';
import { NASBrainManager, NASBrainGenome } from '../genetics/NASBrainManager';

describe('NASBrainManager Recurrent Evaluation', () => {
  it('should evaluate recurrent memory node forward passes correctly', () => {
    const sampleBrain: NASBrainGenome = {
      nodes: [
        { id: 'in1', value: 0, recurrentMemory: 0, activation: 'Linear', layer: 0 },
        { id: 'rec1', value: 0, recurrentMemory: 0.5, activation: 'Tanh', layer: 1 }
      ],
      connections: [
        { from: 'in1', to: 'rec1', weight: 1.2, isRecurrent: true }
      ],
      layerDepth: 1,
      passiveEnergyCost: 0.15
    };

    const res = NASBrainManager.evaluateForwardPass(sampleBrain, [1.0]);
    expect(res.outputs).toBeDefined();
    expect(res.updatedBrain.nodes[1].recurrentMemory).not.toBe(0);
  });

  it('should calculate passive battery drain scaling with node and connection count', () => {
    const complexBrain: NASBrainGenome = {
      nodes: [
        { id: 'n1', value: 0, recurrentMemory: 0, activation: 'ReLU', layer: 0 },
        { id: 'n2', value: 0, recurrentMemory: 0, activation: 'Sigmoid', layer: 1 },
        { id: 'n3', value: 0, recurrentMemory: 0, activation: 'Tanh', layer: 2 }
      ],
      connections: [
        { from: 'n1', to: 'n2', weight: 0.5, isRecurrent: false },
        { from: 'n2', to: 'n3', weight: 1.0, isRecurrent: true }
      ],
      layerDepth: 2,
      passiveEnergyCost: 0
    };

    const cost = NASBrainManager.calculatePassiveEnergyCost(complexBrain);
    expect(cost).toBeGreaterThan(0.2);
  });
});
