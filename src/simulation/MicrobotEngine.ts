import { Microbot, EnergyParticle, HazardZone, SpeedField, PheromonePoint, MeteorStrike, VoidRift, Season, ResourceType, SimulationConfig, SimulationStats, SectorBiome, EnvironmentalDisaster } from './types';
import { processGenomeDecay } from './genetics/quantumDecay';
import { SpatialGrid } from './SpatialGrid';
import { Quadtree } from './Quadtree';
import { SpatialHashGrid } from './SpatialHashGrid';
import { spatialAudio } from '../audio/SpatialAudioSynth';
import { calculateSteering } from './steering';

export class MicrobotEngine {
  public width: number;
  public height: number;
  public config: SimulationConfig;

  public microbots: Microbot[] = [];
  public energyParticles: EnergyParticle[] = [];
  public hazards: HazardZone[] = [];
  public speedFields: SpeedField[] = [];
  public pheromones: PheromonePoint[] = [];
  public meteors: MeteorStrike[] = [];
  public voidRifts: VoidRift[] = [];
  public biomes: SectorBiome[] = [];
  public activeDisasters: EnvironmentalDisaster[] = [];
  public selectedMicrobotId: string | null = null;

  public spatialGrid: SpatialGrid;
  public spatialHash: SpatialHashGrid<EnergyParticle>;
  public totalBirths: number = 0;
  public totalDeaths: number = 0;
  public generationCount: number = 1;
  public frameCount: number = 0;
  public seasonFrameCount: number = 0;
  public readonly SEASON_DURATION_FRAMES = 2700; // ~45 seconds per season at 60 FPS

  // Ring buffers for telemetry analytics
  public populationHistory: number[] = new Array(30).fill(45);
  public birthHistory: number[] = new Array(30).fill(0);
  public deathHistory: number[] = new Array(30).fill(0);
  public historyTimeline: SimulationStats['historyTimeline'] = [];

  private recentBirths: number = 0;
  private recentDeaths: number = 0;
  private nextBotIdNum: number = 1;
  private nextFoodIdNum: number = 1;
  private nextFieldIdNum: number = 1;

  constructor(width: number, height: number, config: SimulationConfig) {
    this.width = width;
    this.height = height;
    this.config = config;
    this.spatialGrid = new SpatialGrid(width, height, 50);
    this.spatialHash = new SpatialHashGrid<EnergyParticle>(60);
    this.generateBiomes();

    this.resetSimulation();
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
    this.pheromones = [];
    this.activeDisasters = [];
    this.selectedMicrobotId = null;
    this.totalBirths = 0;
    this.totalDeaths = 0;
    this.generationCount = 1;
    this.frameCount = 0;
    this.seasonFrameCount = 0;
    this.nextBotIdNum = 1;
    this.nextFoodIdNum = 1;
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

  public resize(width: number, height: number): void {
    this.width = Math.max(600, width);
    this.height = Math.max(400, height);
    this.spatialGrid = new SpatialGrid(this.width, this.height, 60);
    this.generateBiomes();
  }

  public spawnMicrobot(parent?: Microbot): Microbot {
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

    if (parent) {
      x = parent.x + (Math.random() - 0.5) * 20;
      y = parent.y + (Math.random() - 0.5) * 20;
      generation = parent.generation + 1;
      parentId = parent.id;
      parent.offspringCount++;
      if (generation > this.generationCount) {
        this.generationCount = generation;
      }

      // Mutate traits (Autumn increases mutation rate by 1.5x)
      const seasonMutMult = this.config.currentSeason === 'AUTUMN' ? 1.5 : 1.0;
      const mut = this.config.mutationRate * seasonMutMult;
      speed = Math.max(1.0, Math.min(5.0, parent.speed + (Math.random() - 0.5) * mut * 1.5));
      turnRate = Math.max(0.04, Math.min(0.3, parent.turnRate + (Math.random() - 0.5) * mut * 0.1));
      visionRadius = Math.max(60, Math.min(260, parent.visionRadius + (Math.random() - 0.5) * mut * 50));
      energyEfficiency = Math.max(0.6, Math.min(2.5, parent.energyEfficiency + (Math.random() - 0.5) * mut * 0.4));
      hue = (parent.hue + (Math.random() - 0.5) * mut * 80 + 360) % 360;
    }

    const isPredator = speed > 3.4 && energyEfficiency > 1.4;
    const color = isPredator ? '#f43f5e' : `hsl(${Math.round(hue)}, 95%, 55%)`;

    const bot: Microbot = {
      id,
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
      trail: [],
      batteryHistory: new Array(30).fill(maxBattery)
    };

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
    this.voidRifts.push({
      id: `VR-${Date.now()}`,
      x: rx,
      y: ry,
      radius: 90,
      pullForce: 2.8
    });
  }

  public clearHazards(): void {
    this.hazards = [];
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

  public triggerRadiationStorm(): void {
    this.activeDisasters.push({
      type: 'RADIATION_STORM',
      active: true,
      intensity: 0.8,
      durationLeft: 400
    });
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

    this.frameCount++;
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

    // Decay Pheromone Trails
    if (this.frameCount % 5 === 0 && this.pheromones.length > 0) {
      for (let i = this.pheromones.length - 1; i >= 0; i--) {
        this.pheromones[i].intensity -= 0.04;
        if (this.pheromones[i].intensity <= 0) {
          this.pheromones.splice(i, 1);
        }
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

    // Update Microbots
    for (const bot of this.microbots) {
      bot.age += speedMult;

      // Update Predator Status dynamically based on evolving traits
      if (!bot.isPredator && bot.speed > 3.4 && bot.energyEfficiency > 1.4) {
        bot.isPredator = true;
        bot.color = '#f43f5e';
      }

      // Check speed fields
      let currentSpeed = bot.speed * seasonSpeedMult;

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

      for (const field of this.speedFields) {
        const dist = Math.hypot(bot.x - field.x, bot.y - field.y);
        if (dist < field.radius) {
          currentSpeed *= field.multiplier;
        }
      }

      // Deposit Pheromones periodically
      if (this.frameCount % 15 === 0) {
        bot.trail.push({ x: bot.x, y: bot.y });
        if (bot.trail.length > 12) {
          bot.trail.shift();
        }

        if (this.config.showPheromoneTrails && this.pheromones.length < 220) {
          this.pheromones.push({
            x: bot.x,
            y: bot.y,
            intensity: 1.0,
            color: bot.color
          });
        }
      }

      // Query nearby food
      const nearbyFood = this.spatialGrid.getNearby(bot.x, bot.y, bot.visionRadius);

      // Steering calculations
      const steering = calculateSteering(bot, nearbyFood, this.hazards, this.width, this.height);
      bot.behaviorState = steering.state;

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

          // Harvest Energy upon Predator Contact
          if (minPreyDist < 16) {
            bot.battery = Math.min(bot.maxBattery, bot.battery + 35);
            bot.energyCollected += 35;
            nearestPrey.battery -= 35;
          }
        }
      }

      // Heading rotation
      let diff = steering.desiredHeading - bot.heading;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      bot.heading += diff * bot.turnRate * speedMult;

      // Velocity & Position
      bot.vx = Math.cos(bot.heading) * currentSpeed;
      bot.vy = Math.sin(bot.heading) * currentSpeed;
      bot.x += bot.vx * speedMult;
      bot.y += bot.vy * speedMult;

      // Keep within canvas bounds
      bot.x = Math.max(15, Math.min(this.width - 15, bot.x));
      bot.y = Math.max(15, Math.min(this.height - 15, bot.y));

      // Temperature & Radiation Exposure Tracking
      bot.temperature = 22 + (this.config.weatherEvent === 'SOLAR_FLARE' ? 18 : 0);
      if (this.config.weatherEvent === 'TOXIC_DRIFT') {
        bot.radiationExposure = (bot.radiationExposure || 0) + 0.1 * speedMult;
      }
      if (bot.battery < 30) {
        bot.epigeneticStress = (bot.epigeneticStress || 0) + 0.05 * speedMult;
      }
      if ((bot.epigeneticStress || 0) > 10.0) {
        // Trigger Epigenetic Trait Mutation Adaptation (speed & vision boost)
        bot.speed = Math.min(5.0, bot.speed * 1.15);
        bot.visionRadius = Math.min(260, bot.visionRadius * 1.2);
        bot.epigeneticStress = 0; // Reset after expression
      }
      const speedCost = Math.pow(bot.speed, 1.3) * (bot.mass || 1.0);
      const netDrain = (0.08 * (speedCost / (bot.energyEfficiency || 1.0))) * this.config.batteryDrainMultiplier * weatherBatteryDrainMult * seasonDrainMult * speedMult;
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

          // Asexual Reproduction threshold
          if (bot.battery >= bot.maxBattery * 0.95 && this.microbots.length < this.config.maxPopulation) {
            bot.battery -= 45;
            bot.behaviorState = 'REPRODUCING';
            this.spawnMicrobot(bot);
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

    // Safety Net: Keep population alive infinitely so simulation never ends!
    while (this.microbots.length < 12) {
      this.spawnMicrobot();
    }

    // Update global telemetry buffers every 30 frames (~0.5s)
    if (this.frameCount % 30 === 0) {
      this.updateTelemetryBuffers();
    }

    // Record stats timeline snapshot every 60 frames (~1 sec)
    if (this.frameCount % 60 === 0) {
      this.recordHistorySnapshot();
    }
  }

  private updateTelemetryBuffers(): void {
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
      avgVision: stats.avgVision
    });
    if (this.historyTimeline.length > 60) {
      this.historyTimeline.shift();
    }
  }

  public triggerOutbreak(): void {
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
      populationHistory: [...this.populationHistory],
      birthHistory: [...this.birthHistory],
      deathHistory: [...this.deathHistory],
      speedHistogram,
      visionHistogram,
      efficiencyHistogram,
      diversityBuckets,
      historyTimeline: this.historyTimeline
    };
  }
}
