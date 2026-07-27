import React, { useState } from 'react';
import { X, Dna, Sliders, Sparkles, Plus } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface BlueprintStudioModalProps {
  isOpen: boolean;
  onSpawnBlueprint: (blueprint: Partial<Microbot>, count: number) => void;
  onClose: () => void;
}

export const BlueprintStudioModal: React.FC<BlueprintStudioModalProps> = ({
  isOpen,
  onSpawnBlueprint,
  onClose
}) => {
  const [strainName, setStrainName] = useState<string>('ALPHA-STRAIN-V1');
  const [speed, setSpeed] = useState<number>(3.2);
  const [visionRadius, setVisionRadius] = useState<number>(160);
  const [energyEfficiency, setEnergyEfficiency] = useState<number>(1.8);
  const [turnRate, setTurnRate] = useState<number>(0.15);
  const [hue, setHue] = useState<number>(280);
  const [spawnCount, setSpawnCount] = useState<number>(5);

  if (!isOpen) return null;

  const color = `hsl(${hue}, 95%, 55%)`;

  const handleCreateBlueprint = () => {
    onSpawnBlueprint(
      {
        speed,
        maxSpeed: speed,
        visionRadius,
        energyEfficiency,
        turnRate,
        hue,
        color
      },
      spawnCount
    );
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#0b0f19',
        border: '2px solid #00E5FF',
        borderRadius: '18px',
        maxWidth: '560px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 0 40px rgba(0, 229, 255, 0.3)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#8B949E', cursor: 'pointer' }}
        >
          <X style={{ width: 20, height: 20 }} />
        </button>

        <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', color: '#ffffff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Dna style={{ color: '#00E5FF' }} /> BLUEPRINT STUDIO & GENE DESIGNER
        </h2>
        <p style={{ fontSize: '0.75rem', color: '#8B949E', marginBottom: 20 }}>
          Craft custom genetic strains and spawn custom artificial life blueprints into the evolution matrix.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Strain Name */}
          <div>
            <label style={{ fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E', display: 'block', marginBottom: 4 }}>
              STRAIN NAME DESIGNATION
            </label>
            <input
              type="text"
              value={strainName}
              onChange={(e) => setStrainName(e.target.value)}
              style={{
                width: '100%',
                background: '#080E14',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#00E5FF',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 800
              }}
            />
          </div>

          {/* Speed */}
          <div style={{ background: 'rgba(15, 26, 36, 0.7)', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>
              <span>Target Velocity (Speed)</span>
              <span style={{ color: '#00E5FF', fontWeight: 800 }}>{speed.toFixed(1)} px/f</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              style={{ width: '100%', height: 4, marginTop: 6 }}
            />
          </div>

          {/* Vision */}
          <div style={{ background: 'rgba(15, 26, 36, 0.7)', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>
              <span>Sensory Vision Radius</span>
              <span style={{ color: '#60a5fa', fontWeight: 800 }}>{visionRadius} px</span>
            </div>
            <input
              type="range"
              min="60"
              max="260"
              step="5"
              value={visionRadius}
              onChange={(e) => setVisionRadius(parseInt(e.target.value, 10))}
              style={{ width: '100%', height: 4, marginTop: 6 }}
            />
          </div>

          {/* Efficiency */}
          <div style={{ background: 'rgba(15, 26, 36, 0.7)', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>
              <span>Energy Efficiency Rating</span>
              <span style={{ color: '#00E676', fontWeight: 800 }}>{energyEfficiency.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="2.5"
              step="0.1"
              value={energyEfficiency}
              onChange={(e) => setEnergyEfficiency(parseFloat(e.target.value))}
              style={{ width: '100%', height: 4, marginTop: 6 }}
            />
          </div>

          {/* Color & Spawn Count */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(15, 26, 36, 0.7)', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>
                <span>Pigment Hue</span>
                <span style={{ color, fontWeight: 800 }}>{hue}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={hue}
                onChange={(e) => setHue(parseInt(e.target.value, 10))}
                style={{ width: '100%', height: 4, marginTop: 6 }}
              />
            </div>

            <div style={{ background: 'rgba(15, 26, 36, 0.7)', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>
                <span>Spawn Count</span>
                <span style={{ color: '#E040FB', fontWeight: 800 }}>{spawnCount} Bots</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={spawnCount}
                onChange={(e) => setSpawnCount(parseInt(e.target.value, 10))}
                style={{ width: '100%', height: 4, marginTop: 6 }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-holo btn-holo-dark">
            CANCEL
          </button>
          <button onClick={handleCreateBlueprint} className="btn-holo btn-holo-cyan" style={{ padding: '8px 18px' }}>
            <Plus style={{ width: 14, height: 14 }} /> SPAWN STRAIN BLUEPRINT
          </button>
        </div>
      </div>
    </div>
  );
};
