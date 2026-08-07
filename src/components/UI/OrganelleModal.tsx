import React from 'react';
import { Microbot } from '../../simulation/types';
import { X, Zap, Cpu } from 'lucide-react';

interface OrganelleModalProps {
  bot: Microbot | null;
  onClose: () => void;
}

export const OrganelleModal: React.FC<OrganelleModalProps> = ({ bot, onClose }) => {
  if (!bot) return null;

  const organelles = bot.organelles || [];
  const mt = bot.mitochondrialDNA;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 480,
        background: '#080E14',
        border: '1px solid rgba(0,230,118,0.4)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        boxShadow: '0 0 30px rgba(0,230,118,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#00E676', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'JetBrains Mono', monospace" }}>
            <Cpu size={18} /> Symbiotic Organelle Inspector ({organelles.length} Active)
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem' }}>
          {organelles.length === 0 ? (
            <div style={{ color: '#8B949E', textAlign: 'center', padding: 20 }}>No symbiotic organelles absorbed yet.</div>
          ) : (
            organelles.map((org, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ color: '#00E5FF', fontWeight: 800 }}>{org.type}</div>
                <div style={{ fontSize: '0.68rem', color: '#8B949E' }}>Energy Output: {org.energyOutput.toFixed(2)} unit/s</div>
              </div>
            ))
          )}

          {mt && (
            <div style={{ marginTop: 10, background: 'rgba(224,64,251,0.08)', borderRadius: 8, padding: 10, border: '1px solid rgba(224,64,251,0.3)' }}>
              <div style={{ color: '#E040FB', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={14} /> Mitochondrial DNA (mDNA)
              </div>
              <div style={{ fontSize: '0.68rem', color: '#8B949E', marginTop: 4 }}>Seq: {mt.sequence}</div>
              <div style={{ fontSize: '0.68rem', color: '#8B949E' }}>Efficiency Bonus: {((mt.efficiencyBonus - 1) * 100).toFixed(1)}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
