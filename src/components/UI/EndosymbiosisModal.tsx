import React from 'react';
import { X, Dna, Sparkles } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface EndosymbiosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  microbots: Microbot[];
}

export const EndosymbiosisModal: React.FC<EndosymbiosisModalProps> = ({ isOpen, onClose, microbots }) => {
  if (!isOpen) return null;

  const totalBots = microbots.length;
  const eukaryoticBots = microbots.filter(b => b.clusterId || b.isPredator).length;

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
        background: 'rgba(18, 14, 30, 0.95)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 0 30px rgba(168, 85, 247, 0.25)',
        color: '#E6EDF3',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles style={{ color: '#C084FC', width: 20, height: 20 }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#C084FC' }}>
              Eukaryotic Endosymbiosis Inspector
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.8rem', color: '#8B949E' }}>Endosymbiont Hosts</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#C084FC' }}>{eukaryoticBots}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.8rem', color: '#8B949E' }}>Total Population</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38BDF8' }}>{totalBots}</div>
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Dna style={{ width: 16, height: 16, color: '#C084FC' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Organellar Genomic Independence</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#A0AEC0', lineHeight: 1.5 }}>
            Absorbed symbionts replicate independent mtDNA/cpDNA sequences, donating high ATP yields to host organisms while retaining mutation lineages.
          </div>
        </div>
      </div>
    </div>
  );
};
