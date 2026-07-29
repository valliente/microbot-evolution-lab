import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Users, Dna, ShieldAlert, Cloud } from 'lucide-react';
import { SimulationConfig } from '../../simulation/types';

interface ControlPanelProps {
  config: SimulationConfig;
  onUpdateConfig: (newConfig: Partial<SimulationConfig>) => void;
  onExportStateSync?: () => void;
  onExportStateSync?: () => void;
  onImportStateSync?: () => void;
  onRunBenchmark?: () => void;
  onSpawnSpore?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, onUpdateConfig, onExportStateSync, onImportStateSync, onRunBenchmark, onSpawnSpore }) => {
  const [openSection, setOpenSection] = useState<'pop' | 'gen' | 'env' | 'sync' | 'all'>('all');

  return (
    <div className="glass-panel" style={{ padding: '12px 14px' }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.85rem',
        fontWeight: 800,
        color: '#ffffff',
        letterSpacing: '0.05em',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <span style={{ color: '#00E5FF' }}>●</span> PARAMETERS & CONTROLS
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <select 
            value={config.targetFPS || 60} 
            onChange={(e) => onUpdateConfig({ targetFPS: parseInt(e.target.value, 10) })}
            style={{ background: '#080E14', color: '#00E676', fontWeight: 800, border: '1px solid rgba(0, 230, 118, 0.4)', borderRadius: 6, padding: '2px 6px', fontSize: '0.62rem', cursor: 'pointer' }}
          >
            <option value="60">60 FPS (Smooth)</option>
            <option value="30">30 FPS (Balanced)</option>
            <option value="15">15 FPS (Battery Saver)</option>
          </select>
          <span style={{ fontSize: '0.62rem', color: '#00E676' }}>⚡ WORKER ON</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Cluster 1: Population Dynamics */}
        <div style={{ background: 'rgba(8, 14, 20, 0.6)', borderRadius: 10, border: '1px solid rgba(0, 229, 255, 0.2)', padding: '8px 10px' }}>
          <div
            className="accordion-header"
            onClick={() => setOpenSection(openSection === 'pop' ? 'all' : 'pop')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', fontWeight: 800, color: '#00E5FF', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users style={{ width: 13, height: 13 }} /> Population Dynamics
            </span>
            {openSection === 'pop' || openSection === 'all' ? <ChevronUp style={{ width: 14, height: 14, color: '#8B949E' }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#8B949E' }} />}
          </div>

          {(openSection === 'pop' || openSection === 'all') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden', transition: 'max-height 0.3s ease, opacity 0.3s ease', maxHeight: 600, opacity: 1 }}>
              {/* Start Pop Slider + Sparkline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px', gap: 8, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>
                    <span>Start Pop</span>
                    <span style={{ color: '#00E5FF', fontWeight: 700 }}>{config.startPopulation}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={config.startPopulation}
                    onChange={(e) => onUpdateConfig({ startPopulation: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', height: 4 }}
                  />
                </div>
                <svg viewBox="0 0 50 16" style={{ width: 50, height: 16 }}>
                  <path d="M 0 14 L 10 10 L 20 12 L 30 6 L 40 4 L 50 8" fill="none" stroke="#00E5FF" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Max Population Slider + Sparkline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px', gap: 8, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>
                    <span>Max Population</span>
                    <span style={{ color: '#00E5FF', fontWeight: 700 }}>{config.maxPopulation}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="400"
                    step="10"
                    value={config.maxPopulation}
                    onChange={(e) => onUpdateConfig({ maxPopulation: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', height: 4 }}
                  />
                </div>
                <svg viewBox="0 0 50 16" style={{ width: 50, height: 16 }}>
                  <path d="M 0 12 L 12 14 L 25 8 L 38 4 L 50 2" fill="none" stroke="#00E676" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Cluster 2: Genetic Dynamics */}
        <div style={{ background: 'rgba(8, 14, 20, 0.6)', borderRadius: 10, border: '1px solid rgba(224, 64, 251, 0.2)', padding: '8px 10px' }}>
          <div
            className="accordion-header"
            onClick={() => setOpenSection(openSection === 'gen' ? 'all' : 'gen')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', fontWeight: 800, color: '#E040FB', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Dna style={{ width: 13, height: 13 }} /> Genetic Dynamics
            </span>
            {openSection === 'gen' || openSection === 'all' ? <ChevronUp style={{ width: 14, height: 14, color: '#8B949E' }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#8B949E' }} />}
          </div>

          {(openSection === 'gen' || openSection === 'all') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Mutation Rate Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>
                  <span>Mutation Tendency</span>
                  <span style={{ color: '#E040FB', fontWeight: 800 }}>{(config.mutationRate * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.50"
                  step="0.01"
                  value={config.mutationRate}
                  onChange={(e) => onUpdateConfig({ mutationRate: parseFloat(e.target.value) })}
                  style={{ width: '100%', height: 4, marginTop: 4 }}
                />
              </div>

              {/* Symbiosis & Parasitism Mechanics */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>
                <span>Symbiosis & Parasitism</span>
                <span style={{ color: '#00E5FF', fontWeight: 800 }}>ENABLED</span>
              </div>

              {/* Battery Drain Rate Slider + Sparkline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px', gap: 8, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>
                    <span>Battery Drain Rate</span>
                    <span style={{ color: '#E040FB', fontWeight: 700 }}>{config.batteryDrainMultiplier.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={config.batteryDrainMultiplier}
                    onChange={(e) => onUpdateConfig({ batteryDrainMultiplier: parseFloat(e.target.value) })}
                    style={{ width: '100%', height: 4 }}
                  />
                </div>
                <svg viewBox="0 0 50 16" style={{ width: 50, height: 16 }}>
                  <path d="M 0 14 L 12 10 L 25 12 L 38 6 L 50 4" fill="none" stroke="#E040FB" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Cluster 3: Environmental Forces */}
        <div style={{ background: 'rgba(8, 14, 20, 0.6)', borderRadius: 10, border: '1px solid rgba(255, 107, 0, 0.2)', padding: '8px 10px' }}>
          <div
            className="accordion-header"
            onClick={() => setOpenSection(openSection === 'env' ? 'all' : 'env')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', fontWeight: 800, color: '#FF6B00', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert style={{ width: 13, height: 13 }} /> Environmental Forces
            </span>
            {openSection === 'env' || openSection === 'all' ? <ChevronUp style={{ width: 14, height: 14, color: '#8B949E' }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#8B949E' }} />}
          </div>

          {(openSection === 'env' || openSection === 'all') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Energy Spawn Rate Slider + Sparkline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px', gap: 8, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>
                    <span>Energy Spawn Rate</span>
                    <span style={{ color: '#FF6B00', fontWeight: 700 }}>{config.energySpawnRate.toFixed(1)}/s</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="12.0"
                    step="0.5"
                    value={config.energySpawnRate}
                    onChange={(e) => onUpdateConfig({ energySpawnRate: parseFloat(e.target.value) })}
                    style={{ width: '100%', height: 4 }}
                  />
                </div>
                <svg viewBox="0 0 50 16" style={{ width: 50, height: 16 }}>
                  <path d="M 0 12 L 15 14 L 30 6 L 50 2" fill="none" stroke="#FF6B00" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Hazard Zones Slider + Sparkline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px', gap: 8, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>
                    <span>Hazard Zones</span>
                    <span style={{ color: '#FF6B00', fontWeight: 700 }}>{config.hazardCount}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="1"
                    value={config.hazardCount}
                    onChange={(e) => onUpdateConfig({ hazardCount: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', height: 4 }}
                  />
                </div>
                <svg viewBox="0 0 50 16" style={{ width: 50, height: 16 }}>
                  <path d="M 0 14 L 10 10 L 20 12 L 30 4 L 40 10 L 50 6" fill="none" stroke="#FF6B00" strokeWidth="1.5" />
                </svg>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E', marginTop: 8 }}>
                <span>Show Terrain Contour</span>
                <button
                  onClick={() => onUpdateConfig({ showTerrainContour: !config.showTerrainContour })}
                  className={config.showTerrainContour ? 'btn-holo btn-holo-cyan' : 'btn-holo btn-holo-dark'}
                  style={{ padding: '2px 8px' }}
                >
                  {config.showTerrainContour ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cluster 4: Data Sync */}
        <div style={{ background: 'rgba(8, 14, 20, 0.6)', borderRadius: 10, border: '1px solid rgba(0, 150, 255, 0.2)', padding: '8px 10px' }}>
          <div
            className="accordion-header"
            onClick={() => setOpenSection(openSection === 'sync' ? 'all' : 'sync')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', fontWeight: 800, color: '#0096FF', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cloud style={{ width: 13, height: 13 }} /> Ecosystem Sync
            </span>
            {openSection === 'sync' || openSection === 'all' ? <ChevronUp style={{ width: 14, height: 14, color: '#8B949E' }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#8B949E' }} />}
          </div>

          {(openSection === 'sync' || openSection === 'all') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-holo btn-holo-cyan" style={{ flex: 1, justifyContent: 'center', fontSize: '0.65rem' }} onClick={onExportStateSync}>
                  Export State
                </button>
                <button className="btn-holo btn-holo-magenta" style={{ flex: 1, justifyContent: 'center', fontSize: '0.65rem' }} onClick={onImportStateSync}>
                  Import State
                </button>
              </div>
              <button className="btn-holo btn-holo-orange" style={{ width: '100%', justifyContent: 'center', fontSize: '0.65rem' }} onClick={onRunBenchmark}>
                Run Diagnostic Benchmark (3000 bots)
              </button>
              
              {onSpawnSpore && (
                <button className="btn-holo btn-holo-magenta" style={{ width: '100%', justifyContent: 'center', fontSize: '0.65rem' }} onClick={onSpawnSpore}>
                  Spawn Parasitic Spores
                </button>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E', marginTop: 4 }}>
                <span>Headless Mode (100x Speed)</span>
                <button
                  onClick={() => onUpdateConfig({ headlessMode: !config.headlessMode })}
                  className={config.headlessMode ? 'btn-holo btn-holo-cyan' : 'btn-holo btn-holo-dark'}
                  style={{ padding: '2px 8px' }}
                >
                  {config.headlessMode ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
