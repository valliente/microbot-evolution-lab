export type ActivationFunctionType = 'ReLU' | 'Sigmoid' | 'Tanh' | 'Linear';

export interface RecurrentNodeState {
  id: string;
  value: number;
  recurrentMemory: number;
  activation: ActivationFunctionType;
  layer: number;
}

export interface NASBrainGenome {
  nodes: RecurrentNodeState[];
  connections: Array<{
    from: string;
    to: string;
    weight: number;
    isRecurrent: boolean;
  }>;
  layerDepth: number;
  passiveEnergyCost: number;
}

export class NASBrainManager {
  public static evaluateActivation(x: number, type: ActivationFunctionType): number {
    switch (type) {
      case 'ReLU':
        return Math.max(0, x);
      case 'Sigmoid':
        return 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, x))));
      case 'Tanh':
        return Math.tanh(x);
      case 'Linear':
      default:
        return x;
    }
  }

  public static calculatePassiveEnergyCost(brain: NASBrainGenome): number {
    const nodeCount = brain.nodes.length;
    const connectionCount = brain.connections.length;
    const recurrentCount = brain.connections.filter(c => c.isRecurrent).length;
    return (nodeCount * 0.05) + (connectionCount * 0.02) + (recurrentCount * 0.08);
  }

  public static mutateBrain(brain: NASBrainGenome, mutationRate: number): NASBrainGenome {
    const funcs: ActivationFunctionType[] = ['ReLU', 'Sigmoid', 'Tanh', 'Linear'];
    
    const mutatedNodes = brain.nodes.map(node => {
      if (Math.random() < mutationRate) {
        const available = funcs.filter(f => f !== node.activation);
        const nextFunc = available[Math.floor(Math.random() * available.length)];
        return { ...node, activation: nextFunc };
      }
      return node;
    });

    const mutatedConnections = brain.connections.map(conn => {
      if (Math.random() < mutationRate) {
        const delta = (Math.random() - 0.5) * 0.4;
        return { ...conn, weight: conn.weight + delta };
      }
      return conn;
    });

    const updatedBrain: NASBrainGenome = {
      ...brain,
      nodes: mutatedNodes,
      connections: mutatedConnections,
      passiveEnergyCost: 0
    };
    updatedBrain.passiveEnergyCost = NASBrainManager.calculatePassiveEnergyCost(updatedBrain);
    return updatedBrain;
  }

  public static evaluateForwardPass(brain: NASBrainGenome, inputs: number[]): { outputs: number[]; updatedBrain: NASBrainGenome } {
    const nodes = brain.nodes.map(n => ({ ...n }));
    // Feed inputs to layer 0 nodes
    nodes.filter(n => n.layer === 0).forEach((n, idx) => {
      if (idx < inputs.length) {
        n.value = inputs[idx];
      }
    });

    const maxLayer = Math.max(1, ...nodes.map(n => n.layer));
    for (let l = 1; l <= maxLayer; l++) {
      const layerNodes = nodes.filter(n => n.layer === l);
      for (const node of layerNodes) {
        let sum = 0;
        const incoming = brain.connections.filter(c => c.to === node.id);
        for (const conn of incoming) {
          const sourceNode = nodes.find(n => n.id === conn.from);
          if (sourceNode) {
            const inputVal = conn.isRecurrent ? sourceNode.recurrentMemory : sourceNode.value;
            sum += inputVal * conn.weight;
          }
        }
        // LSTM recurrent cell update
        const forgetGate = 1 / (1 + Math.exp(-sum));
        node.recurrentMemory = (node.recurrentMemory * forgetGate) + (1 - forgetGate) * Math.tanh(sum);
        node.value = NASBrainManager.evaluateActivation(sum + node.recurrentMemory, node.activation);
      }
    }

    const outputNodes = nodes.filter(n => n.layer === maxLayer);
    const outputs = outputNodes.map(n => n.value);

    return {
      outputs,
      updatedBrain: {
        ...brain,
        nodes,
        layerDepth: maxLayer
      }
    };
  }

  public static evaluateForwardPassFast(brain: NASBrainGenome, inputs: Float32Array): Float32Array {
    const nodeValues = new Float32Array(brain.nodes.length);
    for (let i = 0; i < Math.min(inputs.length, brain.nodes.length); i++) {
      nodeValues[i] = inputs[i];
    }

    const outputs = new Float32Array(2);
    outputs[0] = Math.tanh(nodeValues[0] || 0);
    outputs[1] = Math.tanh(nodeValues[1] || 0);
    return outputs;
  }
}
