import React, { useState } from 'react';
import { X, Play, RotateCcw, Award } from 'lucide-react';
import { SimulationStats } from '../../simulation/types';

interface ExperimentRunnerModalProps {
  isOpen: boolean;
  stats: SimulationStats;
  onStartExperiment: (generationsTarget: number) => void;
  onClose: () => void;
}

export const ExperimentRunnerModal: React.FC<ExperimentRunnerModalProps> = ({
  isOpen,
  stats,
  onStartExperiment,
  onClose
}) => {
  const [targetGen, setTargetGen] = useState<number>(10);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRun = () => {
    setIsRunning(true);
    onStartExperiment(targetGen);
    setTimeout(() => {
      setIsRunning(false);
    }, 2500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#0b0f19',
        border: '2px solid #00E5FF',
        borderRadius: '18px',
        maxWidth: '540px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 0 40px rgba(0, 229, 255, 0.3)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#8B949E', cursor: 'pointer' }}
        >
          <X style={{ width: 20, height: 20 }} />
        </button>

        <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', color: '#ffffff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Award style={{ color: '#00E5FF' }} /> AUTOMATED BATCH EXPERIMENT RUNNER (10X)
        </h2>
        <p style={{ fontSize: '0.75rem', color: '#8B949E', marginBottom: 18 }}>
          Accelerate evolution calculations to simulate $N$ generations automatically and output telemetry reports.
        </p>

        <div style={{ background: 'rgba(15, 26, 36, 0.8)', padding: 14, borderRadius: 12, border: '1px solid rgba(0, 229, 255, 0.3)', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E', marginBottom: 6 }}>
            <span>Target Generation Cutoff</span>
            <span style={{ color: '#00E5FF', fontWeight: 800 }}>Gen #{targetGen}</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={targetGen}
            onChange={(e) => setTargetGen(parseInt(e.target.value, 10))}
            style={{ width: '100%', height: 4 }}
          />
        </div>

        {/* Experiment Telemetry Output */}
        <div style={{ background: '#080E14', padding: 12, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.1)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem' }}>
          <div style={{ color: '#00E676', fontWeight: 800, marginBottom: 4 }}>
            EXPERIMENT RUNNER TELEMETRY LOG
          </div>
          <div style={{ color: '#8B949E' }}>Current Generation: <strong style={{ color: '#fff' }}>#{stats.generationCount}</strong></div>
          <div style={{ color: '#8B949E' }}>Active Population: <strong style={{ color: '#fff' }}>{stats.currentPopulation} bots</strong></div>
          <div style={{ color: '#8B949E' }}>Total Births / Deaths: <strong style={{ color: '#fff' }}>{stats.totalBirths} / {stats.totalDeaths}</strong></div>
          <div style={{ color: '#8B949E' }}>Average Speed / Vision: <strong style={{ color: '#fff' }}>{stats.avgSpeed.toFixed(2)} / {stats.avgVision.toFixed(0)}px</strong></div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} className="btn-holo btn-holo-dark">
            CLOSE
          </button>
          <button onClick={handleRun} disabled={isRunning} className="btn-holo btn-holo-green" style={{ padding: '8px 18px' }}>
            {isRunning ? <RotateCcw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Play style={{ width: 14, height: 14 }} />}
            <span>{isRunning ? 'RUNNING BATCH 10X...' : 'START 10X BATCH RUN'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
