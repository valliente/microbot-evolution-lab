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

  public pushTraceStep(buffer: NeuralTraceBuffer, inputs: number[], outputs: number[], reward: number): void {
    buffer.inputsHistory.push([...inputs]);
    buffer.outputsHistory.push([...outputs]);
    buffer.rewardsHistory.push(reward);
    if (buffer.inputsHistory.length > buffer.maxTraceLength) {
      buffer.inputsHistory.shift();
      buffer.outputsHistory.shift();
      buffer.rewardsHistory.shift();
    }
  }

  public evaluateMemoryTrace(buffer: NeuralTraceBuffer): number {
    if (buffer.rewardsHistory.length === 0) return 0;
    let sum = 0;
    let weight = 1.0;
    for (let i = buffer.rewardsHistory.length - 1; i >= 0; i--) {
      sum += buffer.rewardsHistory[i] * weight;
      weight *= this.traceDecay;
    }
    return sum;
  }

  public applyIntraGenerationalDecay(connections: SynapticConnection[], botAge: number, halfLifeAge: number = 500): void {
    // Learning decay over bot lifetime: η(t) = η_0 / (1 + t / halfLife)
    const currentRate = this.learningRate / (1 + botAge / halfLifeAge);
    for (const conn of connections) {
      conn.learningRate = Math.max(0.001, currentRate);
      conn.eligibilityTrace *= this.traceDecay;
    }
  }

  public packSynapticWeightsToFloat32(connections: SynapticConnection[], outBuffer: Float32Array): void {
    for (let i = 0; i < connections.length && i < outBuffer.length; i++) {
      outBuffer[i] = connections[i].weight;
    }
  }
}
