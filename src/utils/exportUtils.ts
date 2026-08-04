import { MicrobotEngine } from '../simulation/MicrobotEngine';

export function exportSpeciationAndPheromoneProfiles(engine: MicrobotEngine): void {
  

  const data = {
    timestamp: new Date().toISOString(),
    generation: engine.generationCount,
    speciationThreshold: 0.4,
    hybridInfertilityPenalty: 1.0,
    pheromoneGrid: engine.pheromoneGrid ? {
      cols: engine.pheromoneGrid.cols,
      rows: engine.pheromoneGrid.rows,
      bufferLength: engine.pheromoneGrid.buffer.length
      // Omit dumping full Float32Array to save JSON payload size, or dump optionally
    } : null,
    species: [] as any[]
  };

  const speciesMap = new Map<number, number>();
  for (const bot of engine.microbots) {
    if (bot.speciesId) {
      speciesMap.set(bot.speciesId, (speciesMap.get(bot.speciesId) || 0) + 1);
    }
  }

  speciesMap.forEach((count, id) => {
    data.species.push({ speciesId: id, population: count });
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `microbot_speciation_profile_gen${engine.generationCount}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
