import React from 'react';
import { X, Shield, Activity, Eye, Zap } from 'lucide-react';
import { PhenotypeEngine, StructuralPhenotype } from '../../simulation/genetics/PhenotypeEngine';

interface PhenotypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot: any;
}

export const PhenotypeModal: React.FC<PhenotypeModalProps> = ({ isOpen, onClose, bot }) => {
  if (!isOpen || !bot) return null;

  const phenotype: StructuralPhenotype = PhenotypeEngine.mapGenomeToPhenotype(bot.genome);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)'
    }}>
      <div className="glass-panel" style={{ width: 440, padding: 20, borderRadius: 12, border: '1px solid rgba(0,229,255,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#00E5FF', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity style={{ width: 18, height: 18 }} /> PHENOTYPE STRUCTURAL INSPECTOR
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#cbd5e1' }}>
          <div style={{ background: 'rgba(15,23,42,0.6)', padding: 10, borderRadius: 8 }}>
            <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Shield style={{ width: 12, height: 12, color: '#60a5fa' }} /> Armor Plates</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>{phenotype.armorPlatesCount} ({phenotype.armorThickness.toFixed(1)}px)</div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', padding: 10, borderRadius: 8 }}>
            <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Zap style={{ width: 12, height: 12, color: '#34d399' }} /> Thrust Fins</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>{phenotype.thrustFinsLength.toFixed(1)}px</div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', padding: 10, borderRadius: 8 }}>
            <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Eye style={{ width: 12, height: 12, color: '#e040fb' }} /> Lure Glow</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>{(phenotype.bioluminescentLureGlow * 100).toFixed(0)}%</div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', padding: 10, borderRadius: 8 }}>
            <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>Lure Hue</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: `hsl(${phenotype.lureHue}, 100%, 70%)`, marginTop: 4 }}>{phenotype.lureHue.toFixed(0)}° HSL</div>
          </div>
        </div>
      </div>
    </div>
  );
};
