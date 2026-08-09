export interface SynapticConnection {
  fromNode: number;
  toNode: number;
  weight: number;
  eligibilityTrace: number;
  learningRate: number;
}

export interface NeuralTraceBuffer {
  inputsHistory: number[][];
  outputsHistory: number[][];
  rewardsHistory: number[];
  maxTraceLength: number;
}

export class NeuralPlasticityManager {
  private learningRate: number;
  private traceDecay: number;

  constructor(learningRate: number = 0.05, traceDecay: number = 0.9) {
    this.learningRate = learningRate;
    this.traceDecay = traceDecay;
  }

  public createInitialWeights(inputCount: number, outputCount: number): SynapticConnection[] {
    const connections: SynapticConnection[] = [];
    for (let i = 0; i < inputCount; i++) {
      for (let j = 0; j < outputCount; j++) {
        connections.push({
          fromNode: i,
          toNode: j,
          weight: (Math.random() * 2 - 1) * 0.5,
          eligibilityTrace: 0.0,
          learningRate: this.learningRate
        });
      }
    }
    return connections;
  }

  public createTraceBuffer(maxLength: number = 10): NeuralTraceBuffer {
    return {
      inputsHistory: [],
      outputsHistory: [],
      rewardsHistory: [],
      maxTraceLength: maxLength
    };
  }

  public adjustWeightsOnEvent(
    connections: SynapticConnection[],
    inputs: number[],
    outputs: number[],
    rewardOrPainDelta: number
  ): void {
    for (const conn of connections) {
      const inVal = inputs[conn.fromNode] || 0;
      const outVal = outputs[conn.toNode] || 0;
      // Hebbian rule: Δw = η * r * (input * output)
      const hebbianDelta = conn.learningRate * rewardOrPainDelta * (inVal * outVal);
      conn.weight += hebbianDelta;
      // Strict clamping guards [-3.0, 3.0]
      conn.weight = Math.max(-3.0, Math.min(3.0, conn.weight));
      conn.eligibilityTrace = conn.eligibilityTrace * this.traceDecay + Math.abs(hebbianDelta);
    }
  }
}
