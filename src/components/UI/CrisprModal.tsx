import React from 'react';
import { Microbot, QuantumAllele } from '../../simulation/types';
import { Dna, X } from 'lucide-react';

interface CrisprModalProps {
  bot: Microbot | null;
  onClose: () => void;
  onUpdateTraits: (id: string, traits: Partial<Microbot>) => void;
}

export const CrisprModal: React.FC<CrisprModalProps> = ({ bot, onClose, onUpdateTraits }) => {
  if (!bot) {
    return (
      <div className="glass-modal-overlay">
        <div className="glass-modal" style={{ width: 400 }}>
          <div className="modal-header">
             <h2><Dna /> CRISPR EDITOR</h2>
             <button className="btn-icon" onClick={onClose}><X /></button>
          </div>
          <div style={{ padding: 20, textAlign: 'center', color: '#8B949E' }}>
            <p>No microbot selected for editing.</p>
          </div>
        </div>
      </div>
    );
  }

  const renderAllele = (name: string, allele?: QuantumAllele) => {
    if (!allele) return null;
    return (
      <div style={{ marginBottom: 15, background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8, border: '1px solid rgba(0,229,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ color: '#00E5FF', fontWeight: 'bold', fontSize: '0.8rem' }}>{name}</span>
          <span style={{ 
            color: allele.state === 'ENTANGLED' ? '#FFD700' : allele.state === 'OBSERVED' ? '#00E676' : '#FF6B00',
            fontSize: '0.7rem' 
          }}>[{allele.state}]</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8B949E', fontSize: '0.7rem' }}>
           <span>Base: {allele.baseValue.toFixed(2)}</span>
           <span>Var: ±{allele.quantumVariance.toFixed(2)}</span>
           <span>Prob: {(allele.observationProbability * 100).toFixed(0)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-modal-overlay">
      <div className="glass-modal" style={{ width: 450, maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2><Dna /> CRISPR EDITOR</h2>
          <button className="btn-icon" onClick={onClose}><X /></button>
        </div>
        <div style={{ padding: 15 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: 10 }}>Target: {bot.id}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ color: '#8B949E', fontSize: '0.7rem' }}>Speed</label>
                <input type="range" min="1" max="5" step="0.1" value={bot.speed} onChange={(e) => onUpdateTraits(bot.id, { speed: parseFloat(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ color: '#8B949E', fontSize: '0.7rem' }}>Vision</label>
                <input type="range" min="40" max="260" step="5" value={bot.visionRadius} onChange={(e) => onUpdateTraits(bot.id, { visionRadius: parseFloat(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ color: '#8B949E', fontSize: '0.7rem' }}>Efficiency</label>
                <input type="range" min="0.4" max="3" step="0.1" value={bot.energyEfficiency} onChange={(e) => onUpdateTraits(bot.id, { energyEfficiency: parseFloat(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ color: '#8B949E', fontSize: '0.7rem' }}>Turn Rate</label>
                <input type="range" min="0.05" max="0.3" step="0.01" value={bot.turnRate} onChange={(e) => onUpdateTraits(bot.id, { turnRate: parseFloat(e.target.value) })} style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <h3 style={{ color: '#FFD700', fontSize: '0.8rem', marginBottom: 10, borderBottom: '1px solid rgba(255,215,0,0.2)', paddingBottom: 5 }}>QUANTUM GENOME (SUPERPOSITION)</h3>
          
          {bot.genome ? (
            <>
              {renderAllele('Speed Allele', bot.genome.speedAllele)}
              {renderAllele('Vision Allele', bot.genome.visionAllele)}
              {renderAllele('Efficiency Allele', bot.genome.efficiencyAllele)}
            </>
          ) : (
             <div style={{ textAlign: 'center', color: '#8B949E', padding: 10 }}>No quantum genome data available.</div>
          )}
          
          <button className="btn-holo btn-holo-green" style={{ width: '100%', marginTop: 10, justifyContent: 'center' }} onClick={onClose}>
             APPLY & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
