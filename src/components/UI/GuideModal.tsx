import React from 'react';
import { X, Zap } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#0b0f19',
        border: '2px solid #00f0ff',
        borderRadius: '18px',
        maxWidth: '620px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 0 40px rgba(0, 240, 255, 0.3)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X style={{ width: 20, height: 20 }} />
        </button>

        <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.2rem', color: '#ffffff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap style={{ color: '#00f0ff' }} /> HOW TO PLAY MICROBOT EVOLUTION LAB
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 20 }}>
          A 100% automated autonomous artificial life sandbox. Watch microbots steer, search for food, avoid hazards, and reproduce!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 12, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0, 240, 255, 0.2)', color: '#00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              1
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700 }}>Inspect Microbot Telemetry</h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                Click <strong>🎯 SELECT BOT</strong> or click any microbot directly on the canvas grid to inspect its real-time battery level, movement speed, vision range, and behavior state.
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 12, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              2
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700 }}>Interactive Mouse Canvas Spawner</h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                Click anywhere on the simulation grid to drop <strong>5 green food particles</strong> directly under your cursor, or use <strong>🍏 +20 FOOD</strong> and <strong>🤖 +10 BOTS</strong> buttons!
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 12, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              3
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700 }}>Genetic Evolution & Hazards</h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                When microbots reach full battery, they reproduce asexually. Offspring inherit mutated traits (speed, vision, energy efficiency). Spawn red hazard zones to watch microbots evolve evasion!
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-cyan" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
            START EXPERIMENT
          </button>
        </div>
      </div>
    </div>
  );
};
