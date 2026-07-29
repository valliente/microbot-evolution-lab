import React, { useRef } from 'react';
import { Play, Pause, RotateCcw, Cpu, HelpCircle, Target, Plus, ShieldAlert, Download, Upload, Sun, Sparkles, Wind, Dna } from 'lucide-react';
import { SimulationConfig, SimulationStats, WeatherEvent, Season } from '../../simulation/types';
import { GeneticDiversityChart } from './GeneticDiversityChart';
import { spatialAudio } from '../../audio/SpatialAudioSynth';

interface HeaderProps {
  config: SimulationConfig;
  stats: SimulationStats;
  onUpdateConfig: (newConfig: Partial<SimulationConfig>) => void;
  onReset: () => void;
  onStep: () => void;
  onOpenRosterMenu: () => void;
  onOpenGuide: () => void;
  onOpenBlueprintStudio: () => void;
  onSpawnFood: () => void;
  onSpawnBots: () => void;
  onSpawnHazard: () => void;
  onTriggerMeteor: () => void;
  onTriggerVoidRift: () => void;
  onTriggerOutbreak: () => void;
  onTriggerRadiationStorm: () => void;
  onTriggerMagneticInversion: () => void;
  onTriggerPortal: () => void;
  onExportTelemetryCSV: () => void;
  onExportConfigJSON: () => void;
  onImportConfigJSON: (jsonConfig: Partial<SimulationConfig>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  stats,
  onUpdateConfig,
  onReset,
  onStep,
  onOpenRosterMenu,
  onOpenGuide,
  onOpenBlueprintStudio,
  onSpawnFood,
  onSpawnBots,
  onSpawnHazard,
  onTriggerMeteor,
  onTriggerVoidRift,
  onTriggerOutbreak,
  onTriggerRadiationStorm,
  onTriggerMagneticInversion,
  onTriggerPortal,
  onExportTelemetryCSV,
  onExportConfigJSON,
  onImportConfigJSON
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImportConfigJSON(parsed);
      } catch (err) {
        alert('Invalid JSON preset file!');
      }
    };
    reader.readAsText(file);
  };

  const seasonIcons: Record<Season, string> = {
    SPRING: '🌸 Spring',
    SUMMER: '☀️ Summer',
    AUTUMN: '🍂 Autumn',
    WINTER: '❄️ Winter'
  };

  return (
    <header className="top-nav-bar">
      {/* Title & Brand */}
      <div className="brand-badge">
        <div className="brand-icon-box">
          <Cpu style={{ width: 22, height: 22 }} />
        </div>
        <div>
          <h1 className="brand-title">
            MICROBOT <span>EVOLUTION LAB</span>
          </h1>
          <p className="brand-sub">
            2D Autonomous Artificial Life & Genetic Evolution Engine
          </p>
        </div>
      </div>

      {/* Playback Control Deck */}
      <div className="glass-deck-pill">
        <button
          onClick={() => onUpdateConfig({ isPaused: !config.isPaused })}
          className={config.isPaused ? 'btn-holo btn-holo-green' : 'btn-holo btn-holo-orange'}
        >
          {config.isPaused ? (
            <>
              <Play style={{ width: 13, height: 13, fill: 'currentColor' }} />
              <span>RESUME</span>
            </>
          ) : (
            <>
              <Pause style={{ width: 13, height: 13, fill: 'currentColor' }} />
              <span>PAUSE</span>
            </>
          )}
        </button>

        <button
          onClick={onStep}
          disabled={!config.isPaused}
          className="btn-holo btn-holo-dark"
          style={{ opacity: config.isPaused ? 1 : 0.4 }}
        >
          STEP
        </button>

        <button onClick={onReset} className="btn-holo btn-holo-dark">
          <RotateCcw style={{ width: 12, height: 12 }} />
          <span>RESET</span>
        </button>

        {/* Speed Slider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginLeft: 6,
          fontSize: '0.68rem',
          fontFamily: "'JetBrains Mono', monospace",
          color: '#00E5FF'
        }}>
          <span style={{ fontWeight: 800, color: '#ffffff' }}>SPEED:</span>
          <input
            type="range"
            min="0.01"
            max="5.0"
            step="0.05"
            value={config.simSpeed}
            onChange={(e) => onUpdateConfig({ simSpeed: parseFloat(e.target.value) })}
            style={{ width: 70, height: 4 }}
          />
          <span style={{ fontWeight: 800, width: 64 }}>{config.simSpeed.toFixed(2)}x ({stats.actualTPS ? stats.actualTPS.toFixed(0) : 0} TPS)</span>
        </div>

        {/* FPS Target Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
          <select
            value={config.targetFPS || 60}
            onChange={(e) => onUpdateConfig({ targetFPS: parseInt(e.target.value, 10) })}
            style={{ background: '#080E14', color: '#00E5FF', fontWeight: 800, border: '1px solid rgba(0, 229, 255, 0.4)', borderRadius: 6, padding: '2px 4px', fontSize: '0.65rem', cursor: 'pointer' }}
          >
            <option value="30">30 FPS</option>
            <option value="60">60 FPS</option>
            <option value="120">120 FPS</option>
            <option value="240">MAX FPS</option>
          </select>
        </div>
      </div>

      {/* Seasons & Pheromones Control Deck */}
      <div className="glass-deck-pill">
        {/* Season Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#00E676' }}>
          <Wind style={{ width: 12, height: 12 }} />
          <select
            value={config.currentSeason || 'SPRING'}
            onChange={(e) => onUpdateConfig({ currentSeason: e.target.value as Season })}
            style={{ background: '#080E14', color: '#00E676', fontWeight: 800, border: '1px solid rgba(0, 230, 118, 0.4)', borderRadius: 6, padding: '3px 6px', fontSize: '0.68rem', cursor: 'pointer' }}
          >
            <option value="SPRING">{seasonIcons.SPRING}</option>
            <option value="SUMMER">{seasonIcons.SUMMER}</option>
            <option value="AUTUMN">{seasonIcons.AUTUMN}</option>
            <option value="WINTER">{seasonIcons.WINTER}</option>
          </select>
          <span style={{ color: '#8B949E', fontSize: '0.62rem' }}>({stats.seasonProgressPct || 0}%)</span>
        </div>

        {/* Pheromones & Split View Toggles */}
        <button
          onClick={() => onUpdateConfig({ showPheromoneTrails: !config.showPheromoneTrails })}
          className={config.showPheromoneTrails ? 'btn-holo btn-holo-magenta' : 'btn-holo btn-holo-dark'}
          style={{ fontSize: '0.68rem', padding: '4px 8px' }}
        >
          <Sparkles style={{ width: 12, height: 12 }} />
          <span>PHEROMONES</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => spatialAudio.toggleMute()}
            className={spatialAudio.getMuted() ? 'btn-holo btn-holo-dark' : 'btn-holo btn-holo-cyan'}
            style={{ fontSize: '0.68rem', padding: '4px 8px' }}
            title="Toggle Procedural Spatial Audio"
          >
            <span>{spatialAudio.getMuted() ? '🔇 MUTED' : '🔊 AUDIO'}</span>
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            defaultValue={0.3}
            onChange={(e) => spatialAudio.setVolume(parseFloat(e.target.value))}
            style={{ width: 50, height: 3, accentColor: '#00E5FF' }}
            title="Master Volume"
          />
        </div>

        {/* Weather Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#FF6B00' }}>
          <Sun style={{ width: 12, height: 12 }} />
          <select
            value={config.weatherEvent || 'CLEAR'}
            onChange={(e) => onUpdateConfig({ weatherEvent: e.target.value as WeatherEvent })}
            style={{ background: '#080E14', color: '#FF6B00', fontWeight: 800, border: '1px solid rgba(255, 107, 0, 0.4)', borderRadius: 6, padding: '3px 6px', fontSize: '0.68rem', cursor: 'pointer' }}
          >
            <option value="CLEAR">☀️ Weather: Clear</option>
            <option value="SOLAR_FLARE">🔥 Solar Flare (+Drain)</option>
            <option value="TOXIC_DRIFT">☣️ Toxic Drift (Hazards)</option>
            <option value="RESOURCE_BLOOM">🌸 Resource Bloom (Food)</option>
          </select>
        </div>
      </div>

      {/* Menu Shortcuts Deck */}
      <div className="glass-deck-pill">
        <button onClick={onExportConfigJSON} className="btn-holo btn-holo-cyan" title="Save preset .json">
          <Download style={{ width: 12, height: 12 }} />
        </button>

        <button onClick={() => fileInputRef.current?.click()} className="btn-holo btn-holo-cyan" title="Load preset .json">
          <Upload style={{ width: 12, height: 12 }} />
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />

        <button onClick={onExportTelemetryCSV} className="btn-holo btn-holo-green" title="Export CSV Data">
          <Download style={{ width: 12, height: 12 }} />
          <span>CSV</span>
        </button>

        <button onClick={onOpenBlueprintStudio} className="btn-holo btn-holo-cyan">
          <Dna style={{ width: 13, height: 13 }} />
          <span>BLUEPRINT STUDIO</span>
        </button>

        <button onClick={onOpenGuide} className="btn-holo btn-holo-cyan">
          <HelpCircle style={{ width: 13, height: 13 }} />
        </button>

        <button onClick={onOpenRosterMenu} className="btn-holo btn-holo-magenta">
          <Target style={{ width: 13, height: 13 }} />
          <span>ROSTER</span>
        </button>

        <button onClick={onSpawnFood} className="btn-holo btn-holo-green">
          <Plus style={{ width: 13, height: 13 }} />
          <span>+20 FOOD</span>
        </button>

        <button onClick={onSpawnBots} className="btn-holo btn-holo-cyan">
          <Plus style={{ width: 13, height: 13 }} />
          <span>+10 BOTS</span>
        </button>

        <button onClick={onSpawnHazard} className="btn-holo btn-holo-orange">
          <ShieldAlert style={{ width: 13, height: 13 }} />
          <span>+HAZARD</span>
        </button>

        <button onClick={onTriggerMeteor} className="btn-holo btn-holo-orange" title="Invoke Meteor Strike">
          <span>☄️ METEOR</span>
        </button>

        <button onClick={onTriggerPortal} className="btn-holo btn-holo-magenta" title="Spawn Linked Portals">
          <span>🌀 PORTAL</span>
        </button>

        <button onClick={onTriggerVoidRift} className="btn-holo btn-holo-magenta" title="Invoke Gravitational Void Rift">
          <span>🌌 RIFT</span>
        </button>

        <button onClick={onTriggerOutbreak} className="btn-holo btn-holo-green" title="Inject Viral Outbreak">
          <span>☣️ VIRUS</span>
        </button>

        <button onClick={onTriggerRadiationStorm} className="btn-holo btn-holo-orange" title="Trigger Radiation Storm">
          <span>☢️ STORM</span>
        </button>

        <button onClick={onTriggerMagneticInversion} className="btn-holo btn-holo-magenta" title="Trigger Magnetic Inversion">
          <span>🧲 INVERT</span>
        </button>
      </div>

      {/* Top Far Right: Genetic Diversity Chart */}
      <GeneticDiversityChart buckets={stats.diversityBuckets || new Array(12).fill(1)} shannonIndex={stats.shannonDiversityIndex} />
    </header>
  );
};
