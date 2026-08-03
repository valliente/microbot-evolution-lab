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
});
