import React from 'react';
import { Crosshair, BatteryCharging, Zap, Gauge, Eye, Award, X } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface InspectorPanelProps {
  bot: Microbot | null;
  onClose: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ bot, onClose }) => {
  if (!bot) {
    return (
      <div className="panel-card" style={{ textAlign: 'center', padding: '30px 16px' }}>
        <Crosshair style={{ width: 32, height: 32, color: '#00f0ff', marginBottom: 8, margin: '0 auto 8px auto' }} />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#ffffff', fontWeight: 700 }}>
          SELECTING MICROBOT...
        </p>
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
          Click any microbot on screen or press <strong style={{ color: '#00f0ff' }}>SELECT BOT</strong>.
        </p>
      </div>
    );
  }

  const batteryPct = Math.max(0, Math.min(100, (bot.battery / bot.maxBattery) * 100));

  const stateColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
    WANDERING: { bg: 'rgba(30, 41, 59, 0.6)', border: '#334155', text: '#cbd5e1', label: 'WANDERING' },
    SEEKING_ENERGY: { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#34d399', label: 'SEEKING FOOD 🍏' },
    EVADING_HAZARD: { bg: 'rgba(244, 63, 94, 0.2)', border: '#f43f5e', text: '#fb7185', label: 'EVADING HAZARD 💥' },
    REPRODUCING: { bg: 'rgba(168, 85, 247, 0.2)', border: '#a855f7', text: '#c084fc', label: 'REPRODUCING 🧬' }
  };

  const stateBadge = stateColors[bot.behaviorState] || stateColors.WANDERING;

  return (
    <div className="panel-card" style={{ position: 'relative', border: '2px solid #00f0ff', boxShadow: '0 0 20px rgba(0, 240, 255, 0.25)' }}>
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        title="Deselect"
      >
        <X style={{ width: 16, height: 16 }} />
      </button>

      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingRight: 20 }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: bot.color,
            border: '2px solid #ffffff',
            boxShadow: '0 0 10px ' + bot.color,
            flexShrink: 0
          }}
        />
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '1rem', color: '#00f0ff' }}>
            {bot.id}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
            GEN #{bot.generation} • PARENT: {bot.parentId || 'ORIGIN'}
          </div>
        </div>
      </div>

      {/* Behavior State Badge */}
      <div style={{
        padding: '6px 12px',
        borderRadius: 8,
        background: stateBadge.bg,
        border: '1px solid ' + stateBadge.border,
        color: stateBadge.text,
        fontSize: '0.75rem',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12
      }}>
        <span>BEHAVIOR:</span>
        <span>{stateBadge.label}</span>
      </div>

      {/* Battery Gauge Bar */}
      <div style={{ background: 'rgba(3, 7, 18, 0.7)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
          <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <BatteryCharging style={{ width: 14, height: 14, color: '#00f0ff' }} /> Battery Charge
          </span>
          <span style={{ color: '#00f0ff', fontWeight: 700 }}>
            {bot.battery.toFixed(1)} / {bot.maxBattery.toFixed(0)} ({batteryPct.toFixed(0)}%)
          </span>
        </div>
        <div style={{ width: '100%', height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${batteryPct}%`,
              background: batteryPct > 40 ? 'linear-gradient(90deg, #00f0ff, #34d399)' : batteryPct > 20 ? '#fbbf24' : '#f43f5e',
              transition: 'width 0.2s ease'
            }}
          />
        </div>
      </div>

      {/* Trait Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace" }}>
        <div style={{ background: 'rgba(3, 7, 18, 0.6)', padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Gauge style={{ width: 12, height: 12, color: '#00f0ff' }} /> Speed
          </div>
          <div style={{ color: '#00f0ff', fontWeight: 700, fontSize: '0.9rem', marginTop: 2 }}>
            {bot.speed.toFixed(2)} px/f
          </div>
        </div>

        <div style={{ background: 'rgba(3, 7, 18, 0.6)', padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye style={{ width: 12, height: 12, color: '#60a5fa' }} /> Vision Range
          </div>
          <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.9rem', marginTop: 2 }}>
            {bot.visionRadius.toFixed(0)} px
          </div>
        </div>

        <div style={{ background: 'rgba(3, 7, 18, 0.6)', padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap style={{ width: 12, height: 12, color: '#34d399' }} /> Efficiency
          </div>
          <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.9rem', marginTop: 2 }}>
            {bot.energyEfficiency.toFixed(2)}x
          </div>
        </div>

        <div style={{ background: 'rgba(3, 7, 18, 0.6)', padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Award style={{ width: 12, height: 12, color: '#fbbf24' }} /> Offspring
          </div>
          <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem', marginTop: 2 }}>
            {bot.offspringCount}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
        <span>AGE: {Math.floor(bot.age / 60)}s</span>
        <span>ENERGY EATEN: {Math.floor(bot.energyCollected)}</span>
      </div>
    </div>
  );
};
