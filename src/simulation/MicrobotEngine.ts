import { Microbot, EnergyParticle, HazardZone, SimulationConfig, SimulationStats } from './types';
import { SpatialGrid } from './SpatialGrid';
import { calculateSteering } from './steering';

export class MicrobotEngine {
  public width: number;
  public height: number;
  public config: SimulationConfig;

  public microbots: Microbot[] = [];
  public energyParticles: EnergyParticle[] = [];
  public hazards: HazardZone[] = [];
  public selectedMicrobotId: string | null = null;

  public spatialGrid: SpatialGrid;
  public totalBirths: number = 0;
  public totalDeaths: number = 0;
  public generationCount: number = 1;
  public frameCount: number = 0;

  // Ring buffers for telemetry analytics
  public populationHistory: number[] = new Array(30).fill(45);
  public birthHistory: number[] = new Array(30).fill(0);
  public deathHistory: number[] = new Array(30).fill(0);
  public historyTimeline: SimulationStats['historyTimeline'] = [];

  private recentBirths: number = 0;
  private recentDeaths: number = 0;
  private nextBotIdNum: number = 1;
  private nextFoodIdNum: number = 1;

  constructor(width: number, height: number, config: SimulationConfig) {
    this.width = width;
    this.height = height;
    this.config = config;
    this.spatialGrid = new SpatialGrid(width, height, 60);

    this.resetSimulation();
  }

  public resetSimulation(): void {
    this.microbots = [];
    this.energyParticles = [];
    this.hazards = [];
    this.selectedMicrobotId = null;
    this.totalBirths = 0;
    this.totalDeaths = 0;
    this.generationCount = 1;
    this.frameCount = 0;
    this.nextBotIdNum = 1;
    this.nextFoodIdNum = 1;
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

      // Mutate traits
      const mut = this.config.mutationRate;
      speed = Math.max(1.0, Math.min(5.0, parent.speed + (Math.random() - 0.5) * mut * 1.5));
      turnRate = Math.max(0.04, Math.min(0.3, parent.turnRate + (Math.random() - 0.5) * mut * 0.1));
      visionRadius = Math.max(60, Math.min(260, parent.visionRadius + (Math.random() - 0.5) * mut * 50));
      energyEfficiency = Math.max(0.6, Math.min(2.5, parent.energyEfficiency + (Math.random() - 0.5) * mut * 0.4));
      hue = (parent.hue + (Math.random() - 0.5) * mut * 80 + 360) % 360;
    }

    const color = `hsl(${Math.round(hue)}, 95%, 55%)`;

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

  public spawnFood(x?: number, y?: number): void {
    const px = x ?? Math.random() * (this.width - 80) + 40;
    const py = y ?? Math.random() * (this.height - 80) + 40;
    const particle: EnergyParticle = {
      id: `EP-${this.nextFoodIdNum++}`,
      x: px,
      y: py,
      value: 25,
      radius: 4
    };
    this.energyParticles.push(particle);
  }

  public spawnMultipleFood(count: number): void {
    for (let i = 0; i < count; i++) {
      this.spawnFood();
    }
  }

  public spawnHazard(): void {
    const id = `HZ-${this.hazards.length + 1}`;
    const radius = 60 + Math.random() * 40;
    const x = Math.random() * (this.width - radius * 2) + radius;
    const y = Math.random() * (this.height - radius * 2) + radius;
    this.hazards.push({ id, x, y, radius, damageRate: 0.8 });
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

    // Rebuild Spatial Grid for food lookup
    this.spatialGrid.clear();
    for (const food of this.energyParticles) {
      this.spatialGrid.insert(food);
    }

    // Spawn energy periodically
    if (this.frameCount % Math.max(1, Math.floor(20 / this.config.energySpawnRate)) === 0) {
      if (this.energyParticles.length < this.config.maxEnergyParticles) {
        this.spawnFood();
      }
    }

    const eatenFoodIds = new Set<string>();
    const deadBotIds = new Set<string>();
    const newOffspring: Microbot[] = [];

    // Update Microbots
    for (const bot of this.microbots) {
      bot.age += speedMult;

      // Update movement trail history
      if (this.frameCount % 5 === 0) {
        bot.trail.push({ x: bot.x, y: bot.y });
        if (bot.trail.length > 12) {
          bot.trail.shift();
        }
      }

      // Query nearby food using Spatial Hash Grid
      const nearbyFood = this.spatialGrid.getNearby(bot.x, bot.y, bot.visionRadius);

      // Calculate Steering Vectors
      const steering = calculateSteering(bot, nearbyFood, this.hazards, this.width, this.height);
      bot.behaviorState = steering.state;

      // Smooth heading rotation
      let diff = steering.desiredHeading - bot.heading;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      bot.heading += diff * bot.turnRate * speedMult;

      // Velocity & Position
      bot.vx = Math.cos(bot.heading) * bot.speed;
      bot.vy = Math.sin(bot.heading) * bot.speed;
      bot.x += bot.vx * speedMult;
      bot.y += bot.vy * speedMult;

      // Keep within canvas bounds
      bot.x = Math.max(15, Math.min(this.width - 15, bot.x));
      bot.y = Math.max(15, Math.min(this.height - 15, bot.y));

      // Calculate battery drain
      const baseDrain = 0.015 + 0.012 * (bot.speed * bot.speed);
      const netDrain = (baseDrain / bot.energyEfficiency) * this.config.batteryDrainMultiplier * speedMult;
      bot.battery -= netDrain;

      // Update individual battery history ring buffer every 10 frames
      if (this.frameCount % 10 === 0) {
        if (!bot.batteryHistory) bot.batteryHistory = [];
        bot.batteryHistory.push(Math.max(0, bot.battery));
        if (bot.batteryHistory.length > 30) {
          bot.batteryHistory.shift();
        }
      }

      // Hazard Damage
      for (const hazard of this.hazards) {
        const dist = Math.hypot(bot.x - hazard.x, bot.y - hazard.y);
        if (dist < hazard.radius) {
          bot.battery -= hazard.damageRate * speedMult * 2.0;
        }
      }

      // Check battery depletion death
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
          eatenFoodIds.add(food.id);
          bot.battery = Math.min(bot.maxBattery, bot.battery + food.value);
          bot.energyCollected += food.value;

          // Asexual Reproduction threshold
          if (bot.battery >= bot.maxBattery * 0.95 && this.microbots.length < this.config.maxPopulation) {
            bot.battery -= 45;
            bot.behaviorState = 'REPRODUCING';
            const child = this.spawnMicrobot(bot);
            newOffspring.push(child);
          }
        }
      }
    }

    // Remove eaten food
    if (eatenFoodIds.size > 0) {
      this.energyParticles = this.energyParticles.filter((f) => !eatenFoodIds.has(f.id));
    }

    // Filter out dead bots
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

  public getStats(): SimulationStats {
    const pop = this.microbots.length;
    let sumSpeed = 0;
    let sumVision = 0;
    let sumEff = 0;

    // Calculate Trait Histograms (10 buckets each)
    const speedHistogram = new Array(10).fill(0);
    const visionHistogram = new Array(10).fill(0);
    const efficiencyHistogram = new Array(10).fill(0);
    const diversityBuckets = new Array(12).fill(0);

    for (const b of this.microbots) {
      sumSpeed += b.speed;
      sumVision += b.visionRadius;
      sumEff += b.energyEfficiency;

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

    return {
      currentPopulation: pop,
      generationCount: this.generationCount,
      energyParticleCount: this.energyParticles.length,
      avgSpeed: pop > 0 ? sumSpeed / pop : 0,
      avgVision: pop > 0 ? sumVision / pop : 0,
      avgEfficiency: pop > 0 ? sumEff / pop : 0,
      totalBirths: this.totalBirths,
      totalDeaths: this.totalDeaths,
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
