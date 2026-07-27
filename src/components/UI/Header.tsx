import React from 'react';
import { Play, Pause, RotateCcw, Cpu, HelpCircle, Target, Plus, ShieldAlert } from 'lucide-react';
import { SimulationConfig, SimulationStats } from '../../simulation/types';
import { GeneticDiversityChart } from './GeneticDiversityChart';

interface HeaderProps {
  config: SimulationConfig;
  stats: SimulationStats;
  onUpdateConfig: (newConfig: Partial<SimulationConfig>) => void;
  onReset: () => void;
  onStep: () => void;
  onOpenRosterMenu: () => void;
  onOpenGuide: () => void;
  onSpawnFood: () => void;
  onSpawnBots: () => void;
  onSpawnHazard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  stats,
  onUpdateConfig,
  onReset,
  onStep,
  onOpenRosterMenu,
  onOpenGuide,
  onSpawnFood,
  onSpawnBots,
  onSpawnHazard
}) => {
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

        {/* Horizontal Speed Scrubber Slider */}
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
            style={{ width: 85, height: 4 }}
          />
          <span style={{ fontWeight: 800, width: 34 }}>{config.simSpeed.toFixed(2)}x</span>
        </div>
      </div>

      {/* Menu & Action Shortcut Deck */}
      <div className="glass-deck-pill">
        <button onClick={onOpenGuide} className="btn-holo btn-holo-cyan">
          <HelpCircle style={{ width: 13, height: 13 }} />
          <span>GUIDE</span>
        </button>

        <button onClick={onOpenRosterMenu} className="btn-holo btn-holo-magenta">
          <Target style={{ width: 13, height: 13 }} />
          <span>SELECT BOT MENU</span>
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
      </div>

      {/* Top Far Right: Genetic Diversity Chart */}
      <GeneticDiversityChart buckets={stats.diversityBuckets || new Array(12).fill(1)} />
    </header>
  );
};
