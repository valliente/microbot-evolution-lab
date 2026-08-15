import React from 'react';
import { X, Network, Shield, Zap, Wind } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface MulticellularModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot: Microbot | null;
}

export const MulticellularModal: React.FC<MulticellularModalProps> = ({ isOpen, onClose, bot }) => {
  if (!isOpen || !bot) return null;

  const clusterId = bot.clusterId || 'SOLITARY';
  const role = bot.tissueRole || 'UNDIFFERENTIATED';
  const bondCount = bot.tissueBonds ? bot.tissueBonds.length : 0;

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
        border: '1px solid rgba(0, 229, 255, 0.4)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 0 30px rgba(0, 229, 255, 0.25)',
        color: '#E6EDF3',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Network style={{ color: '#00E5FF', width: 22, height: 22 }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#00E5FF' }}>
              Multicellular Structure Inspector
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.8rem', color: '#8B949E', marginBottom: 4 }}>Organism Cluster ID</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#00E676' }}>{clusterId}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: '#8B949E', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Shield style={{ width: 14, height: 14, color: '#38BDF8' }} /> Tissue Role
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38BDF8', marginTop: 4 }}>
                {role}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: '#8B949E', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap style={{ width: 14, height: 14, color: '#FACC15' }} /> Active Cell Bonds
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FACC15', marginTop: 4 }}>
                {bondCount} Bonds
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
