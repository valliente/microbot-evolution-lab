import React from 'react';
import { Play, Pause, RotateCcw, Cpu, HelpCircle, Target, Sparkles, Plus, Film, ShieldAlert, Trash2 } from 'lucide-react';
import { SimulationConfig } from '../../simulation/types';

interface HeaderProps {
  config: SimulationConfig;
  isAutoDemo: boolean;
  onUpdateConfig: (newConfig: Partial<SimulationConfig>) => void;
  onReset: () => void;
  onStep: () => void;
  onSelectRandomBot: () => void;
  onOpenGuide: () => void;
  onSpawnFood: () => void;
  onSpawnBots: () => void;
  onSpawnHazard: () => void;
  onClearHazards: () => void;
  onToggleAutoDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  isAutoDemo,
  onUpdateConfig,
  onReset,
  onStep,
  onSelectRandomBot,
  onOpenGuide,
  onSpawnFood,
  onSpawnBots,
  onSpawnHazard,
  onClearHazards,
  onToggleAutoDemo
}) => {
  return (
    <header className="header-bar">
      {/* Title & Logo */}
      <div className="logo-group">
        <div className="logo-icon">
          <div className="logo-inner">
            <Cpu style={{ width: 24, height: 24 }} />
          </div>
        </div>
        <div>
          <h1 className="title-text">
            MICROBOT <span className="title-highlight">EVOLUTION LAB</span>
          </h1>
          <p className="subtitle-text">
            2D Autonomous Artificial Life & Genetic Evolution Engine
          </p>
        </div>
      </div>

      {/* Interactive Action Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <button onClick={onOpenGuide} className="btn btn-cyan">
          <HelpCircle style={{ width: 14, height: 14 }} />
          <span>GUIDE</span>
        </button>

        <button onClick={onSelectRandomBot} className="btn btn-purple" title="Auto-select an active microbot!">
          <Target style={{ width: 14, height: 14 }} />
          <span>🎯 SELECT BOT</span>
        </button>

        <button onClick={onSpawnFood} className="btn btn-emerald" title="Drop 20 green food dots!">
          <Plus style={{ width: 14, height: 14 }} />
          <span>🍏 +20 FOOD</span>
        </button>

        <button onClick={onSpawnBots} className="btn btn-cyan" title="Spawn 10 new microbots!">
          <Plus style={{ width: 14, height: 14 }} />
          <span>🤖 +10 BOTS</span>
        </button>

        <button onClick={onSpawnHazard} className="btn btn-rose" title="Spawn a red hazard zone!">
          <ShieldAlert style={{ width: 14, height: 14 }} />
          <span>💥 +HAZARD</span>
        </button>

        <button onClick={onClearHazards} className="btn btn-dark" title="Clear all hazard zones!">
          <Trash2 style={{ width: 14, height: 14 }} />
          <span>CLEAR</span>
        </button>

        <button onClick={onToggleAutoDemo} className={isAutoDemo ? 'btn btn-cyan' : 'btn btn-dark'}>
          <Film style={{ width: 14, height: 14 }} />
          <span>{isAutoDemo ? '🎬 DEMO: ON' : '🎬 AUTO DEMO'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#030712', padding: '4px 8px', borderRadius: 8, fontSize: '0.7rem' }}>
          <Sparkles style={{ width: 12, height: 12, color: '#fbbf24' }} />
          <button onClick={() => onUpdateConfig({ mutationRate: 0.25, energySpawnRate: 10.0, simSpeed: 2.0 })} className="btn btn-dark" style={{ padding: '4px 8px' }}>
            ⚡ Fast
          </button>
          <button onClick={() => onUpdateConfig({ hazardCount: 8, batteryDrainMultiplier: 1.5, mutationRate: 0.20 })} className="btn btn-dark" style={{ padding: '4px 8px' }}>
            🛡️ Survival
          </button>
        </div>
      </div>

      {/* Simulation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(3, 7, 18, 0.8)', padding: '6px 10px', borderRadius: 10, border: '1px solid rgba(0, 240, 255, 0.2)' }}>
        <button
          onClick={() => onUpdateConfig({ isPaused: !config.isPaused })}
          className={config.isPaused ? 'btn btn-emerald' : 'btn btn-rose'}
        >
          {config.isPaused ? (
            <>
              <Play style={{ width: 14, height: 14, fill: 'currentColor' }} />
              <span>RESUME</span>
            </>
          ) : (
            <>
              <Pause style={{ width: 14, height: 14, fill: 'currentColor' }} />
              <span>PAUSE</span>
            </>
          )}
        </button>

        <button onClick={onStep} disabled={!config.isPaused} className="btn btn-dark" style={{ opacity: config.isPaused ? 1 : 0.4 }}>
          STEP
        </button>

        <button onClick={onReset} className="btn btn-dark">
          <RotateCcw style={{ width: 12, height: 12 }} />
          <span>RESET</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 6, fontSize: '0.7rem', color: '#94a3b8' }}>
          <span>SPEED:</span>
          <select
            value={config.simSpeed}
            onChange={(e) => onUpdateConfig({ simSpeed: parseFloat(e.target.value) })}
            style={{ background: '#090d16', color: '#00f0ff', fontWeight: 700, borderRadius: 6, border: '1px solid rgba(0, 240, 255, 0.3)', padding: '4px 6px', cursor: 'pointer' }}
          >
            <option value="0.5">0.5x</option>
            <option value="1.0">1.0x</option>
            <option value="2.0">2.0x</option>
            <option value="3.5">3.5x</option>
            <option value="5.0">5.0x</option>
          </select>
        </div>
      </div>
    </header>
  );
};
