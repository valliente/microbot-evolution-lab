import React from 'react';
import { Sliders, Zap, Dna, ShieldAlert, Layers } from 'lucide-react';
import { SimulationConfig } from '../../simulation/types';

interface ControlPanelProps {
  config: SimulationConfig;
  onUpdateConfig: (newConfig: Partial<SimulationConfig>) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, onUpdateConfig }) => {
  return (
    <div className="panel-card">
      <div className="panel-header">
        <Sliders style={{ width: 16, height: 16 }} />
        <span>Ecosystem Parameters</span>
      </div>

      {/* Sliders Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Mutation Rate */}
        <div className="slider-group">
          <div className="slider-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Dna style={{ width: 12, height: 12, color: '#c084fc' }} /> Mutation Rate
            </span>
            <span className="slider-value">{(config.mutationRate * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.50"
            step="0.01"
            value={config.mutationRate}
            onChange={(e) => onUpdateConfig({ mutationRate: parseFloat(e.target.value) })}
          />
        </div>

        {/* Energy Spawn Rate */}
        <div className="slider-group">
          <div className="slider-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap style={{ width: 12, height: 12, color: '#34d399' }} /> Energy Spawn Speed
            </span>
            <span className="slider-value">{config.energySpawnRate.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="12.0"
            step="0.5"
            value={config.energySpawnRate}
            onChange={(e) => onUpdateConfig({ energySpawnRate: parseFloat(e.target.value) })}
          />
        </div>

        {/* Max Population */}
        <div className="slider-group">
          <div className="slider-label">
            <span>Max Population Cap</span>
            <span className="slider-value">{config.maxPopulation} BOTS</span>
          </div>
          <input
            type="range"
            min="50"
            max="400"
            step="10"
            value={config.maxPopulation}
            onChange={(e) => onUpdateConfig({ maxPopulation: parseInt(e.target.value, 10) })}
          />
        </div>

        {/* Battery Drain Multiplier */}
        <div className="slider-group">
          <div className="slider-label">
            <span>Battery Drain Rate</span>
            <span className="slider-value">{config.batteryDrainMultiplier.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={config.batteryDrainMultiplier}
            onChange={(e) => onUpdateConfig({ batteryDrainMultiplier: parseFloat(e.target.value) })}
          />
        </div>

        {/* Hazard Zone Count */}
        <div className="slider-group">
          <div className="slider-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldAlert style={{ width: 12, height: 12, color: '#fb7185' }} /> Hazard Zones
            </span>
            <span className="slider-value">{config.hazardCount} ZONES</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={config.hazardCount}
            onChange={(e) => onUpdateConfig({ hazardCount: parseInt(e.target.value, 10) })}
          />
        </div>
      </div>

      {/* Visual Overlays Toggles */}
      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Layers style={{ width: 12, height: 12, color: '#00f0ff' }} /> Visual Overlay Filters
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.72rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#cbd5e1' }}>
            <input
              type="checkbox"
              checked={config.showSensoryRings}
              onChange={(e) => onUpdateConfig({ showSensoryRings: e.target.checked })}
              style={{ accentColor: '#00f0ff' }}
            />
            <span>Show Sensory Vision Rings</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#cbd5e1' }}>
            <input
              type="checkbox"
              checked={config.showMovementTrails}
              onChange={(e) => onUpdateConfig({ showMovementTrails: e.target.checked })}
              style={{ accentColor: '#00f0ff' }}
            />
            <span>Show Microbot Movement Trails</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#cbd5e1' }}>
            <input
              type="checkbox"
              checked={config.showTargetVectors}
              onChange={(e) => onUpdateConfig({ showTargetVectors: e.target.checked })}
              style={{ accentColor: '#00f0ff' }}
            />
            <span>Show Target Vector Headings</span>
          </label>
        </div>
      </div>
    </div>
  );
};
