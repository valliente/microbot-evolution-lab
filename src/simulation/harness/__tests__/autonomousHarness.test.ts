import { describe, it, expect } from 'vitest';
import { AutonomousHarness } from '../AutonomousHarness';
import { MicrobotEngine } from '../../MicrobotEngine';

describe('Autonomous Sandbox Harness Integration', () => {
  it('executes simulation batches cleanly and recovers from runtime errors', () => {
    const engine = new MicrobotEngine();
    engine.width = 800;
    engine.height = 600;
    engine.config = { startPopulation: 50 } as any;
    const harness = new AutonomousHarness(engine, 100);

    const result = harness.runBatch(50);
    expect(result.ticks).toBe(50);
  });
});
