import React from 'react';
import { Play, Cpu, Zap, Dna, HelpCircle } from 'lucide-react';

interface StartOverlayProps {
  isStarted: boolean;
  onStartGame: () => void;
  onOpenGuide: () => void;
}

export const StartOverlay: React.FC<StartOverlayProps> = ({ isStarted, onStartGame, onOpenGuide }) => {
  if (isStarted) return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 50,
      background: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '2px solid #00f0ff',
        borderRadius: '24px',
        padding: '36px 48px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 0 50px rgba(0, 240, 255, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Animated Logo Icon */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #00f0ff, #2563eb)',
          padding: 3,
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.5)'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: '#030712',
            borderRadius: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00f0ff'
          }}>
            <Cpu style={{ width: 38, height: 38 }} />
          </div>
        </div>

        <div>
          <h1 style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '2rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-1px'
          }}>
            MICROBOT <span style={{ color: '#00f0ff' }}>EVOLUTION LAB</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 6 }}>
            Autonomous Artificial Life Simulation & Genetic Trait Evolution
          </p>
        </div>

        {/* Feature Highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          width: '100%',
          margin: '8px 0'
        }}>
          <div style={{ background: 'rgba(3, 7, 18, 0.7)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', fontSize: '0.75rem' }}>
            <div style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Zap style={{ width: 14, height: 14 }} /> 🟢 GREEN ENERGY
            </div>
            <div style={{ color: '#cbd5e1' }}>Microbots eat energy dots to charge battery.</div>
          </div>

          <div style={{ background: 'rgba(3, 7, 18, 0.7)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', fontSize: '0.75rem' }}>
            <div style={{ color: '#c084fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Dna style={{ width: 14, height: 14 }} /> 🧬 EVOLUTION
            </div>
            <div style={{ color: '#cbd5e1' }}>Full battery triggers mutated offspring.</div>
          </div>
        </div>

        {/* Big Start Button */}
        <button
          onClick={onStartGame}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            fontSize: '1.25rem',
            fontWeight: 800,
            fontFamily: "'JetBrains Mono', monospace",
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        >
          <Play style={{ width: 28, height: 28, fill: 'currentColor' }} />
          <span>START GAME NOW</span>
        </button>

        <button
          onClick={onOpenGuide}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: -4
          }}
        >
          <HelpCircle style={{ width: 14, height: 14 }} />
          <span>Need help? Read Quick Guide</span>
        </button>
      </div>
    </div>
  );
};
