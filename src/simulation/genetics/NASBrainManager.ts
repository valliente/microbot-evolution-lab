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
    const mutatedNodes = brain.nodes.map(node => {
      if (Math.random() < mutationRate) {
        const funcs: ActivationFunctionType[] = ['ReLU', 'Sigmoid', 'Tanh'];
        const nextFunc = funcs[Math.floor(Math.random() * funcs.length)];
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
}
