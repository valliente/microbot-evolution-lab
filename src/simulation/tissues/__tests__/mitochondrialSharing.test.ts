import { describe, it, expect } from 'vitest';
import { MulticellularManager, MulticellularCluster } from '../MulticellularManager';

describe('Mitochondrial Core Energy Sharing', () => {
  it('redistributes surplus energy evenly across cluster members', () => {
    const manager = new MulticellularManager();
    const cluster: MulticellularCluster = {
      clusterId: 'cluster1',
      memberIds: ['bot1', 'bot2'],
      primaryRole: 'MITOCHONDRIAL_CORE',
      sharedEnergyPool: 50,
      maxSharedEnergy: 200,
      totalIntegrity: 1.0,
      propulsionVector: { x: 0, y: 0 }
    };

    const updated = manager.redistributeClusterEnergy(cluster, [10, 80], [100, 100]);
    expect(updated.length).toBe(2);
    expect(updated[0]).toBeGreaterThan(10);
  });
});
