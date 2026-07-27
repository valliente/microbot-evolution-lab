import { MicrobotEngine } from '../MicrobotEngine';
import { defaultConfig } from '../../utils/storage';
import { Quadtree } from '../Quadtree';

export function runSimulationUnitTests(): { passed: boolean; testCount: number; summary: string } {
  let passedCount = 0;
  const total = 4;

  // Test 1: Quadtree Insertion and Spatial Query
  const quadtree = new Quadtree<{ x: number; y: number }>({ x: 0, y: 0, width: 1000, height: 1000 }, 4);
  quadtree.insert({ x: 100, y: 100 });
  quadtree.insert({ x: 500, y: 500 });
  const results = quadtree.queryRange({ x: 100, y: 100, radius: 50 });
  if (results.length === 1) passedCount++;

  // Test 2: MicrobotEngine Initialization
  const engine = new MicrobotEngine(1000, 800, { ...defaultConfig, isPaused: true });
  if (engine.microbots.length === defaultConfig.startPopulation) passedCount++;

  // Test 3: Viral Outbreak Trigger
  engine.triggerOutbreak();
  const infectedCount = engine.microbots.filter(b => b.isInfected).length;
  if (infectedCount >= 1) passedCount++;

  // Test 4: Gene Overrides
  const firstBot = engine.microbots[0];
  engine.overrideMicrobotGenes(firstBot.id, { speed: 4.5, visionRadius: 220 });
  if (firstBot.speed === 4.5 && firstBot.visionRadius === 220) passedCount++;

  return {
    passed: passedCount === total,
    testCount: total,
    summary: `Passed ${passedCount}/${total} automated simulation unit tests.`
  };
}
