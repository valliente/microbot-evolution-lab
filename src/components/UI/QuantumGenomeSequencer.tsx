import React from 'react';
import { Microbot, QuantumAllele } from '../../simulation/types';
import { Dna } from 'lucide-react';

interface QuantumGenomeSequencerProps {
  bot: Microbot | null;
  onClose?: () => void;
}

export const QuantumGenomeSequencer: React.FC<QuantumGenomeSequencerProps> = ({ bot, onClose }) => {
  if (!bot || !bot.genome) return null;

  const genome = bot.genome;
  const alleles = Object.entries(genome);

  return (
    <div className="holo-panel" style={{
      width: 380,
      background: 'rgba(8, 14, 20, 0.85)',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="text-holo-cyan" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <Dna style={{ width: 18, height: 18 }} />
          QUANTUM GENOME SEQUENCER
        </h3>
        {onClose && (
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8B949E', cursor: 'pointer' }}>
            ✕
          </button>
        )}
      </div>

      <div style={{ fontSize: '0.75rem', color: '#8B949E', fontFamily: "'JetBrains Mono', monospace" }}>
        SUBJECT ID: <span style={{ color: bot.color }}>{bot.id}</span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxHeight: 400,
        overflowY: 'auto',
        paddingRight: 4
      }}>
        {alleles.map(([geneName, allele]) => {
          const a = allele as QuantumAllele;
          let stateColor = '#00E5FF';
          if (a.state === 'DECAYING') stateColor = '#f43f5e';
          else if (a.state === 'ENTANGLED') stateColor = '#E040FB';

          return (
            <div key={geneName} style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${stateColor}33`,
              borderRadius: 6,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#E5E7EB', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace" }}>
                  {geneName.toUpperCase()}
                </strong>
                <span style={{ 
                  color: stateColor, 
                  fontSize: '0.65rem', 
                  padding: '2px 6px', 
                  background: `${stateColor}15`, 
                  borderRadius: 12,
                  fontFamily: "'JetBrains Mono', monospace" 
                }}>
                  {a.state}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9CA3AF' }}>
                <span>Val: {a.baseValue.toFixed(2)}</span>
                <span>Var: ±{a.quantumVariance.toFixed(2)}</span>
                <span>Obs Prob: {(a.observationProbability * 100).toFixed(0)}%</span>
              </div>

              <div style={{ width: '100%', height: 4, background: '#1F2937', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                <div style={{ 
                  width: `${a.observationProbability * 100}%`, 
                  height: '100%', 
                  background: stateColor,
                  boxShadow: `0 0 8px ${stateColor}`
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
