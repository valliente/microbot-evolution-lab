import React from 'react';
import { SimulationStats } from '../../simulation/types';

interface BiomePopulationChartProps {
  biomePopulation: SimulationStats['biomePopulation'];
  totalPopulation: number;
}

export const BiomePopulationChart: React.FC<BiomePopulationChartProps> = ({ biomePopulation, totalPopulation }) => {
  const biomes = [
    { key: 'NORMAL', label: 'Normal', color: '#f8fafc' },
    { key: 'TOXIC_SLUDGE', label: 'Toxic', color: '#a3e635' },
    { key: 'CRYO_ZONE', label: 'Cryo', color: '#38bdf8' },
    { key: 'HIGH_G_FIELD', label: 'High-G', color: '#f43f5e' }
  ];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -6, right: 4, fontSize: '0.65rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, pointerEvents: 'none' }}>
        BIOME DIST
      </div>
      <div style={{ display: 'flex', height: '6px', width: '100%', borderRadius: '4px', overflow: 'hidden', marginTop: '12px' }}>
        {totalPopulation > 0 ? biomes.map(b => {
          const count = biomePopulation[b.key] || 0;
          const pct = (count / totalPopulation) * 100;
          if (pct === 0) return null;
          return (
            <div key={b.key} style={{ width: `${pct}%`, height: '100%', backgroundColor: b.color, transition: 'width 0.3s ease' }} title={`${b.label}: ${count} (${pct.toFixed(1)}%)`} />
          );
        }) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.55rem', fontFamily: "'JetBrains Mono', monospace", color: '#64748b' }}>
        {biomes.map(b => (
           <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
             <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: b.color }} />
             {b.label}
           </div>
        ))}
      </div>
    </div>
  );
};
