import { 
  Microbot, EnergyParticle, HazardZone, SimulationConfig, 
  SimulationStats, SpeedField, GravityWell, FluidZone, CatalystZone,
  SectorBiome, EnvironmentalDisaster, PortalNode, ParasiticSpore, MeteorStrike, VoidRift, Season, ResourceType
} from './types';
import { SpatialGrid } from './SpatialGrid';
import { Quadtree } from './Quadtree';
import { PheromoneGrid } from './pheromones/PheromoneGrid';
import { SpeciationManager } from './genetics/SpeciationManager';
import { SpatialHashGrid } from './SpatialHashGrid';
import { spatialAudio } from '../audio/SpatialAudioSynth';
import { calculateSteering } from './steering';
import { EpigeneticEngine } from './genetics/EpigeneticEngine';
import { EpigeneticMarker } from './types';
import { disasterParticlePool, PooledDisasterParticle } from './ObjectPool';
import { ccdSubstep, sanitizeVector, clamp } from './physics';
import { Guardrails } from './physics/Guardrails';
import { ThreadManager } from './workers/ThreadManager';
import { ChemicalGrid } from './pheromones/ChemicalGrid';
import { PlanetaryCataclysmManager } from './cataclysms/PlanetaryCataclysmManager';

export class MicrobotEngine {
  public width: number;
  public height: number;
  public config: SimulationConfig;

  public microbots: Microbot[] = [];
  public energyParticles: EnergyParticle[] = [];
  public hazards: HazardZone[] = [];
  public speedFields: SpeedField[] = [];
  public fluidZones: FluidZone[] = [];
  public gravityWells: GravityWell[] = [];
  public catalystZones: CatalystZone[] = [];
  public chemicalGrid!: ChemicalGrid;
  public pheromoneGrid!: PheromoneGrid;
  public meteors: MeteorStrike[] = [];
  public voidRifts: VoidRift[] = [];
  public portals: PortalNode[] = [];
  public biomes: SectorBiome[] = [];
  public spores: ParasiticSpore[] = [];
  public cataclysmManager: PlanetaryCataclysmManager = new PlanetaryCataclysmManager();
  public activeDisasters: EnvironmentalDisaster[] = [];
  public disasterParticles: PooledDisasterParticle[] = [];
  public selectedMicrobotId: string | null = null;
  public threadManager: ThreadManager;
  public wasmModule: any = null;
  public energyPositionsX: Float32Array = new Float32Array(5000);
  public energyPositionsY: Float32Array = new Float32Array(5000);
  public raycastBuffer: Float32Array = new Float32Array(100);

  public spatialGrid: SpatialGrid;
  public spatialHash: SpatialHashGrid<EnergyParticle>;
  public totalBirths: number = 0;
  public totalDeaths: number = 0;
  public generationCount: number = 1;
  public frameCount: number = 0;
  public seasonFrameCount: number = 0;
  public disasterTimer: number = 0;
  public readonly SEASON_DURATION_FRAMES = 2700; // ~45 seconds per season at 60 FPS

  // Ring buffers for telemetry analytics
  public populationHistory: number[] = new Array(30).fill(45);
  public birthHistory: number[] = new Array(30).fill(0);
  public deathHistory: number[] = new Array(30).fill(0);
  public historyTimeline: SimulationStats['historyTimeline'] = [];
  public positionBuffer: SharedArrayBuffer;
  public positionsView: Float32Array;
  
  private lastFrameTime: number = performance.now();
  private actualTPS: number = 0;

  private recentBirths: number = 0;
  private recentDeaths: number = 0;
  private nextBotIdNum: number = 1;
  private nextFoodIdNum: number = 1;
  private nextFieldIdNum: number = 1;

  // Telemetry buffer for speciation
  private speciationDiversityBuffer = new Float32Array(100);
  private speciationDiversityIndex = 0;

  constructor(width: number, height: number, config: SimulationConfig) {
    this.width = width;
    this.height = height;
    this.config = config;
    this.spatialGrid = new SpatialGrid(width, height, 100);
    this.threadManager = new ThreadManager();
    // Initialize Web Worker for physics collisions if configured
    this.threadManager.initWorker(new URL('./workers/simulationWorker.ts', import.meta.url));
    this.spatialHash = new SpatialHashGrid<EnergyParticle>(60);
    this.chemicalGrid = new ChemicalGrid(width, height, 20);
    
    // Allocate 1000 bots * 2 coords (x,y) * 4 bytes
    this.positionBuffer = new SharedArrayBuffer(1000 * 2 * 4);
    this.positionsView = new Float32Array(this.positionBuffer);
    
    this.generateBiomes();
    this.initWASM();

    this.resetSimulation();
  }

  public async initWASM(): Promise<void> {
    try {
      const response = await fetch('./physics.wasm');
      const buffer = await response.arrayBuffer();
      const module = await WebAssembly.instantiate(buffer, {
        env: {
          abort: () => console.log('WASM abort')
        }
      });
      this.wasmModule = module.instance.exports;
      console.log('WASM Physics Module initialized successfully.');
    } catch (e) {
      console.error('Failed to initialize WASM module:', e);
    }
  }

  public generateBiomes(): void {
    this.biomes = [];
    const cols = 2;
    const rows = 2;
    const sectorWidth = this.width / cols;
    const sectorHeight = this.height / rows;

    const biomeTypes: SectorBiome['type'][] = ['NORMAL', 'TOXIC_SLUDGE', 'CRYO_ZONE', 'HIGH_G_FIELD'];
    
    // Shuffle biome types
    for (let i = biomeTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [biomeTypes[i], biomeTypes[j]] = [biomeTypes[j], biomeTypes[i]];
    }

    let typeIndex = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const type = biomeTypes[typeIndex % biomeTypes.length];
        let color = 'rgba(255,255,255,0)';
        if (type === 'TOXIC_SLUDGE') color = 'rgba(163, 230, 53, 0.05)';
        if (type === 'CRYO_ZONE') color = 'rgba(56, 189, 248, 0.05)';
        if (type === 'HIGH_G_FIELD') color = 'rgba(244, 63, 94, 0.05)';

        this.biomes.push({
          id: `biome-${i}-${j}`,
          type,
          x: i * sectorWidth,
          y: j * sectorHeight,
          width: sectorWidth,
          height: sectorHeight,
          color
        });
        typeIndex++;
      }
    }
  }

  public getBiomeAt(x: number, y: number): SectorBiome | undefined {
    return this.biomes.find(b => x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height);
  }

  public resetSimulation(): void {
    this.microbots = [];
    this.energyParticles = [];
    this.hazards = [];
    this.speedFields = [];
    this.fluidZones = [];
    this.gravityWells = [];
    this.catalystZones = [];
    this.chemicalGrid.reset();
    this.portals = [];
    this.activeDisasters = [];
    this.selectedMicrobotId = null;
    this.totalBirths = 0;
    this.totalDeaths = 0;
    this.generationCount = 1;
    this.nextBotIdNum = 1;
    this.frameCount = 0;
    this.seasonFrameCount = 0;
    this.lastFrameTime = performance.now();
    this.actualTPS = 0;
    this.historyTimeline = [];
    
    // Fix(memory): dispose orphaned Web Worker contexts to prevent RAM growth over time
    // Initialize Web Worker for background physics calculations
    this.threadManager.terminate();
    this.threadManager = new ThreadManager();
    this.threadManager.initWorker(new URL('./workers/simulationWorker.ts', import.meta.url));

    this.spatialGrid.clear();
    this.nextFieldIdNum = 1;
    this.recentBirths = 0;
    this.recentDeaths = 0;

    this.populationHistory = new Array(30).fill(this.config.startPopulation);
    this.birthHistory = new Array(30).fill(0);
    this.deathHistory = new Array(30).fill(0);
    this.historyTimeline = [];

    // Spawn initial population
    for (let i = 0; i < this.config.startPopulation; i++) {
      this.spawnMicrobot();
    }

    // Spawn initial energy particles
    this.spawnMultipleFood(80);

    // Spawn hazards
    this.updateHazardsCount();

    // Auto select first bot
    if (this.microbots.length > 0) {
      this.selectedMicrobotId = this.microbots[0].id;
    }
  }

  public exportSyntheticRulesets(): string {
    return JSON.stringify({
      version: '0.1.224',
      timestamp: Date.now(),
      gravityWells: this.gravityWells,
      speedFields: this.speedFields,
      fluidZones: this.fluidZones,
    }, null, 2);
  }

  public exportNASBrainArchitectures(): string {
    const architectures = this.microbots.map(bot => ({
      botId: bot.id,
      nasBrain: bot.nasBrain,
      organelles: bot.organelles,
      mitochondrialDNA: bot.mitochondrialDNA
    })).filter(b => b.nasBrain || (b.organelles && b.organelles.length > 0));

    return JSON.stringify({
      version: '0.1.224',
      timestamp: Date.now(),
      architectures
    }, null, 2);
  }

  public exportState(): string {
    const state = {
      microbots: this.microbots,
      energyParticles: this.energyParticles,
      hazards: this.hazards,
      speedFields: this.speedFields,
      fluidZones: this.fluidZones,
      gravityWells: this.gravityWells,
      catalystZones: this.catalystZones,
      chemicalGridBuffer: Array.from(this.chemicalGrid.buffer),
      meteors: this.meteors,
      activeDisasters: this.activeDisasters,
      config: this.config,
      stats: {
        totalBirths: this.totalBirths,
        totalDeaths: this.totalDeaths,
        generationCount: this.generationCount,
        frameCount: this.frameCount
      }
    };
    return btoa(JSON.stringify(state));
  }

  public importState(hash: string): void {
    try {
      const state = JSON.parse(atob(hash));
      this.microbots = state.microbots || [];
      this.energyParticles = state.energyParticles || [];
      this.hazards = state.hazards || [];
      this.speedFields = state.speedFields || [];
      this.fluidZones = state.fluidZones || [];
      this.gravityWells = state.gravityWells || [];
      this.catalystZones = state.catalystZones || [];
      if (state.chemicalGridBuffer) {
        this.chemicalGrid.buffer.set(state.chemicalGridBuffer);
      }
      this.meteors = state.meteors || [];
      this.activeDisasters = state.activeDisasters || [];
      this.config = { ...this.config, ...state.config };
      
      if (state.stats) {
        this.totalBirths = state.stats.totalBirths;
        this.totalDeaths = state.stats.totalDeaths;
        this.generationCount = state.stats.generationCount;
        this.frameCount = state.stats.frameCount;
      }
      
      this.nextBotIdNum = this.microbots.length + 1;
      this.nextFoodIdNum = this.energyParticles.length + 1;
      
      console.log('Successfully imported ecosystem state');
    } catch (e) {
      console.error('Failed to import state hash:', e);
    }
  }

  public resize(width: number, height: number): void {
    this.width = Math.max(400, width);
    this.height = Math.max(400, height);
    this.spatialGrid = new SpatialGrid(this.width, this.height, 60);
    this.chemicalGrid = new ChemicalGrid(this.width, this.height, 20);
    this.pheromoneGrid = new PheromoneGrid(this.width, this.height, 10);
    this.spatialHash = new SpatialHashGrid(80);
    this.generateBiomes();
  }

  public spawnMicrobot(parentA?: Microbot, parentB?: Microbot): Microbot {
    const id = `MB-${String(this.nextBotIdNum++).padStart(4, '0')}`;

    let x = Math.random() * (this.width - 100) + 50;
    let y = Math.random() * (this.height - 100) + 50;
    let speed = 2.0 + (Math.random() - 0.5) * 0.5;
    let turnRate = 0.1 + (Math.random() - 0.5) * 0.04;
    let visionRadius = 120 + (Math.random() - 0.5) * 30;
    let maxBattery = 100;
    let energyEfficiency = 1.0;
    let hue = 185; // Cyan default
    let generation = 1;
    let parentId: string | null = null;
    let armorGene = Math.random() * 0.5; // 0 to 0.5 (up to 50% reduction)
    let inkGlandGene = Math.random() > 0.8 ? 1 : 0; // 20% chance to have ink
    let panicGene = Math.random() * 0.8 + 1.0; // 1.0 to 1.8x speed burst
    let inheritedEpigenome: EpigeneticMarker[] = [
      { geneId: 'SPEED_BOOST', activationLevel: 0, heritability: 0.3, stressThreshold: 8.0 },
      { geneId: 'VISION_BOOST', activationLevel: 0, heritability: 0.2, stressThreshold: 6.0 }
    ];

    if (parentA) {
      x = parentA.x + (Math.random() - 0.5) * 20;
      y = parentA.y + (Math.random() - 0.5) * 20;
      // Fix(genetics): correct generation counting logic
      generation = parentA.generation + 1;
      parentId = parentA.id;
      parentA.offspringCount++;

      // Inherit species ID
      
      
      
      
      if (parentB) {
        parentB.offspringCount++;
        
        
        
      }
      
      if (generation > this.generationCount) {
        this.generationCount = generation;
      }

      const seasonMutMult = this.config.currentSeason === 'AUTUMN' ? 1.5 : 1.0;
      const mut = this.config.mutationRate * seasonMutMult;
      
      // Fix(genetics): strict boundaries and NaN prevention for chromosome values
      speed = clamp(sanitizeVector(parentA.speed + (Math.random() - 0.5) * mut * 1.5), 1.0, 5.0);
      turnRate = clamp(sanitizeVector(parentA.turnRate + (Math.random() - 0.5) * mut * 0.1), 0.04, 0.3);
      visionRadius = clamp(sanitizeVector(parentA.visionRadius + (Math.random() - 0.5) * mut * 50), 60, 260);
      energyEfficiency = clamp(sanitizeVector(parentA.energyEfficiency + (Math.random() - 0.5) * mut * 0.4), 0.6, 2.5);
      hue = sanitizeVector((parentA.hue + (Math.random() - 0.5) * mut * 80 + 360) % 360);
      
      armorGene = clamp((parentA.armorGene || 0) + (Math.random() - 0.5) * mut * 0.2, 0, 0.8);
      inkGlandGene = (parentA.inkGlandGene || 0) > 0.5 ? 
         (Math.random() < mut * 2 ? 0 : 1) : 
         (Math.random() < mut * 2 ? 1 : 0);
      panicGene = clamp((parentA.panicGene || 1.0) + (Math.random() - 0.5) * mut * 0.5, 1.0, 2.5);

      if (parentA.epigenome) {
        inheritedEpigenome = parentA.epigenome.map((marker: EpigeneticMarker) => {
          const passedOn = Math.random() < marker.heritability;
          return {
            ...marker,
            activationLevel: passedOn ? marker.activationLevel * 0.8 : 0
          };
        });
      }
    }

    const isPredator = speed > 3.4 && energyEfficiency > 1.4;
    const color = isPredator ? '#f43f5e' : `hsl(${Math.round(hue)}, 95%, 55%)`;

    const bot: Microbot = {
      id,
      speciesId: parentA?.speciesId || SpeciationManager.getInstance().getSpeciesId(),
      isHybrid: parentA && parentB ? SpeciationManager.getInstance().evaluateMatingCompatibility(parentA, parentB).isHybrid : false,
      fertility: parentA && parentB ? SpeciationManager.getInstance().evaluateMatingCompatibility(parentA, parentB).fertilityFactor : (parentA?.fertility ?? 1.0),
      x,
      y,
      vx: Math.cos(Math.random() * Math.PI * 2) * speed,
      vy: Math.sin(Math.random() * Math.PI * 2) * speed,
      heading: Math.random() * Math.PI * 2,
      speed,
      maxSpeed: speed,
      turnRate,
      visionRadius,
      battery: maxBattery,
      maxBattery,
      energyEfficiency,
      hue,
      color,
      generation,
      parentId,
      offspringCount: 0,
      age: 0,
      behaviorState: 'WANDERING',
      energyCollected: 0,
      isPredator,
      teleportCooldown: 0,
      armorGene,
      inkGlandGene,
      inkCooldown: 0,
      panicGene,
      panicTimer: 0,
      trail: [],
      batteryHistory: new Array(30).fill(maxBattery),
      genome: {
        speedAllele: { geneId: 'SPEED', baseValue: speed, quantumVariance: 2.0, state: 'ENTANGLED', observationProbability: 0.5 },
        visionAllele: { geneId: 'VISION', baseValue: visionRadius, quantumVariance: 50, state: 'ENTANGLED', observationProbability: 0.5 },
        efficiencyAllele: { geneId: 'EFFICIENCY', baseValue: energyEfficiency, quantumVariance: 0.8, state: 'ENTANGLED', observationProbability: 0.5 },
        mutationTendency: { geneId: 'MUTATION', baseValue: 0.1, quantumVariance: 0.1, state: 'ENTANGLED', observationProbability: 0.5 },
        adhesionGene: { geneId: 'ADHESION', baseValue: Math.random() < 0.2 ? 0.8 : 0.2, quantumVariance: 0.5, state: 'ENTANGLED', observationProbability: 0.1 }
      },
      epigenome: inheritedEpigenome
    };

    Guardrails.getInstance().sanitizeMicrobotState(bot, this.width, this.height);

    this.microbots.push(bot);
    this.totalBirths++;
    this.recentBirths++;
    return bot;
  }

  public spawnMultipleBots(count: number): void {
    for (let i = 0; i < count; i++) {
      this.spawnMicrobot();
    }
  }

  public spawnFoodParticle(type: ResourceType = 'NUTRIENT_DOT', x?: number, y?: number): void {
    const fx = x ?? Math.random() * (this.width - 60) + 30;
    const fy = y ?? Math.random() * (this.height - 60) + 30;
    const value = type === 'SUPER_CHARGER' ? 50 : type === 'MUTAGEN_ORB' ? 30 : 25;
    const radius = type === 'SUPER_CHARGER' ? 5 : type === 'MUTAGEN_ORB' ? 6 : 3.5;
    const color = type === 'SUPER_CHARGER' ? '#00E5FF' : type === 'MUTAGEN_ORB' ? '#E040FB' : '#00E676';

    this.energyParticles.push({
      id: `F-${this.nextFoodIdNum++}`,
      x: fx,
      y: fy,
      value,
      radius,
      type,
      color
    });
  }

  public spawnFood(x?: number, y?: number, forcedType?: ResourceType): void {
    const px = x ?? Math.random() * (this.width - 80) + 40;
    const py = y ?? Math.random() * (this.height - 80) + 40;

    let type: ResourceType = forcedType || 'NUTRIENT_DOT';
    if (!forcedType) {
      const rand = Math.random();
      if (rand < 0.78) type = 'NUTRIENT_DOT';
      else if (rand < 0.90) type = 'SUPER_CHARGER';
      else type = 'MUTAGEN_ORB';
    }

    let value = 25;
    let radius = 4;
    let color = '#00E676';

    if (type === 'SUPER_CHARGER') {
      value = 50;
      radius = 6;
      color = '#00E5FF';
    } else if (type === 'MUTAGEN_ORB') {
      value = 30;
      radius = 5;
      color = '#E040FB';
    }

    const particle: EnergyParticle = {
      id: `EP-${this.nextFoodIdNum++}`,
      x: px,
      y: py,
      value,
      radius,
      type,
      color
    };
    this.energyParticles.push(particle);
  }

  public spawnMultipleFood(count: number): void {
    for (let i = 0; i < count; i++) {
      this.spawnFood();
    }
  }

  public spawnHazard(x?: number, y?: number): void {
    const id = `HZ-${this.hazards.length + 1}`;
    const radius = 60 + Math.random() * 40;
    const hx = x ?? Math.random() * (this.width - radius * 2) + radius;
    const hy = y ?? Math.random() * (this.height - radius * 2) + radius;
    const angle = Math.random() * Math.PI * 2;
    this.hazards.push({
      id,
      x: hx,
      y: hy,
      radius,
      damageRate: 0.8,
      vx: Math.cos(angle) * 1.5,
      vy: Math.sin(angle) * 1.5
    });
  }

  public spawnSpeedField(x: number, y: number): void {
    const id = `SF-${this.nextFieldIdNum++}`;
    this.speedFields.push({
      id,
      x,
      y,
      radius: 50,
      multiplier: 1.8
    });
  }

  public triggerMeteorStrike(x?: number, y?: number): void {
    const mx = x ?? Math.random() * (this.width - 200) + 100;
    const my = y ?? Math.random() * (this.height - 200) + 100;
    spatialAudio.playDisasterSound('METEOR');
    this.meteors.push({
      id: `M-${Date.now()}`,
      x: mx,
      y: my,
      radius: 10,
      maxRadius: 110,
      progress: 0
    });
  }

  public triggerVoidRift(x?: number, y?: number): void {
    const rx = x ?? Math.random() * (this.width - 200) + 100;
    const ry = y ?? Math.random() * (this.height - 200) + 100;
    spatialAudio.playDisasterSound('VOID');
    this.voidRifts.push({
      id: `VR-${Date.now()}`,
      x: rx,
      y: ry,
      radius: 90,
      pullForce: 2.8
    });
  }

  public getElevation(_x: number, _y: number): number {
    return 0.5; // Simplified default topographical terrain map
  }

  public spawnSpore(_x?: number, _y?: number): void {
    const sx = _x !== undefined ? _x : Math.random() * (this.width - 60) + 30;
    const sy = _y !== undefined ? _y : Math.random() * (this.height - 60) + 30;
    if (!this.spores) this.spores = [];
    this.spores.push({
      id: `SPORE-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      x: sx,
      y: sy,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: 3,
      hostId: null,
      life: 1000
    });
  }

  public clearHazards(): void {
    this.hazards = [];
  }

  public spawnPortalPair(): void {
    const idA = `PORTAL-${Date.now()}-A`;
    const idB = `PORTAL-${Date.now()}-B`;
    
    // Spawn A on the left side
    const xA = Math.random() * (this.width / 2 - 100) + 50;
    const yA = Math.random() * (this.height - 100) + 50;
    
    // Spawn B on the right side
    const xB = Math.random() * (this.width / 2 - 100) + (this.width / 2 + 50);
    const yB = Math.random() * (this.height - 100) + 50;

    this.portals.push({ id: idA, x: xA, y: yA, radius: 45, linkedId: idB });
    this.portals.push({ id: idB, x: xB, y: yB, radius: 45, linkedId: idA });
  }

  public runBenchmark(): void {
    console.log('--- STARTING DIAGNOSTIC BENCHMARK ---');
    this.resetSimulation();
    this.config.isPaused = false;
    
    // Spawn 3000 bots instantly
    this.spawnMultipleBots(3000);
    this.spawnMultipleFood(200);
    this.updateHazardsCount();
    
    setTimeout(() => {
       console.log(`Benchmark Complete. Actual TPS: ${this.actualTPS.toFixed(1)}`);
       alert(`Diagnostic Benchmark Complete!\nAverage Simulation TPS with 3000 bots: ${this.actualTPS.toFixed(1)}`);
    }, 5000);
  }

  public updateHazardsCount(): void {
    while (this.hazards.length < this.config.hazardCount) {
      this.spawnHazard();
    }
    if (this.hazards.length > this.config.hazardCount) {
      this.hazards = this.hazards.slice(0, this.config.hazardCount);
    }
  }

  public overrideMicrobotGenes(id: string, traits: Partial<Microbot>): void {
    const bot = this.microbots.find((b) => b.id === id);
    if (bot) {
      if (traits.speed !== undefined) bot.speed = traits.speed;
      if (traits.visionRadius !== undefined) bot.visionRadius = traits.visionRadius;
      if (traits.energyEfficiency !== undefined) bot.energyEfficiency = traits.energyEfficiency;
      if (traits.turnRate !== undefined) bot.turnRate = traits.turnRate;
      if (traits.hue !== undefined) {
        bot.hue = traits.hue;
        bot.color = `hsl(${Math.round(traits.hue)}, 95%, 55%)`;
      }
      bot.isPredator = bot.speed > 3.4 && bot.energyEfficiency > 1.4;
      if (bot.isPredator) bot.color = '#f43f5e';
    }
  }

  public triggerSolarFlare(): void {
    spatialAudio.playDisasterSound('FLARE');
    this.activeDisasters.push({
      type: 'SOLAR_FLARE',
      active: true,
      intensity: 1.0,
      durationLeft: 200
    });
    // Visual explosion
    for(let i=0; i<30; i++) {
       const p = disasterParticlePool.acquire();
       p.x = this.width/2 + (Math.random()-0.5)*100;
       p.y = this.height/2 + (Math.random()-0.5)*100;
       p.vx = (Math.random()-0.5)*25;
       p.vy = (Math.random()-0.5)*25;
       p.life = 100 + Math.random()*50;
       p.color = '#FFD700';
       this.disasterParticles.push(p);
    }
  }

  public triggerRadiationStorm(): void {
    spatialAudio.playDisasterSound('STORM');
    this.activeDisasters.push({
      type: 'RADIATION_STORM',
      active: true,
      intensity: 0.8,
      durationLeft: 400
    });
    // Visual explosion
    for(let i=0; i<30; i++) {
       const p = disasterParticlePool.acquire();
       p.x = this.width/2 + (Math.random()-0.5)*100;
       p.y = this.height/2 + (Math.random()-0.5)*100;
       p.vx = (Math.random()-0.5)*15;
       p.vy = (Math.random()-0.5)*15;
       p.life = 100 + Math.random()*50;
       p.color = '#39ff14';
       this.disasterParticles.push(p);
    }
  }

  public triggerMagneticInversion(): void {
    spatialAudio.playDisasterSound('INVERSION');
    this.activeDisasters.push({
      type: 'MAGNETIC_INVERSION',
      active: true,
      intensity: 1.0,
      durationLeft: 300
    });
    // Visual explosion
    for(let i=0; i<40; i++) {
       const p = disasterParticlePool.acquire();
       p.x = this.width/2;
       p.y = this.height/2;
       p.vx = (Math.random()-0.5)*20;
       p.vy = (Math.random()-0.5)*20;
       p.life = 80 + Math.random()*40;
       p.color = '#9d00ff';
       this.disasterParticles.push(p);
    }
  }

  public getLineageTree(botId: string): { parent: Microbot | null; current: Microbot | null; children: Microbot[] } {
    const current = this.microbots.find((b) => b.id === botId) || null;
    let parent: Microbot | null = null;
    if (current && current.parentId) {
      parent = this.microbots.find((b) => b.id === current.parentId) || null;
    }
    const children = current ? this.microbots.filter((b) => b.parentId === current.id) : [];
    return { parent, current, children };
  }

  public selectRandomMicrobot(): Microbot | null {
    if (this.microbots.length === 0) {
      this.selectedMicrobotId = null;
      return null;
    }
    const idx = Math.floor(Math.random() * this.microbots.length);
    const bot = this.microbots[idx];
    this.selectedMicrobotId = bot.id;
    return bot;
  }

  public getSelectedMicrobot(): Microbot | null {
    if (!this.selectedMicrobotId) return null;
    return this.microbots.find((b) => b.id === this.selectedMicrobotId) || null;
  }

  public update(dt: number = 1.0): void {
    if (this.config.isPaused) return;
    
    const now = performance.now();
    const deltaMs = now - this.lastFrameTime;
    this.actualTPS = deltaMs > 0 ? 1000 / deltaMs : 0;
    this.lastFrameTime = now;

    const speedMult = this.config.simSpeed * dt;

    // Automatic Season Rotation Engine
    if (this.config.autoSeasonCycle) {
      this.seasonFrameCount += speedMult;
      if (this.seasonFrameCount >= this.SEASON_DURATION_FRAMES) {
        this.seasonFrameCount = 0;
        const seasons: Season[] = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'];
        const currentIdx = seasons.indexOf(this.config.currentSeason);
        const nextSeason = seasons[(currentIdx + 1) % seasons.length];
        this.config.currentSeason = nextSeason;
      }
    }

    // Automated Disaster Scheduler
    if (this.config.autoDisastersEnabled) {
      this.disasterTimer += speedMult;
      if (this.disasterTimer >= this.config.disasterScheduleInterval) {
        this.disasterTimer = 0;
        const disasters = ['SOLAR_FLARE', 'RADIATION_STORM', 'MAGNETIC_INVERSION'];
        const randomDisaster = disasters[Math.floor(Math.random() * disasters.length)];
        if (randomDisaster === 'SOLAR_FLARE') {
           this.triggerSolarFlare();
        } else if (randomDisaster === 'RADIATION_STORM') {
           this.triggerRadiationStorm();
        } else {
           this.triggerMagneticInversion();
        }
      }
    }

    // Seasonal Modifiers
    let seasonSpawnMult = 1.0;
    let seasonDrainMult = 1.0;
    let seasonSpeedMult = 1.0;

    if (this.config.currentSeason === 'SPRING') {
      seasonSpawnMult = 1.5; // +50% food spawn
    } else if (this.config.currentSeason === 'SUMMER') {
      seasonSpeedMult = 1.15; // Solar speed boost
    } else if (this.config.currentSeason === 'AUTUMN') {
      seasonSpawnMult = 0.75;
    } else if (this.config.currentSeason === 'WINTER') {
      seasonSpawnMult = 0.4; // Harsh winter food drop
      seasonDrainMult = 1.4; // Harsh winter battery drain boost
    }

    // Weather Events Modifiers
    let weatherBatteryDrainMult = 1.0;
    if (this.config.weatherEvent === 'SOLAR_FLARE') {
      weatherBatteryDrainMult = 2.5;
    } else if (this.config.weatherEvent === 'RESOURCE_BLOOM') {
      if (this.frameCount % 8 === 0 && this.energyParticles.length < this.config.maxEnergyParticles * 1.5) {
        this.spawnFood();
      }
    } else if (this.config.weatherEvent === 'TOXIC_DRIFT') {
      for (const hazard of this.hazards) {
        const vx = hazard.vx || 1.2;
        const vy = hazard.vy || 1.2;
        hazard.x += vx * speedMult;
        hazard.y += vy * speedMult;
        if (hazard.x < hazard.radius || hazard.x > this.width - hazard.radius) hazard.vx = -vx;
        if (hazard.y < hazard.radius || hazard.y > this.height - hazard.radius) hazard.vy = -vy;
      }
    }

    // Process active disasters
    for (let i = this.activeDisasters.length - 1; i >= 0; i--) {
      const disaster = this.activeDisasters[i];
      disaster.durationLeft -= speedMult;
      if (disaster.durationLeft <= 0) {
        this.activeDisasters.splice(i, 1);
      }
    }

    const hasRadiationStorm = this.activeDisasters.some(d => d.type === 'RADIATION_STORM');
    const hasMagneticInversion = this.activeDisasters.some(d => d.type === 'MAGNETIC_INVERSION');

    // Decay Pheromone Trails
    if (this.frameCount % 5 === 0) {
      this.chemicalGrid.decay(0.04 * speedMult);
      if (this.pheromoneGrid) {
        this.pheromoneGrid.processEmitters();
        this.pheromoneGrid.decay(0.02 * speedMult);
      }
    }

    // Spore Update Loop
    for (let i = this.spores.length - 1; i >= 0; i--) {
      const spore = this.spores[i];
      spore.life -= speedMult;
      
      if (!spore.hostId) {
        // Drift in wind
        spore.x += spore.vx * speedMult;
        spore.y += spore.vy * speedMult;
        
        // Wrap
        if (spore.x < 0) spore.x += this.width;
        if (spore.x > this.width) spore.x -= this.width;
        if (spore.y < 0) spore.y += this.height;
        if (spore.y > this.height) spore.y -= this.height;

        // Try to attach
        for (const bot of this.microbots) {
          if (!bot.isInfected && !bot.hasAntibodies) {
            const dist = Math.hypot(bot.x - spore.x, bot.y - spore.y);
            if (dist < bot.visionRadius * 0.5) {
               // Seeking
               spore.vx += (bot.x - spore.x) * 0.01;
               spore.vy += (bot.y - spore.y) * 0.01;
            }
            if (dist < 15) {
              spore.hostId = bot.id;
              bot.isInfected = true;
              bot.infectionTimer = 800;
              break;
            }
          }
        }
      }
      
      if (spore.life <= 0) {
        this.spores.splice(i, 1);
      }
    }

    // Rebuild Spatial Grid & Quadtree for food lookup
    this.spatialGrid.clear();
    const quadtree = new Quadtree<EnergyParticle>({ x: 0, y: 0, width: this.width, height: this.height }, 8);
    for (const food of this.energyParticles) {
      this.spatialGrid.insert(food);
      quadtree.insert(food);
    }

    // Spawn energy periodically
    const spawnRate = this.config.energySpawnRate * seasonSpawnMult;
    if (this.frameCount % Math.max(1, Math.floor(20 / spawnRate)) === 0) {
      if (this.energyParticles.length < this.config.maxEnergyParticles) {
        this.spawnFood();
      }
    }

    const eatenFoodIds = new Set<string>();
    const deadBotIds = new Set<string>();

    let botIndex = 0;

    // Update Microbots
    for (const bot of this.microbots) {
      bot.age += speedMult;

      // Update SharedArrayBuffer for SIMD/Worker thread read access
      if (botIndex < 1000) {
        this.positionsView[botIndex * 2] = bot.x;
        this.positionsView[botIndex * 2 + 1] = bot.y;
      }
      botIndex++;

      // Update Predator Status dynamically based on evolving traits
      if (!bot.isPredator && bot.speed > 3.4 && bot.energyEfficiency > 1.4) {
        bot.isPredator = true;
        bot.color = '#f43f5e';
      }

      if (bot.teleportCooldown && bot.teleportCooldown > 0) {
        bot.teleportCooldown -= speedMult;
      } else {
        // Check Portal Collisions
        for (const portal of this.portals) {
          const pDist = Math.hypot(bot.x - portal.x, bot.y - portal.y);
          if (pDist < portal.radius) {
            // Find linked portal
            const linked = this.portals.find(p => p.id === portal.linkedId);
            if (linked) {
              bot.x = linked.x + (Math.random() - 0.5) * 20;
              bot.y = linked.y + (Math.random() - 0.5) * 20;
              bot.teleportCooldown = 60; // cooldown in frames
              break;
            }
          }
        }
      }

      // Check speed fields
      let currentSpeed = bot.speed * seasonSpeedMult;

      // Handle panic timer burst
      if (bot.panicTimer && bot.panicTimer > 0) {
         currentSpeed *= bot.panicGene || 1.5;
         bot.panicTimer -= speedMult;
      }
      
      if (bot.inkCooldown && bot.inkCooldown > 0) {
         bot.inkCooldown -= speedMult;
      }
      
      // Pheromone emission based on velocity
      if (bot.behaviorState === 'REPRODUCING' || bot.battery > bot.maxBattery * 0.8) {
          const emissionRate = (Math.abs(bot.vx) + Math.abs(bot.vy)) * 0.1;
          this.pheromoneGrid.addPheromone(bot.x - bot.vx, bot.y - bot.vy, emissionRate);
      }

      // Apply Topographical Terrain Physics (Slope acceleration & Friction)
      const elevation = this.getElevation(bot.x, bot.y);
      const gradX = (this.getElevation(bot.x + 1, bot.y) - elevation);
      const gradY = (this.getElevation(bot.x, bot.y + 1) - elevation);
      
      // Slope acceleration (bots slide downhill)
      bot.vx -= gradX * 15 * speedMult;
      bot.vy -= gradY * 15 * speedMult;
      
      // Terrain Friction (higher elevation = less friction, lower = more viscous)
      const terrainFriction = 0.85 + (elevation * 0.1); 
      bot.vx *= terrainFriction;
      bot.vy *= terrainFriction;

      // Apply Biome Effects
      const currentBiome = this.getBiomeAt(bot.x, bot.y);
      if (currentBiome) {
        if (currentBiome.type === 'TOXIC_SLUDGE') {
          currentSpeed *= 0.6; // Friction
          bot.battery -= 0.15 * speedMult; // Acid burn
        } else if (currentBiome.type === 'CRYO_ZONE') {
          currentSpeed *= 0.4; // Extreme dampening
          bot.battery -= (0.08 * (1.5 / bot.energyEfficiency)) * speedMult; // Cold drain
        } else if (currentBiome.type === 'HIGH_G_FIELD') {
          const centerX = currentBiome.x + (currentBiome.width / 2);
          const centerY = currentBiome.y + (currentBiome.height / 2);
          const angleToCenter = Math.atan2(centerY - bot.y, centerX - bot.x);
          const gForce = 0.5;
          bot.vx += Math.cos(angleToCenter) * gForce * speedMult;
          bot.vy += Math.sin(angleToCenter) * gForce * speedMult;
        }
      }
      // Apply Disasters
      if (hasRadiationStorm) {
        bot.battery -= 0.1 * speedMult;
        // Mock genetic mutation from radiation
        if (Math.random() < 0.005 * speedMult) {
           bot.hue = (bot.hue + Math.random() * 40 - 20 + 360) % 360;
           bot.color = `hsl(${Math.round(bot.hue)}, 95%, 55%)`;
        }
      }
      
      // Quantum Genome Collapse (Stress triggers observation of superposition alleles)
      const isStressed = bot.battery < (bot.maxBattery * 0.25) || (currentBiome && (currentBiome.type === 'TOXIC_SLUDGE' || currentBiome.type === 'CRYO_ZONE')) || hasRadiationStorm;
      if (isStressed && bot.genome) {
        const genome = bot.genome;
        const alleles = [genome.speedAllele, genome.visionAllele, genome.efficiencyAllele];
        
        for (const allele of alleles) {
          if (allele.state === 'ENTANGLED' || allele.state === 'DECAYING') {
            allele.state = 'OBSERVED';
            const isBeneficial = Math.random() < allele.observationProbability;
            const variance = isBeneficial ? allele.quantumVariance : -allele.quantumVariance;
            
            if (allele.geneId === 'SPEED') {
               bot.speed = clamp(bot.speed + variance, 1.0, 5.0);
               bot.maxSpeed = bot.speed;
            } else if (allele.geneId === 'VISION') {
               bot.visionRadius = clamp(bot.visionRadius + variance, 40, 260);
            } else if (allele.geneId === 'EFFICIENCY') {
               bot.energyEfficiency = clamp(bot.energyEfficiency + variance, 0.4, 3.0);
            }
          }
        }
      }

      // Heading rotation
      if (hasMagneticInversion) {
         // Invert heading unexpectedly
         if (Math.random() < 0.05 * speedMult) {
           bot.heading += Math.PI;
           bot.vx = -bot.vx;
           bot.vy = -bot.vy;
         }
      }

      for (const field of this.speedFields) {
        const dist = Math.hypot(bot.x - field.x, bot.y - field.y);
        if (dist < field.radius) {
          currentSpeed *= field.multiplier;
        }
      }

      // Non-Newtonian Fluid Drag
      for (const zone of this.fluidZones) {
        const dist = Math.hypot(bot.x - zone.x, bot.y - zone.y);
        if (dist < zone.radius) {
          if (zone.isNonNewtonian) {
            // Drag increases exponentially with velocity
            const velSq = (bot.vx * bot.vx + bot.vy * bot.vy);
            const dragFactor = Math.max(0.1, 1.0 - (zone.baseDrag * velSq * 0.05));
            bot.vx *= dragFactor;
            bot.vy *= dragFactor;
            currentSpeed *= dragFactor;
          } else {
            bot.vx *= zone.baseDrag;
            bot.vy *= zone.baseDrag;
            currentSpeed *= zone.baseDrag;
          }
        }
      }

      // Gravity Wells
      for (const well of this.gravityWells) {
        const dx = well.x - bot.x;
        const dy = well.y - bot.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < well.radius) {
          // Force decreases with distance
          const forceStrength = well.force * (1 - (dist / well.radius));
          bot.vx += (dx / dist) * forceStrength * speedMult;
          bot.vy += (dy / dist) * forceStrength * speedMult;
        }
      }

      // Catalyst Zones (Genetic Manipulation)
      for (const zone of this.catalystZones) {
        const dist = Math.hypot(bot.x - zone.x, bot.y - zone.y);
        if (dist < zone.radius && bot.genome) {
          const mutationAmount = zone.mutationDirection * 0.02 * speedMult; // gradual mutation
          if (zone.targetGene === 'SPEED') {
            bot.genome.speedAllele.baseValue = clamp(bot.genome.speedAllele.baseValue + mutationAmount, 1.0, 5.0);
            bot.speed = bot.genome.speedAllele.baseValue;
            bot.maxSpeed = bot.speed;
          } else if (zone.targetGene === 'VISION') {
            bot.genome.visionAllele.baseValue = clamp(bot.genome.visionAllele.baseValue + (mutationAmount * 20), 40, 260);
            bot.visionRadius = bot.genome.visionAllele.baseValue;
          } else if (zone.targetGene === 'EFFICIENCY') {
            bot.genome.efficiencyAllele.baseValue = clamp(bot.genome.efficiencyAllele.baseValue + (mutationAmount * 0.5), 0.4, 3.0);
            bot.energyEfficiency = bot.genome.efficiencyAllele.baseValue;
          }
        }
      }

      // Deposit Pheromones periodically
      if (this.frameCount % 15 === 0) {
        bot.trail.push({ x: bot.x, y: bot.y });
        if (bot.trail.length > 12) {
          bot.trail.shift();
        }

        if (this.config.showPheromoneTrails) {
          this.chemicalGrid.addPheromone(bot.x, bot.y, 0.1 * speedMult);
        }
      }

      // Query nearby food
      const nearbyFood = this.spatialGrid.getNearby(bot.x, bot.y, bot.visionRadius);

      // Steering calculations
      const steering = calculateSteering(bot, nearbyFood, this.hazards, this.width, this.height, this.pheromoneGrid);
      bot.behaviorState = steering.state;

      // Chemotaxis (Steer towards higher pheromone concentrations if wandering or seeking)
      if (bot.behaviorState === 'WANDERING' || bot.behaviorState === 'SEEKING_ENERGY') {
        const pLeft = this.chemicalGrid.getPheromone(
          bot.x + Math.cos(bot.heading - 0.5) * 15,
          bot.y + Math.sin(bot.heading - 0.5) * 15
        );
        const pRight = this.chemicalGrid.getPheromone(
          bot.x + Math.cos(bot.heading + 0.5) * 15,
          bot.y + Math.sin(bot.heading + 0.5) * 15
        );
        const pCenter = this.chemicalGrid.getPheromone(
          bot.x + Math.cos(bot.heading) * 15,
          bot.y + Math.sin(bot.heading) * 15
        );
        if (pLeft > 0 || pRight > 0 || pCenter > 0) {
          if (pLeft > pRight && pLeft > pCenter) {
             steering.desiredHeading -= 0.2;
          } else if (pRight > pLeft && pRight > pCenter) {
             steering.desiredHeading += 0.2;
          }
        }
      }

      // Predator Hunting Behavior Override
      if (bot.isPredator) {
        let nearestPrey: Microbot | null = null;
        let minPreyDist = bot.visionRadius;

        for (const target of this.microbots) {
          if (target.id !== bot.id && !target.isPredator) {
            const dist = Math.hypot(bot.x - target.x, bot.y - target.y);
            if (dist < minPreyDist) {
              minPreyDist = dist;
              nearestPrey = target;
            }
          }
        }

        if (nearestPrey) {
          bot.behaviorState = 'HUNTING_PREY';
          const desiredHeading = Math.atan2(nearestPrey.y - bot.y, nearestPrey.x - bot.x);
          steering.desiredHeading = desiredHeading;
          
          // Trigger Prey Defenses
          if (nearestPrey.panicGene && (!nearestPrey.panicTimer || nearestPrey.panicTimer <= 0)) {
            nearestPrey.panicTimer = 60; // panic for 60 frames
            nearestPrey.behaviorState = 'EVADING_HAZARD';
          }
          if (nearestPrey.inkGlandGene && nearestPrey.inkGlandGene > 0.5 && (!nearestPrey.inkCooldown || nearestPrey.inkCooldown <= 0)) {
            nearestPrey.inkCooldown = 300; // 300 frames cooldown
            // Spawn ink hazard
            this.hazards.push({
              id: `INK-${Date.now()}`,
              x: nearestPrey.x,
              y: nearestPrey.y,
              radius: 40,
              damageRate: 0.5,
              vx: 0,
              vy: 0
            });
          }

          // Harvest Energy upon Predator Contact
          if (minPreyDist < 16) {
            const damageReduction = nearestPrey.armorGene ? (1.0 - nearestPrey.armorGene) : 1.0;
            const energyDrained = 35 * damageReduction;
            
            bot.battery = Math.min(bot.maxBattery, bot.battery + energyDrained);
            bot.energyCollected += energyDrained;
            nearestPrey.battery -= energyDrained; // Armor protects prey from total loss
          }
        }
      }

      // Heading rotation
      let diff = steering.desiredHeading - bot.heading;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      bot.heading += clamp(diff, -bot.turnRate * speedMult, bot.turnRate * speedMult);

      // Symbiosis: Mutualistic Energy Sharing
      if (bot.symbiontPartnerId) {
        const partner = this.microbots.find(b => b.id === bot.symbiontPartnerId);
        if (partner) {
          const dist = Math.hypot(bot.x - partner.x, bot.y - partner.y);
          if (dist < 100) {
            // Average their batteries
            const total = bot.battery + partner.battery;
            bot.battery = total / 2;
            partner.battery = total / 2;
            
            // Shared vision boost
            bot.visionRadius = Math.max(bot.visionRadius, partner.visionRadius);
            
            const avgVx = (bot.vx + partner.vx) / 2;
            const avgVy = (bot.vy + partner.vy) / 2;
            bot.vx = avgVx; bot.vy = avgVy;
            partner.vx = avgVx; partner.vy = avgVy;
            
            if (this.config.showPheromoneTrails) {
               this.chemicalGrid.addPheromone((bot.x + partner.x)/2, (bot.y + partner.y)/2, 0.2);
            }
          }
        }
      }

      // Parasitism: Immune Response & Energy Drain
      if (bot.isInfected) {
        bot.battery -= this.config.batteryDrainMultiplier * 2.0 * speedMult; // 2x drain
        if (bot.infectionTimer !== undefined) {
           bot.infectionTimer -= speedMult;
           if (bot.infectionTimer <= 0) {
             bot.isInfected = false;
             // Chance to develop antibodies through survivor mutation
             if (Math.random() > 0.5) {
               bot.hasAntibodies = true;
               bot.hue = 130; // Turn green (immune)
             }
           }
        }
      }

      // Velocity & Position
      bot.vx = Math.cos(bot.heading) * currentSpeed;
      bot.vy = Math.sin(bot.heading) * currentSpeed;
      
      const ccdResult = ccdSubstep(
        bot.x, bot.y, 
        bot.vx, bot.vy, 
        speedMult, 
        this.width, this.height, 15, 
        this.hazards
      );
      
      bot.x = ccdResult.x;
      bot.y = ccdResult.y;
      
      if (ccdResult.hitHazard) {
         // Apply small bounce
         bot.heading += Math.PI;
      }

      // Temperature & Radiation Exposure Tracking
      bot.temperature = 22 + (this.config.weatherEvent === 'SOLAR_FLARE' ? 18 : 0);
      if (this.config.weatherEvent === 'TOXIC_DRIFT') {
        bot.radiationExposure = (bot.radiationExposure || 0) + 0.1 * speedMult;
      }
      // Epigenetic Stress Memory Trigger
      if (bot.battery < bot.maxBattery * 0.3 || (bot.radiationExposure && bot.radiationExposure > 5)) {
        bot.epigeneticStress = (bot.epigeneticStress || 0) + 0.05 * speedMult;
        EpigeneticEngine.getInstance().updateGlobalStress(Math.max(EpigeneticEngine.getInstance().getGlobalStress(), bot.epigeneticStress));
      } else {
        bot.epigeneticStress = Math.max(0, (bot.epigeneticStress || 0) - 0.01 * speedMult);
      }

      // Process Epigenetic Markers
      if (bot.epigenome && bot.epigeneticStress && bot.epigeneticStress > 0) {
        bot.epigenome.forEach(marker => {
          if (bot.epigeneticStress! > marker.stressThreshold && marker.activationLevel < 1.0) {
            marker.activationLevel = Math.min(1.0, marker.activationLevel + 0.02 * speedMult);
            // Apply phenotypic change
            if (marker.geneId === 'SPEED_BOOST') {
               bot.speed = Math.min(bot.maxSpeed * 1.5, bot.speed * (1 + 0.01 * marker.activationLevel));
            } else if (marker.geneId === 'VISION_BOOST') {
               bot.visionRadius = Math.min(300, bot.visionRadius * (1 + 0.02 * marker.activationLevel));
            }
          }
        });
      }
      const speedCost = Math.pow(bot.speed, 1.3) * (bot.mass || 1.0);
      const nasPenalty = bot.nasBrain ? bot.nasBrain.passiveEnergyCost * 0.05 : 0;
      const netDrain = ((0.08 * (speedCost / (bot.energyEfficiency || 1.0))) + nasPenalty) * this.config.batteryDrainMultiplier * weatherBatteryDrainMult * seasonDrainMult * speedMult;
      bot.battery -= netDrain;

      // Battery history ring buffer
      if (this.frameCount % 10 === 0) {
        if (!bot.batteryHistory) bot.batteryHistory = [];
        bot.batteryHistory.push(Math.max(0, bot.battery));
        if (bot.batteryHistory.length > 30) {
          bot.batteryHistory.shift();
        }
      }

      // Parasitic Energy Drain Mechanics
      if (bot.isParasite) {
        for (const host of this.microbots) {
          if (host.id !== bot.id && !host.isParasite) {
            const dist = Math.hypot(host.x - bot.x, host.y - bot.y);
            if (dist < 18) {
              const siphon = 0.5 * speedMult;
              host.battery = Math.max(0, host.battery - siphon);
              bot.battery = Math.min(bot.maxBattery, bot.battery + siphon);
            }
          }
        }
      }
      for (const partner of this.microbots) {
        if (partner.id !== bot.id && !bot.isPredator && !partner.isPredator) {
          const dist = Math.hypot(partner.x - bot.x, partner.y - bot.y);
          if (dist < 25 && Math.abs(bot.hue - partner.hue) < 20) {
            bot.symbiontPartnerId = partner.id;
            // Equalize battery between symbiont partners
            const avgEnergy = (bot.battery + partner.battery) / 2;
            bot.battery = avgEnergy;
            partner.battery = avgEnergy;
          }
        }
      }
      for (const other of this.microbots) {
        if (other.id !== bot.id) {
          const dx = other.x - bot.x;
          const dy = other.y - bot.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 100 && distSq > 0) { // Collision within 10px radius
            const dist = Math.sqrt(distSq);
            const nx = dx / dist;
            const ny = dy / dist;

            // Multicellular Adhesion
            if (bot.genome?.adhesionGene && other.genome?.adhesionGene) {
               if (bot.genome.adhesionGene.baseValue > 0.6 && other.genome.adhesionGene.baseValue > 0.6) {
                  if (!bot.clusterId && !other.clusterId) {
                     const cid = `C-${Date.now()}-${Math.floor(Math.random()*1000)}`;
                     bot.clusterId = cid; other.clusterId = cid;
                     bot.boundTo = [other.id]; other.boundTo = [bot.id];
                  } else if (bot.clusterId && !other.clusterId) {
                     other.clusterId = bot.clusterId;
                     bot.boundTo?.push(other.id); other.boundTo = [bot.id];
                  } else if (!bot.clusterId && other.clusterId) {
                     bot.clusterId = other.clusterId;
                     other.boundTo?.push(bot.id); bot.boundTo = [other.id];
                  }
               }
            }

            if (bot.clusterId && bot.clusterId === other.clusterId) {
               const overlap = 10 - dist;
               const spring = overlap * 0.1;
               bot.x -= nx * spring; bot.y -= ny * spring;
               other.x += nx * spring; other.y += ny * spring;
               continue;
            }

            // Separate overlapping bots
            bot.x -= nx * 1.5;
            bot.y -= ny * 1.5;
            other.x += nx * 1.5;
            other.y += ny * 1.5;
            // Elastic velocity bounce exchange
            const kx = bot.vx - other.vx;
            const ky = bot.vy - other.vy;
            const p = 2 * (nx * kx + ny * ky) / 2;
            bot.vx -= p * nx;
            bot.vy -= p * ny;
            other.vx += p * nx;
            other.vy += p * ny;
          }
        }
      }
      if (bot.isInfected) {
        bot.infectionTimer = (bot.infectionTimer || 0) + speedMult;
        bot.battery -= 0.1 * speedMult; // Infection drains battery
        bot.behaviorState = 'INFECTED';

        // Recovery & Antibody Immunity development after 300 frames
        if (bot.infectionTimer >= 300) {
          bot.isInfected = false;
          bot.hasAntibodies = true;
        } else {
          // Spread virus to nearby non-immune bots
          for (const target of this.microbots) {
            if (target.id !== bot.id && !target.isInfected && !target.hasAntibodies) {
              const dist = Math.hypot(bot.x - target.x, bot.y - target.y);
              if (dist < 20 && Math.random() < 0.35) {
                target.isInfected = true;
                target.infectionTimer = 0;
              }
            }
          }
        }
      }

      // Check battery death
      if (bot.battery <= 0) {
        deadBotIds.add(bot.id);
        this.totalDeaths++;
        this.recentDeaths++;
        continue;
      }

      // Food Consumption
      for (const food of nearbyFood) {
        if (eatenFoodIds.has(food.id)) continue;
        const dist = Math.hypot(bot.x - food.x, bot.y - food.y);
        if (dist < 12) {
          if (dist < 10 + food.radius) {
          bot.battery = Math.min(bot.maxBattery, bot.battery + food.value * bot.energyEfficiency);
          bot.energyCollected += food.value;
          spatialAudio.playFeedSound(440 + (bot.hue % 300));
        }  if (food.type === 'MUTAGEN_ORB') {
            bot.speed = Math.max(1.0, Math.min(5.0, bot.speed + (Math.random() - 0.5) * 1.2));
            bot.visionRadius = Math.max(60, Math.min(260, bot.visionRadius + (Math.random() - 0.5) * 40));
            bot.energyEfficiency = Math.max(0.6, Math.min(2.5, bot.energyEfficiency + (Math.random() - 0.5) * 0.5));
          }

          // Reproduction threshold
          if (bot.battery >= bot.maxBattery * 0.95 && this.microbots.length < this.config.maxPopulation) {
            
            // Try to find a mate nearby
            let mateFound = false;
            const nearbyBots: Microbot[] = [];
            const radSq = bot.visionRadius * bot.visionRadius;
            for (const otherBot of this.microbots) {
              if (otherBot.id !== bot.id) {
                const dx = otherBot.x - bot.x;
                const dy = otherBot.y - bot.y;
                if (dx * dx + dy * dy <= radSq) {
                  nearbyBots.push(otherBot);
                }
              }
            }
            
            for (const otherBot of nearbyBots) {
              if (otherBot.battery >= otherBot.maxBattery * 0.8) {
                const compat = SpeciationManager.getInstance().evaluateMatingCompatibility(bot, otherBot);
                if (compat.compatible) {
                  bot.battery -= 45;
                  otherBot.battery -= 45;
                  bot.behaviorState = 'REPRODUCING';
                  otherBot.behaviorState = 'REPRODUCING';
                  this.spawnMicrobot(bot, otherBot);
                  mateFound = true;
                  break;
                }
              }
            }

            // Asexual Reproduction fallback
            if (!mateFound) {
              bot.battery -= 45;
              bot.behaviorState = 'REPRODUCING';
              this.spawnMicrobot(bot);
            }
          }
        }
      }
    }

    // Remove eaten food
    if (eatenFoodIds.size > 0) {
      this.energyParticles = this.energyParticles.filter((f) => !eatenFoodIds.has(f.id));
    }

    // Filter dead bots
    if (deadBotIds.size > 0) {
      this.microbots = this.microbots.filter((b) => !deadBotIds.has(b.id));
    }

    // Sync Multicellular Clusters
    const clusters = new Map<string, Microbot[]>();
    for (const b of this.microbots) {
      if (b.clusterId) {
        if (!clusters.has(b.clusterId)) clusters.set(b.clusterId, []);
        clusters.get(b.clusterId)!.push(b);
      }
    }
    clusters.forEach(members => {
      if (members.length < 2) return;
      let tvx = 0; let tvy = 0; let te = 0;
      members.forEach(m => { tvx += m.vx; tvy += m.vy; te += m.battery; });
      const avgVx = tvx / members.length;
      const avgVy = tvy / members.length;
      const avgE = te / members.length;
      members.forEach(m => { m.vx = avgVx; m.vy = avgVy; m.battery = avgE; });
    });

      // Safety Net: Keep population alive infinitely so simulation never ends!
    while (this.microbots.length < 12) {
      this.spawnMicrobot();
    }

    // Update Disaster Particles
    for (let i = this.disasterParticles.length - 1; i >= 0; i--) {
       const p = this.disasterParticles[i];
       p.x += p.vx * speedMult;
       p.y += p.vy * speedMult;
       p.life -= 2 * speedMult;
       if (p.life <= 0) {
          disasterParticlePool.release(p);
          this.disasterParticles.splice(i, 1);
       }
    }

    // Update global telemetry buffers every 30 frames (~0.5s)
    if (this.frameCount % 30 === 0) {
      this.updateTelemetryBuffers();
    }

    // Record stats timeline snapshot every 60 frames (~1 sec)
    if (this.frameCount % 60 === 0) {
      this.recordHistorySnapshot();
    }

    // Play Biome ambient hums periodically (every ~3 seconds = 180 frames)
    if (this.frameCount % 180 === 0 && this.biomes.length > 0) {
      // Pick a random bot to determine which biome to play sound for
      if (this.microbots.length > 0) {
        const randBot = this.microbots[Math.floor(Math.random() * this.microbots.length)];
        const biome = this.getBiomeAt(randBot.x, randBot.y);
        if (biome) {
          spatialAudio.playBiomeHum(biome.type);
        }
      }
    }
  }

  private updateTelemetryBuffers(): void {
    EpigeneticEngine.getInstance().recordStressFrame();
    
    this.populationHistory.push(this.microbots.length);
    if (this.populationHistory.length > 30) this.populationHistory.shift();

    this.birthHistory.push(this.recentBirths);
    if (this.birthHistory.length > 30) this.birthHistory.shift();

    this.deathHistory.push(this.recentDeaths);
    if (this.deathHistory.length > 30) this.deathHistory.shift();

    this.recentBirths = 0;
    this.recentDeaths = 0;
  }

  private recordHistorySnapshot(): void {
    const stats = this.getStats();
    this.historyTimeline.push({
      time: Math.floor(this.frameCount / 60),
      population: stats.currentPopulation,
      avgSpeed: stats.avgSpeed,
      avgVision: stats.avgVision,
      diversity: stats.shannonDiversityIndex
    });
    if (this.historyTimeline.length > 60) {
      this.historyTimeline.shift();
    }
  }

  public triggerOutbreak(): void {
    spatialAudio.playDisasterSound('VIRUS');
    if (this.microbots.length === 0) return;
    const targetIdx = Math.floor(Math.random() * this.microbots.length);
    this.microbots[targetIdx].isInfected = true;
    this.microbots[targetIdx].infectionTimer = 0;
  }

  public getStats(): SimulationStats {
    const pop = this.microbots.length;
    let sumSpeed = 0;
    let sumVision = 0;
    let sumEff = 0;
    let predatorCount = 0;
    let infectedCount = 0;

    // Calculate Trait Histograms (10 buckets each)
    const speedHistogram = new Array(10).fill(0);
    const visionHistogram = new Array(10).fill(0);
    const efficiencyHistogram = new Array(10).fill(0);
    const diversityBuckets = new Array(12).fill(0);
    const biomePopulation: Record<string, number> = {
      'NORMAL': 0,
      'TOXIC_SLUDGE': 0,
      'CRYO_ZONE': 0,
      'HIGH_G_FIELD': 0
    };

    for (const b of this.microbots) {
      sumSpeed += b.speed;
      sumVision += b.visionRadius;
      sumEff += b.energyEfficiency;
      if (b.isPredator) predatorCount++;
      if (b.isInfected) infectedCount++;

      // Speed bucket (1.0 to 5.0)
      const sIdx = Math.max(0, Math.min(9, Math.floor(((b.speed - 1.0) / 4.0) * 10)));
      speedHistogram[sIdx]++;

      // Vision bucket (60 to 260)
      const vIdx = Math.max(0, Math.min(9, Math.floor(((b.visionRadius - 60) / 200) * 10)));
      visionHistogram[vIdx]++;

      // Efficiency bucket (0.6 to 2.5)
      const eIdx = Math.max(0, Math.min(9, Math.floor(((b.energyEfficiency - 0.6) / 1.9) * 10)));
      efficiencyHistogram[eIdx]++;

      // Hue diversity bucket (0 to 360 degrees)
      const dIdx = Math.max(0, Math.min(11, Math.floor((b.hue / 360) * 12)));
      diversityBuckets[dIdx]++;

      const biome = this.getBiomeAt(b.x, b.y);
      if (biome && biomePopulation[biome.type] !== undefined) {
        biomePopulation[biome.type]++;
      } else {
        biomePopulation['NORMAL']++;
      }
    }

    // Compute Shannon Diversity Index: H = -sum(p_i * ln(p_i))
    let shannonIndex = 0;
    if (pop > 0) {
      for (const count of diversityBuckets) {
        if (count > 0) {
          const p = count / pop;
          shannonIndex -= p * Math.log(p);
        }
      }
    }

    this.speciationDiversityBuffer[this.speciationDiversityIndex] = shannonIndex;
    this.speciationDiversityIndex = (this.speciationDiversityIndex + 1) % 100;
    const speciationDiversityRingBuffer = new Float32Array(100);
    for (let i = 0; i < 100; i++) {
      const readIdx = (this.speciationDiversityIndex + i) % 100;
      speciationDiversityRingBuffer[i] = this.speciationDiversityBuffer[readIdx];
    }

    const seasonProgressPct = Math.min(100, Math.floor((this.seasonFrameCount / this.SEASON_DURATION_FRAMES) * 100));

    return {
      currentPopulation: pop,
      generationCount: this.generationCount,
      energyParticleCount: this.energyParticles.length,
      avgSpeed: pop > 0 ? sumSpeed / pop : 0,
      avgVision: pop > 0 ? sumVision / pop : 0,
      avgEfficiency: pop > 0 ? sumEff / pop : 0,
      totalBirths: this.totalBirths,
      totalDeaths: this.totalDeaths,
      predatorCount,
      infectedCount,
      shannonDiversityIndex: parseFloat(shannonIndex.toFixed(2)),
      currentSeason: this.config.currentSeason,
      seasonProgressPct,
      actualTPS: this.actualTPS,
      populationHistory: [...this.populationHistory],
      birthHistory: [...this.birthHistory],
      deathHistory: [...this.deathHistory],
      stressHistory: EpigeneticEngine.getInstance().getStressHistory(),
      speedHistogram,
      visionHistogram,
      efficiencyHistogram,
      diversityBuckets,
      biomePopulation,
      historyTimeline: this.historyTimeline,
      speciationDiversityRingBuffer
    };
  }
}
