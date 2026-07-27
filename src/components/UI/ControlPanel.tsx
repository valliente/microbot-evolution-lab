import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Users, Dna, ShieldAlert } from 'lucide-react';
import { SimulationConfig } from '../../simulation/types';

interface ControlPanelProps {
  config: SimulationConfig;
  onUpdateConfig: (newConfig: Partial<SimulationConfig>) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, onUpdateConfig }) => {
  const [openSection, setOpenSection] = useState<'pop' | 'gen' | 'env' | 'all'>('all');

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
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Cluster 1: Population Dynamics */}
        <div style={{ background: 'rgba(8, 14, 20, 0.6)', borderRadius: 10, border: '1px solid rgba(0, 229, 255, 0.2)', padding: '8px 10px' }}>
          <div
            onClick={() => setOpenSection(openSection === 'pop' ? 'all' : 'pop')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: 6 }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', fontWeight: 800, color: '#00E5FF', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users style={{ width: 13, height: 13 }} /> Population Dynamics
            </span>
            {openSection === 'pop' || openSection === 'all' ? <ChevronUp style={{ width: 14, height: 14, color: '#8B949E' }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#8B949E' }} />}
          </div>

          {(openSection === 'pop' || openSection === 'all') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            onClick={() => setOpenSection(openSection === 'gen' ? 'all' : 'gen')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: 6 }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', fontWeight: 800, color: '#E040FB', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Dna style={{ width: 13, height: 13 }} /> Genetic Dynamics
            </span>
            {openSection === 'gen' || openSection === 'all' ? <ChevronUp style={{ width: 14, height: 14, color: '#8B949E' }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#8B949E' }} />}
          </div>

          {(openSection === 'gen' || openSection === 'all') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Mutation Rate Slider + Sparkline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px', gap: 8, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>
                    <span>Mutation Rate</span>
                    <span style={{ color: '#E040FB', fontWeight: 700 }}>{(config.mutationRate * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.50"
                    step="0.01"
                    value={config.mutationRate}
                    onChange={(e) => onUpdateConfig({ mutationRate: parseFloat(e.target.value) })}
                    style={{ width: '100%', height: 4 }}
                  />
                </div>
                <svg viewBox="0 0 50 16" style={{ width: 50, height: 16 }}>
                  <path d="M 0 10 L 10 4 L 20 14 L 30 6 L 40 8 L 50 2" fill="none" stroke="#E040FB" strokeWidth="1.5" />
                </svg>
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
            onClick={() => setOpenSection(openSection === 'env' ? 'all' : 'env')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: 6 }}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
