import React from 'react';
import { Activity, Users, Dna, Zap, Heart, Skull } from 'lucide-react';
import { SimulationStats } from '../../simulation/types';
import { PopulationChart } from './PopulationChart';
import { QuantumDiversityChart } from './QuantumDiversityChart';
import { BiomePopulationChart } from './BiomePopulationChart';

interface StatsDashboardProps {
  stats: SimulationStats;
  maxPopulation: number;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, maxPopulation }) => {
  return (
    <div className="panel-card" style={{ padding: '10px 14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr) 180px 180px 220px', gap: 10, alignItems: 'center' }}>
        {/* Metric Cards */}
        <div style={{ background: 'rgba(3, 7, 18, 0.6)', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            <Users style={{ width: 12, height: 12, color: '#00f0ff' }} /> Population
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '0.95rem', color: '#ffffff', marginTop: 2 }}>
            {stats.currentPopulation} <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>/ {maxPopulation}</span>
          </div>
        </div>

        <div style={{ background: 'rgba(3, 7, 18, 0.6)', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            <Dna style={{ width: 12, height: 12, color: '#c084fc' }} /> Generation
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '0.95rem', color: '#c084fc', marginTop: 2 }}>
            GEN #{stats.generationCount}
          </div>
        </div>

        <div style={{ background: 'rgba(3, 7, 18, 0.6)', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            <Zap style={{ width: 12, height: 12, color: '#34d399' }} /> Food Dots
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '0.95rem', color: '#34d399', marginTop: 2 }}>
            {stats.energyParticleCount}
          </div>
        </div>

        <div style={{ background: 'rgba(3, 7, 18, 0.6)', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            <Activity style={{ width: 12, height: 12, color: '#60a5fa' }} /> Avg Speed
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '0.95rem', color: '#60a5fa', marginTop: 2 }}>
            {stats.avgSpeed.toFixed(2)}
          </div>
        </div>

        <div style={{ background: 'rgba(3, 7, 18, 0.6)', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            <Heart style={{ width: 12, height: 12, color: '#f43f5e' }} /> Births
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '0.95rem', color: '#fb7185', marginTop: 2 }}>
            {stats.totalBirths}
          </div>
        </div>

        <div style={{ background: 'rgba(3, 7, 18, 0.6)', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            <Skull style={{ width: 12, height: 12, color: '#94a3b8' }} /> Deaths
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '0.95rem', color: '#cbd5e1', marginTop: 2 }}>
            {stats.totalDeaths}
          </div>
        </div>

        {/* Real-time Population Chart */}
        <div style={{ height: 44, background: 'rgba(3, 7, 18, 0.8)', borderRadius: 8, padding: '4px 8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <PopulationChart history={stats.historyTimeline} maxPopulation={maxPopulation} />
        </div>

        {/* Real-time Quantum Diversity Chart */}
        <div style={{ height: 44, background: 'rgba(3, 7, 18, 0.8)', borderRadius: 8, padding: '4px 8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <QuantumDiversityChart history={stats.historyTimeline} />
        </div>

        {/* Real-time Biome Distribution Chart */}
        <div style={{ height: 44, background: 'rgba(3, 7, 18, 0.8)', borderRadius: 8, padding: '4px 8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <BiomePopulationChart biomePopulation={stats.biomePopulation} totalPopulation={stats.currentPopulation} />
        </div>
      </div>
    </div>
  );
};
