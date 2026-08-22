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

export function exportEpigeneticsAndStateProfiles(engine: MicrobotEngine): void {
  const data = {
    timestamp: new Date().toISOString(),
    generation: engine.generationCount,
    totalMicrobots: engine.microbots.length,
    epigeneticProfiles: engine.microbots.map(bot => ({
      id: bot.id,
      speciesId: bot.speciesId,
      battery: bot.battery,
      epigenome: bot.epigenome || []
    }))
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `microbot_epigenetics_profile_gen${engine.generationCount}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportPhenotypeAndWASMProfiles(engine: MicrobotEngine): void {
  const data = {
    timestamp: new Date().toISOString(),
    generation: engine.generationCount,
    totalMicrobots: engine.microbots.length,
    wasmStatus: 'ENABLED',
    phenotypes: engine.microbots.map(bot => ({
      id: bot.id,
      radius: (bot as any).radius || 6,
      color: bot.color,
      generation: bot.generation,
      meshGeometry: 'DYNAMIC_MORPHING_SHAPE'
    }))
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `microbot_phenotype_wasm_profile_gen${engine.generationCount}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportOrganelleAndBiomeProfiles(engine: any): void {
  const data = {
    timestamp: new Date().toISOString(),
    generation: engine.generationCount,
    totalBots: engine.microbots.length,
    organelles: engine.microbots.map((b: any) => ({
      id: b.id,
      count: b.organelles ? b.organelles.length : 0,
      hasMDNA: !!b.mitochondrialDNA
    })),
    biomes: ['VISCOUS_SWAMP', 'RADIATION_ZONE', 'THERMAL_VENT', 'CRYSTAL_SHALLOWS']
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `organelle_biome_profile_gen${engine.generationCount}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSynapticAndCataclysmProfiles(engine: any): void {
  const data = {
    timestamp: new Date().toISOString(),
    generation: engine.generationCount,
    totalBots: engine.microbots.length,
    cataclysmState: engine.cataclysmManager ? engine.cataclysmManager.getActiveEvent() : null,
    synapticProfiles: engine.microbots.slice(0, 50).map((b: any) => ({
      id: b.id,
      age: b.age,
      generation: b.generation,
      energyCollected: b.energyCollected
    }))
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `synaptic_cataclysm_profile_gen${engine.generationCount}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportViralAndClimateProfiles(engine: any): void {
  const data = {
    timestamp: new Date().toISOString(),
    generation: engine.generationCount,
    totalBots: engine.microbots.length,
    climateState: engine.atmosphereManager ? engine.atmosphereManager.currentCondition : null,
    viralSporesCount: engine.viralManager ? engine.viralManager.viralSpores.length : 0,
    infectedBotsCount: engine.microbots.filter((b: any) => b.immunity && b.immunity.isInfected).length
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `viral_climate_profile_gen${engine.generationCount}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTissueAndOpticalProfiles(engine: any): void {
  const data = {
    timestamp: new Date().toISOString(),
    generation: engine.generationCount,
    totalBots: engine.microbots.length,
    multicellularClustersCount: engine.multicellularManager ? engine.multicellularManager.clusters.size : 0,
    activeBindingsCount: engine.multicellularManager ? engine.multicellularManager.bindings.length : 0,
    multicellularBotsCount: engine.microbots.filter((b: any) => b.clusterId).length
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tissue_optical_profile_gen${engine.generationCount}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportQuorumAndHydroProfiles(engine: any): void {
  const data = {
    timestamp: new Date().toISOString(),
    generation: engine.generationCount,
    totalBots: engine.microbots.length,
    activePulsesCount: engine.quorumManager ? engine.quorumManager.pulses.length : 0,
    fluidGridSize: engine.fluidField ? `${engine.fluidField.cols}x${engine.fluidField.rows}` : '0x0'
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quorum_hydro_profile_gen${engine.generationCount}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
