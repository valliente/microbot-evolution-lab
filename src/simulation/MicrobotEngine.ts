import {
  Microbot,
  EnergyParticle,
  HazardZone,
  SimulationConfig,
  SimulationStats,
  BehaviorState,
  HistoryDataPoint
} from './types';
import { SpatialGrid } from './SpatialGrid';
import {
  clampAngleStep,
  calculateWanderHeading,
  calculateSeekHeading,
  calculateFleeHeading,
  calculateBoundaryCorrection
} from './steering';
import { getRandomHue, mutateHue, formatHueToHSL } from './color';

export class MicrobotEngine {
  public width: number;
  public height: number;
  public config: SimulationConfig;

  public microbots: Microbot[] = [];
  public energyParticles: EnergyParticle[] = [];
  public hazards: HazardZone[] = [];

  public selectedMicrobotId: string | null = null;
  private nextId: number = 1;

  // Spatial grids
  public botGrid: SpatialGrid<Microbot>;
  private energyGrid: SpatialGrid<EnergyParticle>;

  // Lifetime metrics
  public totalBirths: number = 0;
  public totalDeaths: number = 0;
  public highestGen: number = 1;
  public frameCount: number = 0;

  // History timeline for graph
  public history: HistoryDataPoint[] = [];

  constructor(width: number, height: number, config: SimulationConfig) {
    this.width = width;
    this.height = height;
    this.config = config;

    this.botGrid = new SpatialGrid<Microbot>(80);
    this.energyGrid = new SpatialGrid<EnergyParticle>(80);

    this.resetSimulation();
  }

  public resize(width: number, height: number): void {
    this.width = Math.max(400, width);
    this.height = Math.max(300, height);
  }

  public resetSimulation(): void {
    this.microbots = [];
    this.energyParticles = [];
    this.hazards = [];
    this.selectedMicrobotId = null;
    this.nextId = 1;
    this.totalBirths = 0;
    this.totalDeaths = 0;
    this.highestGen = 1;
    this.frameCount = 0;
    this.history = [];

    // Spawn initial hazards
    this.updateHazardsCount();

    // Spawn initial population
    for (let i = 0; i < this.config.startPopulation; i++) {
      this.spawnMicrobot();
    }

    // Spawn initial energy particles
    const initialEnergyCount = Math.min(100, Math.floor(this.config.startPopulation * 1.5));
    for (let i = 0; i < initialEnergyCount; i++) {
      this.spawnEnergyParticle();
    }
  }

  private generateId(): string {
    return `MB-${(this.nextId++).toString().padStart(4, '0')}`;
  }

  public spawnMicrobot(parent: Microbot | null = null): Microbot {
    const hue = parent ? mutateHue(parent.hue, this.config.mutationRate) : getRandomHue();
    const generation = parent ? parent.generation + 1 : 1;

    // Mutate traits from parent or use baseline randoms
    const speed = parent
      ? Math.max(0.8, Math.min(6.0, parent.speed + (Math.random() - 0.5) * 0.8 * this.config.mutationRate))
      : 2.2 + (Math.random() - 0.5) * 1.0;

    const turnSpeed = parent
      ? Math.max(0.04, Math.min(0.3, parent.turnSpeed + (Math.random() - 0.5) * 0.05 * this.config.mutationRate))
      : 0.12 + (Math.random() - 0.5) * 0.04;

    const visionRadius = parent
      ? Math.max(40, Math.min(220, parent.visionRadius + (Math.random() - 0.5) * 25 * this.config.mutationRate))
      : 90 + (Math.random() - 0.5) * 30;

    const maxBattery = parent
      ? Math.max(50, Math.min(300, parent.maxBattery + (Math.random() - 0.5) * 40 * this.config.mutationRate))
      : 130 + (Math.random() - 0.5) * 40;

    const energyEfficiency = parent
      ? Math.max(0.5, Math.min(2.5, parent.energyEfficiency + (Math.random() - 0.5) * 0.4 * this.config.mutationRate))
      : 1.0 + (Math.random() - 0.5) * 0.3;

    // Spawn location: near parent or random canvas position
    let x: number, y: number;
    if (parent) {
      const angle = Math.random() * Math.PI * 2;
      x = Math.max(20, Math.min(this.width - 20, parent.x + Math.cos(angle) * 15));
      y = Math.max(20, Math.min(this.height - 20, parent.y + Math.sin(angle) * 15));
    } else {
      x = Math.random() * (this.width - 80) + 40;
      y = Math.random() * (this.height - 80) + 40;
    }

    const bot: Microbot = {
      id: this.generateId(),
      x,
      y,
      vx: 0,
      vy: 0,
      heading: Math.random() * Math.PI * 2,
      speed,
      turnSpeed,
      visionRadius,
      maxBattery,
      battery: parent ? parent.battery * 0.45 : maxBattery * 0.9,
      energyEfficiency,
      age: 0,
      generation,
      parentId: parent ? parent.id : null,
      offspringCount: 0,
      hue,
      color: formatHueToHSL(hue),
      trail: [],
      behaviorState: 'WANDERING',
      energyCollected: 0
    };

    this.microbots.push(bot);
    this.totalBirths++;

    if (generation > this.highestGen) {
      this.highestGen = generation;
    }

    return bot;
  }

  public spawnEnergyParticle(): void {
    this.energyParticles.push({
      id: `E-${Math.random().toString(36).substr(2, 6)}`,
      x: Math.random() * (this.width - 60) + 30,
      y: Math.random() * (this.height - 60) + 30,
      value: 35 + Math.random() * 20,
      radius: 4.5
    });
  }

  public updateHazardsCount(): void {
    const targetCount = this.config.hazardCount;
    while (this.hazards.length < targetCount) {
      this.hazards.push({
        id: `H-${Math.random().toString(36).substr(2, 6)}`,
        x: Math.random() * (this.width - 160) + 80,
        y: Math.random() * (this.height - 160) + 80,
        radius: 35 + Math.random() * 40,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    while (this.hazards.length > targetCount) {
      this.hazards.pop();
    }
  }

  public update(_dt: number = 1.0): void {
    if (this.config.isPaused) return;

    this.frameCount++;
    const speedMult = this.config.simSpeed;

    // Update hazards pulse animation
    for (let i = 0; i < this.hazards.length; i++) {
      this.hazards[i].pulsePhase += 0.03 * speedMult;
    }

    // Rebuild spatial grid for microbots and energy particles
    this.botGrid.clear();
    this.botGrid.insertAll(this.microbots);

    this.energyGrid.clear();
    this.energyGrid.insertAll(this.energyParticles);

    // Spawn energy particles periodically
    const energyTarget = Math.min(200, Math.floor(this.config.energySpawnRate * 10));
    if (this.energyParticles.length < energyTarget && Math.random() < 0.2 * this.config.energySpawnRate * speedMult) {
      this.spawnEnergyParticle();
    }

    const deadBotIds = new Set<string>();
    const newOffspring: Microbot[] = [];
    const eatenParticleIds = new Set<string>();

    // Update microbots
    for (let i = 0; i < this.microbots.length; i++) {
      const bot = this.microbots[i];
      bot.age += speedMult;

      // 1. Environmental perception via Spatial Grid
      const nearbyEnergy = this.energyGrid.queryRadius(bot.x, bot.y, bot.visionRadius);

      // Find hazards in vision
      let closestHazard: HazardZone | null = null;
      let minHazardDistSq = Infinity;

      for (let j = 0; j < this.hazards.length; j++) {
        const hazard = this.hazards[j];
        const dx = hazard.x - bot.x;
        const dy = hazard.y - bot.y;
        const distSq = dx * dx + dy * dy;
        const detectRadius = bot.visionRadius + hazard.radius;
        if (distSq <= detectRadius * detectRadius && distSq < minHazardDistSq) {
          minHazardDistSq = distSq;
          closestHazard = hazard;
        }
      }

      // 2. Behavior State Determination & Steering
      let targetHeading = bot.heading;
      let state: BehaviorState = 'WANDERING';

      if (closestHazard) {
        state = 'EVADING_HAZARD';
        targetHeading = calculateFleeHeading(bot, closestHazard);
      } else if (nearbyEnergy.length > 0) {
        // Find closest uneaten energy particle
        let closestEnergy: EnergyParticle | null = null;
        let minEnergyDistSq = Infinity;
        for (let k = 0; k < nearbyEnergy.length; k++) {
          const ep = nearbyEnergy[k];
          if (eatenParticleIds.has(ep.id)) continue;
          const dx = ep.x - bot.x;
          const dy = ep.y - bot.y;
          const dsq = dx * dx + dy * dy;
          if (dsq < minEnergyDistSq) {
            minEnergyDistSq = dsq;
            closestEnergy = ep;
          }
        }

        if (closestEnergy) {
          state = 'SEEKING_ENERGY';
          targetHeading = calculateSeekHeading(bot, { x: closestEnergy.x, y: closestEnergy.y });

          // Check energy particle collection
          const dist = Math.sqrt(minEnergyDistSq);
          if (dist <= 8) {
            eatenParticleIds.add(closestEnergy.id);
            bot.battery = Math.min(bot.maxBattery, bot.battery + closestEnergy.value);
            bot.energyCollected += closestEnergy.value;
          }
        } else {
          targetHeading = calculateWanderHeading(bot);
        }
      } else {
        targetHeading = calculateWanderHeading(bot);
      }

      // Apply boundary steering correction
      targetHeading = calculateBoundaryCorrection(bot.x, bot.y, targetHeading, this.width, this.height);

      // Smooth heading transition based on turn speed
      const turnStep = clampAngleStep(bot.heading, targetHeading, bot.turnSpeed * speedMult);
      bot.heading += turnStep;
      bot.behaviorState = state;

      // 3. Movement & Battery Consumption
      const moveDist = bot.speed * speedMult;
      bot.vx = Math.cos(bot.heading) * moveDist;
      bot.vy = Math.sin(bot.heading) * moveDist;
      bot.x += bot.vx;
      bot.y += bot.vy;

      // Boundary clamp & rebound
      if (bot.x < 15) { bot.x = 15; bot.heading = Math.PI - bot.heading; }
      if (bot.x > this.width - 15) { bot.x = this.width - 15; bot.heading = Math.PI - bot.heading; }
      if (bot.y < 15) { bot.y = 15; bot.heading = -bot.heading; }
      if (bot.y > this.height - 15) { bot.y = this.height - 15; bot.heading = -bot.heading; }

      // Update movement trail
      if (this.config.showTrails) {
        bot.trail.push({ x: bot.x, y: bot.y });
        if (bot.trail.length > 12) {
          bot.trail.shift();
        }
      } else if (bot.trail.length > 0) {
        bot.trail = [];
      }

      // Calculate battery drain: speed squared / efficiency
      const baseDrain = 0.05 + 0.03 * (bot.speed * bot.speed);
      const netDrain = (baseDrain / bot.energyEfficiency) * this.config.batteryDrainMultiplier * speedMult;
      bot.battery -= netDrain;

      // Hazard damage check
      for (let j = 0; j < this.hazards.length; j++) {
        const hazard = this.hazards[j];
        const dx = bot.x - hazard.x;
        const dy = bot.y - hazard.y;
        if (dx * dx + dy * dy <= hazard.radius * hazard.radius) {
          bot.battery -= 0.6 * this.config.batteryDrainMultiplier * speedMult; // Hazard battery damage
        }
      }

      // Check battery depletion death
      if (bot.battery <= 0) {
        bot.battery = 0;
        deadBotIds.add(bot.id);
        this.totalDeaths++;
        continue;
      }

      // 4. Reproduction Mechanic
      if (
        bot.battery >= bot.maxBattery * 0.85 &&
        bot.energyCollected >= 45 &&
        this.microbots.length + newOffspring.length < this.config.maxPopulation
      ) {
        bot.battery *= 0.5; // Parent shares battery
        bot.energyCollected = 0;
        bot.offspringCount++;
        bot.behaviorState = 'REPRODUCING';

        const child = this.spawnMicrobot(bot);
        newOffspring.push(child);
      }
    }

    // Filter out eaten particles
    if (eatenParticleIds.size > 0) {
      this.energyParticles = this.energyParticles.filter((ep) => !eatenParticleIds.has(ep.id));
    }

    // Filter out dead bots
    if (deadBotIds.size > 0) {
      if (this.selectedMicrobotId && deadBotIds.has(this.selectedMicrobotId)) {
        // Keep selected bot or reset if dead
      }
      this.microbots = this.microbots.filter((b) => !deadBotIds.has(b.id));
    }

    // Record stats timeline snapshot every 60 frames (~1 sec)
    if (this.frameCount % 60 === 0) {
      this.recordHistorySnapshot();
    }
  }

  private recordHistorySnapshot(): void {
    const stats = this.getStats();
    this.history.push({
      time: Math.floor(this.frameCount / 60),
      population: stats.currentPopulation,
      births: this.totalBirths,
      deaths: this.totalDeaths,
      avgSpeed: stats.avgSpeed,
      avgVision: stats.avgVisionRadius,
      avgEfficiency: stats.avgEnergyEfficiency
    });

    if (this.history.length > 50) {
      this.history.shift();
    }
  }

  public selectMicrobotAt(x: number, y: number): Microbot | null {
    let closest: Microbot | null = null;
    let minRangeSq = 28 * 28; // Increased click tolerance radius for fast moving bots

    for (let i = 0; i < this.microbots.length; i++) {
      const bot = this.microbots[i];
      const dx = bot.x - x;
      const dy = bot.y - y;
      const dsq = dx * dx + dy * dy;
      if (dsq < minRangeSq) {
        minRangeSq = dsq;
        closest = bot;
      }
    }

    this.selectedMicrobotId = closest ? closest.id : null;
    return closest;
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

  public getStats(): SimulationStats {
    const pop = this.microbots.length;
    if (pop === 0) {
      return {
        currentPopulation: 0,
        highestGen: this.highestGen,
        totalBirths: this.totalBirths,
        totalDeaths: this.totalDeaths,
        avgSpeed: 0,
        avgVisionRadius: 0,
        avgEnergyEfficiency: 0,
        history: this.history
      };
    }

    let sumSpeed = 0;
    let sumVision = 0;
    let sumEff = 0;

    for (let i = 0; i < pop; i++) {
      const b = this.microbots[i];
      sumSpeed += b.speed;
      sumVision += b.visionRadius;
      sumEff += b.energyEfficiency;
    }

    return {
      currentPopulation: pop,
      highestGen: this.highestGen,
      totalBirths: this.totalBirths,
      totalDeaths: this.totalDeaths,
      avgSpeed: Number((sumSpeed / pop).toFixed(2)),
      avgVisionRadius: Number((sumVision / pop).toFixed(1)),
      avgEnergyEfficiency: Number((sumEff / pop).toFixed(2)),
      history: this.history
    };
  }
}
