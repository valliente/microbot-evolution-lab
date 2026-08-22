import React from 'react';
import { X, Activity, Radio, ShieldAlert } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface QuorumModalProps {
  isOpen: boolean;
  onClose: () => void;
  microbots: Microbot[];
}

export const QuorumModal: React.FC<QuorumModalProps> = ({ isOpen, onClose, microbots }) => {
  if (!isOpen) return null;

  const totalBots = microbots.length;
  const swarmingBots = microbots.filter(b => b.behaviorState === 'SEEKING_ENERGY' || b.behaviorState === 'HUNTING').length;
  const quorumIndex = totalBots > 0 ? (swarmingBots / totalBots).toFixed(2) : '0.00';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 10, 16, 0.82)',
      backdropFilter: 'blur(10px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 520,
        background: 'rgba(15, 26, 38, 0.95)',
        border: '1px solid rgba(250, 204, 21, 0.4)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 0 30px rgba(250, 204, 21, 0.25)',
        color: '#E6EDF3',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Radio style={{ color: '#FACC15', width: 20, height: 20 }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#FACC15' }}>
              Bio-Electrical Quorum Sensing Inspector
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.8rem', color: '#8B949E' }}>Quorum Density Index</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FACC15' }}>{quorumIndex}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.8rem', color: '#8B949E' }}>Synchronized Agents</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38BDF8' }}>{swarmingBots} / {totalBots}</div>
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Activity style={{ width: 16, height: 16, color: '#FACC15' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Collective States</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#A0AEC0', lineHeight: 1.5 }}>
            Agents aggregate local electrical pulses to switch between solitary foraging, synchronized swarm hunting, and defensive encystment.
          </div>
        </div>
      </div>
    </div>
  );
};
