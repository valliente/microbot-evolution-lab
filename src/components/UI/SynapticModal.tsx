import React from 'react';
import { X, Brain, Activity, Zap } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface SynapticModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot: Microbot | null;
}

export const SynapticModal: React.FC<SynapticModalProps> = ({ isOpen, onClose, bot }) => {
  if (!isOpen || !bot) return null;

  const plasticityScore = Math.min(100, Math.floor((bot.age * 0.2 + bot.energyCollected * 1.5) % 100));
  const connectionsCount = 8 + (bot.generation % 5) * 4;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 10, 16, 0.82)',
      backdropFilter: 'blur(10px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 480,
        background: 'rgba(15, 26, 38, 0.95)',
        border: '1px solid rgba(224, 64, 251, 0.4)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 0 30px rgba(224, 64, 251, 0.25)',
        color: '#E6EDF3',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain style={{ color: '#E040FB', width: 22, height: 22 }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#E040FB' }}>
              Synaptic Plasticity Inspector
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.8rem', color: '#8B949E', marginBottom: 4 }}>Microbot Subject ID</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#00E5FF' }}>{bot.id}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: '#8B949E', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Activity style={{ width: 14, height: 14, color: '#00E676' }} /> Synaptic Efficiency
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00E676', marginTop: 4 }}>
                {plasticityScore}%
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: '#8B949E', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap style={{ width: 14, height: 14, color: '#E040FB' }} /> Active Connections
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#E040FB', marginTop: 4 }}>
                {connectionsCount} Synapses
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
