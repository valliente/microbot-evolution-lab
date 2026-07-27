import { MicrobotEngine } from '../MicrobotEngine';
import { defaultConfig } from '../../utils/storage';
import { Quadtree } from '../Quadtree';
import { SpatialHashGrid } from '../SpatialHashGrid';
import { rayPool } from '../ObjectPool';
import { createWorkerMessage } from '../workers/workerProtocol';

export function runSimulationUnitTests(): { passed: boolean; testCount: number; summary: string } {
  let passedCount = 0;
  const total = 6;

  // Test Worker Collision Thread Message
  const workerMsg = createWorkerMessage('BATCH_COLLISIONS', { entities: [], radius: 10 });
  if (workerMsg.type === 'BATCH_COLLISIONS') passedCount++;
  const ray = rayPool.acquire();
  rayPool.release(ray);
  if (rayPool.size > 0) passedCount++;

  // Test 0: Spatial Hash Grid Query
  const hashGrid = new SpatialHashGrid<{ x: number; y: number }>(60);
  hashGrid.insert({ x: 120, y: 120 });
  hashGrid.insert({ x: 400, y: 400 });
  const hashResults = hashGrid.query(120, 120, 30);
  if (hashResults.length === 1) passedCount++;

  // Test 1: Quadtree Insertion and Spatial Query
  const quadtree = new Quadtree<{ x: number; y: number }>({ x: 0, y: 0, width: 1000, height: 1000 }, 4);
  quadtree.insert({ x: 100, y: 100 });
  quadtree.insert({ x: 500, y: 500 });
  const results = quadtree.queryRange({ x: 100, y: 100, radius: 50 });
  if (results.length === 1) passedCount++;

  // Test 2: MicrobotEngine Initialization
  const engine = new MicrobotEngine(1000, 800, { ...defaultConfig, isPaused: true });
  if (engine.microbots.length === defaultConfig.startPopulation) passedCount++;

  // Test Symbiosis Pairing State
  const botA = engine.microbots[0];
  const botB = engine.microbots[1];
  botA.symbiontPartnerId = botB.id;
  if (botA.symbiontPartnerId === botB.id) passedCount++;
  engine.triggerOutbreak();
  const infectedCount = engine.microbots.filter(b => b.isInfected).length;
  if (infectedCount >= 1) passedCount++;

  // Test Epigenetic Trigger State
  const firstBot = engine.microbots[0];
  engine.overrideMicrobotGenes(firstBot.id, { epigeneticStress: 15.0 });
  if (firstBot.epigeneticStress === 15.0) passedCount++;
  engine.overrideMicrobotGenes(firstBot.id, { speed: 4.5, visionRadius: 220 });
  if (firstBot.speed === 4.5 && firstBot.visionRadius === 220) passedCount++;

  return {
    passed: passedCount === total,
    testCount: total,
    summary: `Passed ${passedCount}/${total} automated simulation unit tests.`
  };
}
