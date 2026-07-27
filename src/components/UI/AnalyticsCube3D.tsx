import React, { useRef, useEffect } from 'react';
import { SimulationStats } from '../../simulation/types';

interface AnalyticsCube3DProps {
  stats: SimulationStats;
}

export const AnalyticsCube3D: React.FC<AnalyticsCube3DProps> = ({ stats }) => {
  const popHistory = stats.populationHistory || new Array(30).fill(45);
  const birthHistory = stats.birthHistory || new Array(30).fill(0);
  const deathHistory = stats.deathHistory || new Array(30).fill(0);

  const maxPop = Math.max(1, ...popHistory);
  const maxBirth = Math.max(1, ...birthHistory);
  const maxDeath = Math.max(1, ...deathHistory);

  return (
    <div className="analytics-cube-container">
      <div className="cube-card-3d">
        {/* Quadrant 1: Population Time */}
        <div style={{
          background: 'rgba(8, 14, 20, 0.7)',
          borderRadius: 8,
          padding: 6,
          border: '1px solid rgba(0, 229, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontFamily: "'JetBrains Mono', monospace", color: '#00E5FF', fontWeight: 800 }}>
            <span>POPULATION TIME</span>
            <span>{stats.currentPopulation}</span>
          </div>
          <svg viewBox="0 0 100 30" style={{ width: '100%', height: 24, overflow: 'visible' }}>
            <path
              d={popHistory.map((val, i) => {
                const x = (i / (popHistory.length - 1)) * 100;
                const y = 30 - (val / maxPop) * 24;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Quadrant 2: Total Births Area Curve */}
        <div style={{
          background: 'rgba(8, 14, 20, 0.7)',
          borderRadius: 8,
          padding: 6,
          border: '1px solid rgba(0, 230, 118, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontFamily: "'JetBrains Mono', monospace", color: '#00E676', fontWeight: 800 }}>
            <span>TOTAL BIRTHS</span>
            <span>{stats.totalBirths}</span>
          </div>
          <svg viewBox="0 0 100 30" style={{ width: '100%', height: 24, overflow: 'visible' }}>
            <path
              d={`${birthHistory.map((val, i) => {
                const x = (i / (birthHistory.length - 1)) * 100;
                const y = 30 - (val / maxBirth) * 22;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')} L 100 30 L 0 30 Z`}
              fill="rgba(0, 230, 118, 0.25)"
              stroke="#00E676"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Quadrant 3: Birth Rate Line Trend */}
        <div style={{
          background: 'rgba(8, 14, 20, 0.7)',
          borderRadius: 8,
          padding: 6,
          border: '1px solid rgba(224, 64, 251, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontFamily: "'JetBrains Mono', monospace", color: '#E040FB', fontWeight: 800 }}>
            <span>GEN COUNT</span>
            <span>#{stats.generationCount}</span>
          </div>
          <svg viewBox="0 0 100 30" style={{ width: '100%', height: 24, overflow: 'visible' }}>
            <path
              d={birthHistory.map((val, i) => {
                const x = (i / (birthHistory.length - 1)) * 100;
                const y = 28 - (val / maxBirth) * 20;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#E040FB"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Quadrant 4: Death Rate Histogram Bar Chart */}
        <div style={{
          background: 'rgba(8, 14, 20, 0.7)',
          borderRadius: 8,
          padding: 6,
          border: '1px solid rgba(255, 107, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontFamily: "'JetBrains Mono', monospace", color: '#FF6B00', fontWeight: 800 }}>
            <span>DEATH RATE</span>
            <span>{stats.totalDeaths}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 24, paddingTop: 2 }}>
            {deathHistory.slice(-15).map((val, idx) => {
              const hPct = maxDeath > 0 ? (val / maxDeath) * 100 : 10;
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: `${Math.max(15, hPct)}%`,
                    backgroundColor: '#FF6B00',
                    borderRadius: '1px 1px 0 0'
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
