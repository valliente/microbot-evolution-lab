import React from 'react';
import { X, Network, Zap } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface HGTModalProps {
  isOpen: boolean;
  onClose: () => void;
  microbots: Microbot[];
}

export const HGTModal: React.FC<HGTModalProps> = ({ isOpen, onClose, microbots }) => {
  if (!isOpen) return null;

  const totalBots = microbots.length;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 520,
        background: 'rgba(10, 18, 28, 0.95)',
        border: '1px solid rgba(0, 229, 255, 0.4)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 0 30px rgba(0, 229, 255, 0.25)',
        color: '#E6EDF3',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Network style={{ color: '#00E5FF', width: 20, height: 20 }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#00E5FF' }}>
              Horizontal Gene Transfer & Conjugation Inspector
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.8rem', color: '#8B949E' }}>Active Population</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00E5FF' }}>{totalBots}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.8rem', color: '#8B949E' }}>HGT Exchange Rate</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FACC15' }}>Active</div>
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Zap style={{ width: 16, height: 16, color: '#00E5FF' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Conjugation Pili & Viral Transduction</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#A0AEC0', lineHeight: 1.5 }}>
            Agents form physical conjugation bridges to exchange metabolic plasmids laterally across species boundaries, accelerating non-vertical adaptation.
          </div>
        </div>
      </div>
    </div>
  );
};
