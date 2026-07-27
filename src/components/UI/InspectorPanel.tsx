import React from 'react';
import { Crosshair, BatteryCharging, X, AlertCircle } from 'lucide-react';
import { Microbot, SimulationStats } from '../../simulation/types';

interface InspectorPanelProps {
  bot: Microbot | null;
  stats: SimulationStats;
  onClose: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ bot, stats, onClose }) => {
  if (!bot) {
    return (
      <div className="glass-panel" style={{ padding: '24px 16px', textAlign: 'center' }}>
        <Crosshair style={{ width: 28, height: 28, color: '#00E5FF', margin: '0 auto 8px auto', display: 'block' }} />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#ffffff', fontWeight: 800 }}>
          BOT DATA HUB
        </p>
        <p style={{ fontSize: '0.7rem', color: '#8B949E', marginTop: 4 }}>
          Select any microbot on the canvas grid or click <strong style={{ color: '#00E5FF' }}>SELECT BOT MENU</strong> to view real-time telemetry.
        </p>
      </div>
    );
  }

  const batteryPct = Math.max(0, Math.min(100, (bot.battery / bot.maxBattery) * 100));
  const history = bot.batteryHistory || new Array(30).fill(bot.battery);
  const maxHistoryVal = Math.max(bot.maxBattery, ...history);

  const stateColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
    WANDERING: { bg: 'rgba(30, 41, 59, 0.6)', border: '#334155', text: '#cbd5e1', label: 'WANDERING' },
    SEEKING_ENERGY: { bg: 'rgba(0, 230, 118, 0.2)', border: '#00E676', text: '#00E676', label: 'SEEKING FOOD 🍏' },
    EVADING_HAZARD: { bg: 'rgba(255, 107, 0, 0.2)', border: '#FF6B00', text: '#FF6B00', label: 'EVADING HAZARD 💥' },
    REPRODUCING: { bg: 'rgba(224, 64, 251, 0.2)', border: '#E040FB', text: '#E040FB', label: 'REPRODUCING 🧬' }
  };

  const stateBadge = stateColors[bot.behaviorState] || stateColors.WANDERING;

  return (
    <div className="glass-panel" style={{ padding: '14px', border: '1px solid rgba(0, 229, 255, 0.4)', boxShadow: '0 0 25px rgba(0, 229, 255, 0.15)' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {bot.battery < 25 && (
            <AlertCircle style={{ width: 16, height: 16, color: '#FF6B00', animation: 'pulse 1s infinite' }} />
          )}
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '0.95rem', color: '#00E5FF' }}>
              {bot.id}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#8B949E', fontFamily: "'JetBrains Mono', monospace" }}>
              GEN R{bot.generation} • PARENT: {bot.parentId || 'ORIGIN'}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#8B949E', cursor: 'pointer', padding: 4 }}
          title="Deselect"
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Behavior State Badge */}
      <div style={{
        padding: '5px 10px',
        borderRadius: 8,
        background: stateBadge.bg,
        border: '1px solid ' + stateBadge.border,
        color: stateBadge.text,
        fontSize: '0.7rem',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
      }}>
        <span>BEHAVIOR:</span>
        <span>{stateBadge.label}</span>
      </div>

      {/* Battery Charge Bar */}
      <div style={{ background: 'rgba(8, 14, 20, 0.7)', padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
          <span style={{ color: '#8B949E', display: 'flex', alignItems: 'center', gap: 4 }}>
            <BatteryCharging style={{ width: 13, height: 13, color: '#00E5FF' }} /> Battery Charge
          </span>
          <span style={{ color: '#00E5FF', fontWeight: 800 }}>
            {bot.battery.toFixed(1)} / {bot.maxBattery.toFixed(0)} ({batteryPct.toFixed(0)}%)
          </span>
        </div>
        <div style={{ width: '100%', height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${batteryPct}%`,
              background: batteryPct > 40 ? 'linear-gradient(90deg, #00E5FF, #00E676)' : batteryPct > 20 ? '#FF6B00' : '#f43f5e',
              transition: 'width 0.2s ease'
            }}
          />
        </div>
      </div>

      {/* Battery Charge Trend Sparkline Graph */}
      <div style={{ background: 'rgba(8, 14, 20, 0.7)', padding: 8, borderRadius: 8, border: '1px solid rgba(0, 229, 255, 0.15)', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E', marginBottom: 4 }}>
          <span>Battery Charge Trend</span>
          <span style={{ color: '#00E5FF' }}>Live</span>
        </div>
        <svg viewBox="0 0 100 24" style={{ width: '100%', height: 24, overflow: 'visible' }}>
          <path
            d={history.map((val, i) => {
              const x = (i / (history.length - 1)) * 100;
              const y = 24 - (val / maxHistoryVal) * 20;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#00E5FF"
            strokeWidth="1.8"
          />
        </svg>
      </div>

      {/* Speed / Vision / Efficiency Distribution Histogram */}
      <div style={{ background: 'rgba(8, 14, 20, 0.7)', padding: 8, borderRadius: 8, border: '1px solid rgba(224, 64, 251, 0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E', marginBottom: 6 }}>
          <span>Speed/Vision/Efficiency</span>
          <span style={{ color: '#E040FB' }}>Last Mins</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 32 }}>
          {stats.speedHistogram.map((val, i) => {
            const maxVal = Math.max(1, ...stats.speedHistogram);
            const hPct = (val / maxVal) * 100;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${Math.max(15, hPct)}%`,
                  backgroundColor: i < 3 ? '#E040FB' : i < 7 ? '#00E5FF' : '#00E676',
                  borderRadius: '2px 2px 0 0'
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
