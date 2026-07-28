import React, { useState } from 'react';
import { Microbot, QuantumAllele } from '../../simulation/types';
import { Dna, Save, Scissors } from 'lucide-react';
import { applyCrisprSplice } from '../../simulation/genetics/crisprSplice';

interface CrisprSpliceModalProps {
  bot: Microbot;
  onClose: () => void;
  onApply: () => void;
}

export const CrisprSpliceModal: React.FC<CrisprSpliceModalProps> = ({ bot, onClose, onApply }) => {
  const [genome, setGenome] = useState(() => JSON.parse(JSON.stringify(bot.genome || {})));
  const [selectedGene, setSelectedGene] = useState<string | null>(null);
  
  const handleSplice = () => {
    if (!bot.genome || !selectedGene) return;
    const allele = genome[selectedGene] as QuantumAllele;
    if (allele) {
       applyCrisprSplice(bot.genome, selectedGene as keyof typeof bot.genome, {
         baseValue: allele.baseValue,
         variance: allele.variance,
         observationProbability: 1.0, // Force observation
         state: 'OBSERVED'
       });
       onApply();
       onClose();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'baseValue' | 'variance') => {
    if (!selectedGene) return;
    setGenome((prev: any) => ({
      ...prev,
      [selectedGene]: {
        ...prev[selectedGene],
        [field]: parseFloat(e.target.value)
      }
    }));
  };

  const alleles = Object.entries(genome);

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(8, 14, 20, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="holo-panel" style={{ width: 450, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-holo-cyan" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Scissors style={{ width: 24, height: 24 }} />
            CRISPR GENE SPLICER
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8B949E', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
        
        <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Select a quantum allele to override its base sequence and collapse its superposition forcibly.</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {alleles.map(([geneName, allele]) => (
            <button
              key={geneName}
              onClick={() => setSelectedGene(geneName)}
              style={{
                background: selectedGene === geneName ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${selectedGene === geneName ? '#00E5FF' : 'rgba(255,255,255,0.1)'}`,
                color: selectedGene === geneName ? '#00E5FF' : '#E5E7EB',
                padding: '6px 12px',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.75rem'
              }}
            >
              {geneName.toUpperCase()}
            </button>
          ))}
        </div>

        {selectedGene && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(0,0,0,0.4)', padding: 16, borderRadius: 8 }}>
            <h4 style={{ color: '#00E5FF', margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>{selectedGene.toUpperCase()} SPLICING</h4>
            
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#E5E7EB', fontSize: '0.8rem' }}>
              Base Value: {(genome[selectedGene] as QuantumAllele).baseValue.toFixed(2)}
              <input 
                type="range" 
                min={0} max={10} step={0.1} 
                value={(genome[selectedGene] as QuantumAllele).baseValue}
                onChange={(e) => handleSliderChange(e, 'baseValue')}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#E5E7EB', fontSize: '0.8rem' }}>
              Mutation Variance: {(genome[selectedGene] as QuantumAllele).variance.toFixed(2)}
              <input 
                type="range" 
                min={0} max={5} step={0.1} 
                value={(genome[selectedGene] as QuantumAllele).variance}
                onChange={(e) => handleSliderChange(e, 'variance')}
              />
            </label>

            <button 
              onClick={handleSplice}
              className="btn-holo btn-holo-cyan" 
              style={{ marginTop: 12, padding: '10px 16px', display: 'flex', justifyContent: 'center' }}
            >
              <Save style={{ width: 16, height: 16, marginRight: 8 }} />
              EXECUTE SPLICE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
