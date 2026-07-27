import React from 'react';
import { SimulationStats } from '../../simulation/types';
import { Activity } from 'lucide-react';

interface GeneticDriftHeatmapProps {
  stats: SimulationStats;
}

export const GeneticDriftHeatmap: React.FC<GeneticDriftHeatmapProps> = ({ stats }) => {
  const speedH = stats.speedHistogram || new Array(10).fill(0);
  const visionH = stats.visionHistogram || new Array(10).fill(0);
  const effH = stats.efficiencyHistogram || new Array(10).fill(0);

  const maxVal = Math.max(1, ...speedH, ...visionH, ...effH);

  return (
    <div style={{
      background: 'rgba(8, 14, 20, 0.75)',
      borderRadius: 10,
      border: '1px solid rgba(0, 229, 255, 0.25)',
      padding: '10px',
      marginTop: 8
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem',
        fontWeight: 800,
        color: '#00E5FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity style={{ width: 13, height: 13 }} /> GENETIC DRIFT HEATMAP
        </span>
        <span style={{ color: '#8B949E', fontSize: '0.65rem' }}>10 Trait Buckets</span>
      </div>

      {/* Trait Drift Heatmap Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Speed Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: '0.6rem', fontFamily: "'JetBrains Mono', monospace", color: '#E040FB' }}>SPEED</span>
          <div style={{ display: 'flex', gap: 2, height: 12 }}>
            {speedH.map((val, i) => {
              const alpha = Math.max(0.1, (val / maxVal));
              return (
                <div
                  key={i}
                  title={`Speed Bucket ${i + 1}: ${val} bots`}
                  style={{
                    flex: 1,
                    backgroundColor: `rgba(224, 64, 251, ${alpha})`,
                    borderRadius: 2,
                    border: '1px solid rgba(224, 64, 251, 0.3)'
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Vision Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: '0.6rem', fontFamily: "'JetBrains Mono', monospace", color: '#00E5FF' }}>VISION</span>
          <div style={{ display: 'flex', gap: 2, height: 12 }}>
            {visionH.map((val, i) => {
              const alpha = Math.max(0.1, (val / maxVal));
              return (
                <div
                  key={i}
                  title={`Vision Bucket ${i + 1}: ${val} bots`}
                  style={{
                    flex: 1,
                    backgroundColor: `rgba(0, 229, 255, ${alpha})`,
                    borderRadius: 2,
                    border: '1px solid rgba(0, 229, 255, 0.3)'
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Efficiency Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: '0.6rem', fontFamily: "'JetBrains Mono', monospace", color: '#00E676' }}>EFFICIENCY</span>
          <div style={{ display: 'flex', gap: 2, height: 12 }}>
            {effH.map((val, i) => {
              const alpha = Math.max(0.1, (val / maxVal));
              return (
                <div
                  key={i}
                  title={`Efficiency Bucket ${i + 1}: ${val} bots`}
                  style={{
                    flex: 1,
                    backgroundColor: `rgba(0, 230, 118, ${alpha})`,
                    borderRadius: 2,
                    border: '1px solid rgba(0, 230, 118, 0.3)'
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
