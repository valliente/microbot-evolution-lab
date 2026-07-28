import React from 'react';
import { SimulationStats } from '../../simulation/types';

interface QuantumDiversityChartProps {
  history: SimulationStats['historyTimeline'];
}

export const QuantumDiversityChart: React.FC<QuantumDiversityChartProps> = ({ history }) => {
  if (history.length < 2) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.65rem', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
          Initializing...
        </div>
      </div>
    );
  }

  const maxDiversity = Math.max(...history.map((h) => h.diversity), 1.0);
  
  // Build SVG path
  const width = 100;
  const height = 40;
  
  let pathD = '';
  
  history.forEach((point, i) => {
    const x = (i / (history.length - 1)) * width;
    // Normalize to height
    const y = height - (point.diversity / maxDiversity) * height;
    
    if (i === 0) {
      pathD += `M ${x},${y} `;
    } else {
      pathD += `L ${x},${y} `;
    }
  });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {/* Fill Gradient */}
        <defs>
          <linearGradient id="diversityGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(224, 64, 251, 0.4)" />
            <stop offset="100%" stopColor="rgba(224, 64, 251, 0.0)" />
          </linearGradient>
        </defs>
        
        <path
          d={`${pathD} L ${width},${height} L 0,${height} Z`}
          fill="url(#diversityGradient)"
        />
        
        <path
          d={pathD}
          fill="none"
          stroke="#E040FB"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>
      <div style={{ position: 'absolute', top: 2, right: 4, fontSize: '0.65rem', color: '#c084fc', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, pointerEvents: 'none' }}>
        Q-DIV
      </div>
    </div>
  );
};
