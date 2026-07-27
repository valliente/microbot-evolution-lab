import React from 'react';
import { Cpu, Activity, Zap } from 'lucide-react';
import { SimulationStats } from '../../simulation/types';

interface PerformanceDiagnosticsOverlayProps {
  stats: SimulationStats;
  targetFPS: number;
}

export const PerformanceDiagnosticsOverlay: React.FC<PerformanceDiagnosticsOverlayProps> = ({
  stats,
  targetFPS
}) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: 16,
      zIndex: 40,
      background: 'rgba(11, 15, 25, 0.85)',
      border: '1px solid rgba(0, 229, 255, 0.4)',
      borderRadius: 12,
      padding: '8px 14px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.68rem',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00E5FF' }}>
        <Cpu style={{ width: 14, height: 14 }} />
        <span>FPS: <strong style={{ color: '#fff' }}>{targetFPS} FPS</strong></span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00E676' }}>
        <Activity style={{ width: 14, height: 14 }} />
        <span>ENTITIES: <strong style={{ color: '#fff' }}>{stats.currentPopulation} BOTS</strong></span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#E040FB' }}>
        <Zap style={{ width: 14, height: 14 }} />
        <span>FOOD: <strong style={{ color: '#fff' }}>{stats.energyParticleCount} ORBS</strong></span>
      </div>
    </div>
  );
};
