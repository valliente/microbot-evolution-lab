import React from 'react';
import { AlertCircle } from 'lucide-react';

interface GeneticDiversityChartProps {
  buckets: number[];
  shannonIndex?: number;
}

export const GeneticDiversityChart: React.FC<GeneticDiversityChartProps> = ({ buckets, shannonIndex = 1.8 }) => {
  const maxVal = Math.max(1, ...buckets);
  const isLowDiversity = shannonIndex < 0.8;

  return (
    <div style={{
      background: 'rgba(15, 26, 36, 0.85)',
      border: isLowDiversity ? '1px solid #f43f5e' : '1px solid rgba(0, 229, 255, 0.3)',
      borderRadius: 12,
      padding: '8px 12px',
      backdropFilter: 'blur(12px)',
      boxShadow: isLowDiversity ? '0 0 15px rgba(244, 63, 94, 0.4)' : '0 6px 20px rgba(0,0,0,0.4)',
      width: 175
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.62rem',
          fontWeight: 800,
          color: isLowDiversity ? '#f43f5e' : '#ffffff',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          {isLowDiversity && <AlertCircle style={{ width: 10, height: 10, color: '#f43f5e' }} />}
          GENETIC DIVERSITY
        </span>
        <span style={{
          fontSize: '0.62rem',
          fontFamily: "'JetBrains Mono', monospace",
          color: isLowDiversity ? '#f43f5e' : '#00E5FF',
          fontWeight: 800
        }}>
          H: {shannonIndex.toFixed(2)}
        </span>
      </div>

      {/* Histogram Bars */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 3,
        height: 24,
        paddingTop: 2
      }}>
        {buckets.map((val, idx) => {
          const heightPct = (val / maxVal) * 100;
          const hue = Math.round((idx / buckets.length) * 360);
          return (
            <div
              key={idx}
              title={`Group ${idx + 1}: ${val} bots`}
              style={{
                flex: 1,
                height: `${Math.max(15, heightPct)}%`,
                backgroundColor: `hsl(${hue}, 90%, 60%)`,
                borderRadius: '2px 2px 0 0',
                transition: 'height 0.2s ease',
                boxShadow: `0 0 4px hsl(${hue}, 90%, 60%)`
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
