import React from 'react';

interface GeneticDiversityChartProps {
  buckets: number[];
}

export const GeneticDiversityChart: React.FC<GeneticDiversityChartProps> = ({ buckets }) => {
  const maxVal = Math.max(1, ...buckets);

  return (
    <div style={{
      background: 'rgba(15, 26, 36, 0.85)',
      border: '1px solid rgba(0, 229, 255, 0.3)',
      borderRadius: 12,
      padding: '8px 12px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
      width: 170
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '0.05em'
        }}>
          GENETIC DIVERSITY
        </span>
        <span style={{
          fontSize: '0.65rem',
          fontFamily: "'JetBrains Mono', monospace",
          color: '#00E5FF',
          fontWeight: 700
        }}>
          {buckets.reduce((a, b) => a + b, 0)}
        </span>
      </div>

      {/* Histogram Bars */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 3,
        height: 28,
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
                boxShadow: `0 0 6px hsl(${hue}, 90%, 60%)`
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
